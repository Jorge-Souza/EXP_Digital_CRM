import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { AlunoEtapa } from "@/lib/types"

function computeEtapa(tipos: string[]): AlunoEtapa {
  if (tipos.includes("mentoria")) return "avancado"
  if (tipos.includes("core")) return "core"
  if (tipos.includes("lowticket")) return "entrada"
  return "lead"
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  let p: Record<string, unknown>
  try {
    p = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 })
  }

  // Kiwify payload is flat — all fields at root level
  // event field is empty; status field determines the event type
  const status = (p.status ?? p.order_status ?? "") as string
  const eventField = (p.event ?? p.webhook_event ?? p.type ?? "") as string

  const isPurchaseApproved =
    status === "paid" || status === "active" ||
    eventField === "purchase.approved" || eventField === "purchase_approved"

  const isRefunded =
    status === "refunded" ||
    eventField === "purchase.refunded" || eventField === "purchase_refunded"

  const isChargeback =
    status === "chargedback" || status === "chargeback" ||
    eventField === "purchase.chargeback" || eventField === "purchase_chargeback"

  const isAbandonedCart =
    eventField === "abandoned_cart" || eventField === "cart.abandoned" ||
    p.abandoned_cart != null || status === "abandoned"

  console.log("[kiwify webhook]", JSON.stringify({
    status,
    event: eventField,
    isPurchaseApproved,
    isRefunded,
    isChargeback,
    isAbandonedCart,
    keys: Object.keys(p),
  }))

  const supabase = createAdminClient()

  if (isPurchaseApproved) {
    // Flat payload fields
    const email = (p.email ?? p.customer_email) as string
    const nome = (p.name ?? p.full_name ?? p.first_name ?? email) as string
    const telefone = (p.phone ?? p.customer_phone) as string | undefined
    const kiwifyCustomerId = (p.id ?? p.customer_id) as string | undefined
    const kiwifyOrderId = (p.order_id ?? p.transaction_id ?? p.id) as string
    const kiwifyProductId = (p.product_id) as string

    const valorBruto = Number(p.product_price ?? p.amount ?? p.value ?? 0)
    const valorLiquido = p.net_amount != null ? Number(p.net_amount) : null
    const taxaGateway = p.gateway_fee != null ? Number(p.gateway_fee) : null
    const valorAfiliado = p.affiliate_value != null ? Number(p.affiliate_value) : null
    const imposto = p.tax_value != null ? Number(p.tax_value) : null
    const paymentMethod = (p.payment_method ?? p.payment_type) as string | undefined
    const utmSource = (p.utm_source ?? p.src) as string | undefined
    const utmMedium = p.utm_medium as string | undefined

    if (!email) {
      console.error("[kiwify webhook] missing email in payload")
      return NextResponse.json({ ok: true })
    }

    const { data: aluno, error: alunoErr } = await supabase
      .from("alunos")
      .upsert({
        nome,
        email,
        telefone: telefone ?? null,
        kiwify_customer_id: kiwifyCustomerId ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "email" })
      .select("id")
      .single()

    if (alunoErr || !aluno) {
      console.error("Erro upsert aluno:", alunoErr)
      return NextResponse.json({ error: "Erro ao salvar aluno" }, { status: 500 })
    }

    const { data: produtoRow } = await supabase
      .from("produtos_tiktok")
      .select("id, tipo")
      .eq("kiwify_product_id", kiwifyProductId)
      .single()

    await supabase.from("compras_alunos").upsert({
      aluno_id: aluno.id,
      produto_id: produtoRow?.id ?? null,
      status: "ativo",
      kiwify_order_id: kiwifyOrderId,
      valor: valorBruto,
      valor_bruto: valorBruto,
      valor_liquido: valorLiquido,
      taxa_gateway: taxaGateway,
      valor_afiliado: valorAfiliado,
      imposto: imposto,
      payment_method: paymentMethod ?? null,
      utm_source: utmSource ?? null,
      utm_medium: utmMedium ?? null,
      data_compra: new Date().toISOString(),
    }, { onConflict: "kiwify_order_id" })

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

  if (isRefunded || isChargeback) {
    const kiwifyOrderId = (p.order_id ?? p.transaction_id) as string
    const newStatus = isChargeback ? "chargeback" : "reembolsado"
    if (kiwifyOrderId) {
      await supabase.from("compras_alunos").update({ status: newStatus }).eq("kiwify_order_id", kiwifyOrderId)
    }
  }

  if (isAbandonedCart) {
    const email = (p.email ?? p.customer_email) as string
    const nome = (p.name ?? p.full_name ?? p.first_name ?? email) as string
    const telefone = (p.phone ?? p.customer_phone) as string | undefined
    const kiwifyProductId = p.product_id as string
    const checkoutId = (p.checkout_id ?? p.id) as string | undefined

    if (email) {
      const { data: aluno } = await supabase
        .from("alunos")
        .upsert({ nome, email, telefone: telefone ?? null, updated_at: new Date().toISOString() }, { onConflict: "email" })
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
  }

  return NextResponse.json({ ok: true })
}
