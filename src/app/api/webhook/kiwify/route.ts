import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import crypto from "crypto"
import type { AlunoEtapa } from "@/lib/types"

function verifySignature(body: string, signature: string | null): boolean {
  const secret = process.env.KIWIFY_WEBHOOK_SECRET
  if (!secret || !signature) return false
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex")
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

function computeEtapa(tipos: string[]): AlunoEtapa {
  if (tipos.includes("mentoria")) return "avancado"
  if (tipos.includes("core")) return "core"
  if (tipos.includes("lowticket")) return "entrada"
  return "lead"
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get("X-Kiwify-Signature")

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 })
  }

  const supabase = createAdminClient()
  const event = payload.event as string

  if (event === "purchase.approved") {
    const order = payload.order as Record<string, unknown>
    const customer = payload.customer as Record<string, unknown>
    const product = payload.product as Record<string, unknown>

    const email = customer?.email as string
    const nome = customer?.full_name as string
    const telefone = customer?.phone as string | undefined
    const kiwifyCustomerId = customer?.id as string | undefined
    const kiwifyOrderId = order?.id as string
    const valor = Number(order?.amount ?? 0) / 100
    const kiwifyProductId = product?.id as string

    // Upsert aluno
    const { data: aluno, error: alunoErr } = await supabase
      .from("alunos")
      .upsert({ nome, email, telefone: telefone ?? null, kiwify_customer_id: kiwifyCustomerId ?? null, updated_at: new Date().toISOString() }, { onConflict: "email" })
      .select("id")
      .single()

    if (alunoErr || !aluno) {
      console.error("Erro upsert aluno:", alunoErr)
      return NextResponse.json({ error: "Erro ao salvar aluno" }, { status: 500 })
    }

    // Buscar produto pelo kiwify_product_id
    const { data: produtoRow } = await supabase
      .from("produtos_tiktok")
      .select("id, tipo")
      .eq("kiwify_product_id", kiwifyProductId)
      .single()

    // Registrar compra
    await supabase.from("compras_alunos").upsert({
      aluno_id: aluno.id,
      produto_id: produtoRow?.id ?? null,
      status: "ativo",
      kiwify_order_id: kiwifyOrderId,
      valor,
      data_compra: new Date().toISOString(),
    }, { onConflict: "kiwify_order_id" })

    // Recalcular etapa: buscar todos os tipos de compras ativas desse aluno
    const { data: compras } = await supabase
      .from("compras_alunos")
      .select("produto_id, produtos_tiktok(tipo)")
      .eq("aluno_id", aluno.id)
      .eq("status", "ativo")

    const tipos = (compras ?? []).flatMap((c: Record<string, unknown>) => {
      const pt = c.produtos_tiktok as { tipo: string } | null
      return pt?.tipo ? [pt.tipo] : []
    })
    if (produtoRow?.tipo) tipos.push(produtoRow.tipo)

    const etapa = computeEtapa(tipos)
    await supabase.from("alunos").update({ etapa, updated_at: new Date().toISOString() }).eq("id", aluno.id)
  }

  if (event === "purchase.refunded" || event === "purchase.chargeback") {
    const order = payload.order as Record<string, unknown>
    const kiwifyOrderId = order?.id as string
    const newStatus = event === "purchase.chargeback" ? "chargeback" : "reembolsado"

    await supabase.from("compras_alunos").update({ status: newStatus }).eq("kiwify_order_id", kiwifyOrderId)
  }

  if (event === "abandoned_cart") {
    const customer = payload.customer as Record<string, unknown>
    const product = payload.product as Record<string, unknown>
    const checkoutId = (payload.checkout as Record<string, unknown>)?.id as string | undefined

    const email = customer?.email as string
    const nome = (customer?.full_name as string) ?? email
    const kiwifyProductId = product?.id as string

    const { data: aluno } = await supabase
      .from("alunos")
      .upsert({ nome, email, updated_at: new Date().toISOString() }, { onConflict: "email" })
      .select("id")
      .single()

    if (aluno) {
      const { data: produtoRow } = await supabase
        .from("produtos_tiktok")
        .select("id")
        .eq("kiwify_product_id", kiwifyProductId)
        .single()

      await supabase.from("carrinhos_abandonados").insert({
        aluno_id: aluno.id,
        produto_id: produtoRow?.id ?? null,
        kiwify_checkout_id: checkoutId ?? null,
        data_abandono: new Date().toISOString(),
      })
    }
  }

  return NextResponse.json({ ok: true })
}
