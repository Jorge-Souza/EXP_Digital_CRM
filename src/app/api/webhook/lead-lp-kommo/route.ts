import { NextRequest, NextResponse } from "next/server"

// Chamado pelo trigger do Supabase (tabela leads_lp) a cada lead completo (status "novo")
// da landing page gestao.tiktokshopbr.com.br. Cria o lead + contato no Kommo e anexa
// uma nota com as respostas de qualificação.
// Payload: { secret, nome, email, telefone, empresa, instagram, cidade, uf, segmento,
//            vende_online, skus, faturamento, conta_tiktok, quem_grava, score, faixa,
//            utm_source, utm_medium, utm_campaign, pagina }

const KOMMO_API_BASE = `https://${process.env.KOMMO_API_DOMAIN ?? "api-c.kommo.com"}/api/v4`

export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => null)
  if (!payload) return NextResponse.json({ error: "Payload inválido" }, { status: 400 })

  const secret = process.env.LEAD_WEBHOOK_SECRET
  if (secret && payload.secret !== secret) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const token = process.env.KOMMO_ACCESS_TOKEN
  if (!token) {
    console.error("[lead-lp-kommo] KOMMO_ACCESS_TOKEN não configurado")
    return NextResponse.json({ error: "Integração Kommo não configurada" }, { status: 500 })
  }

  const nome = (payload.nome as string) || "Lead sem nome"
  const nomeLead = payload.empresa ? `${nome} — ${payload.empresa}` : `${nome} (LP TikTok Shop)`

  const kommoRes = await fetch(`${KOMMO_API_BASE}/leads/complex`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      {
        name: nomeLead,
        _embedded: {
          contacts: [
            {
              name: nome,
              custom_fields_values: [
                ...(payload.telefone
                  ? [{ field_code: "PHONE", values: [{ value: payload.telefone, enum_code: "WORK" }] }]
                  : []),
                ...(payload.email
                  ? [{ field_code: "EMAIL", values: [{ value: payload.email, enum_code: "WORK" }] }]
                  : []),
              ],
            },
          ],
          tags: [{ name: "lp-tiktokshop" }],
        },
      },
    ]),
  })

  if (!kommoRes.ok) {
    const errText = await kommoRes.text().catch(() => "")
    console.error("[lead-lp-kommo] falha ao criar lead:", kommoRes.status, errText.slice(0, 500))
    return NextResponse.json({ error: "Falha ao criar lead no Kommo" }, { status: 502 })
  }

  const kommoData = await kommoRes.json().catch(() => null)
  const leadId = kommoData?._embedded?.leads?.[0]?.id
  if (!leadId) {
    console.error("[lead-lp-kommo] resposta sem id de lead:", JSON.stringify(kommoData).slice(0, 500))
    return NextResponse.json({ ok: true, warning: "lead criado sem id retornado" })
  }

  const nota = [
    `Origem: landing page gestao.tiktokshopbr.com.br`,
    `Instagram: ${payload.instagram || "-"}`,
    `Cidade/UF: ${payload.cidade || "-"}/${payload.uf || "-"}`,
    `Segmento: ${payload.segmento || "-"}`,
    `Já vende online: ${payload.vende_online || "-"}`,
    `Produtos no catálogo: ${payload.skus || "-"}`,
    `Faturamento por mês: ${payload.faturamento || "-"}`,
    `Situação no TikTok Shop: ${payload.conta_tiktok || "-"}`,
    `Quem grava os vídeos: ${payload.quem_grava || "-"}`,
    `Score: ${payload.score ?? "-"} (Faixa ${payload.faixa || "-"})`,
    `UTM: ${payload.utm_source || "-"} / ${payload.utm_medium || "-"} / ${payload.utm_campaign || "-"}`,
    `Página: ${payload.pagina || "-"}`,
  ].join("\n")

  const notaRes = await fetch(`${KOMMO_API_BASE}/leads/${leadId}/notes`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([{ note_type: "common", params: { text: nota } }]),
  })

  if (!notaRes.ok) {
    const errText = await notaRes.text().catch(() => "")
    console.error("[lead-lp-kommo] lead criado mas falha ao anexar nota:", notaRes.status, errText.slice(0, 500))
  }

  return NextResponse.json({ ok: true, leadId })
}
