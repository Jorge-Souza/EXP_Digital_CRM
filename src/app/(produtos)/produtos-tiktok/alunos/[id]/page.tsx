import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlunoDetalheActions } from "@/components/aluno-detalhe-actions"
import { LeadPipelinePainel } from "@/components/lead-pipeline-painel"
import { SCORE_DISPLAY } from "@/lib/form-score"
import type { Aluno, CompraAluno, CarrinhoAbandonado, NotaAluno, AlunoEtapa, ScoreLabel, InteracaoComercial, TarefaSdr } from "@/lib/types"

const etapaCor: Record<AlunoEtapa, string> = {
  lead: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  entrada: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  core: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  avancado: "bg-green-500/20 text-green-400 border-green-500/30",
}

const etapaLabel: Record<AlunoEtapa, string> = {
  lead: "Lead",
  entrada: "Entrada",
  core: "Core",
  avancado: "Avançado",
}

const proximaEtapa: Record<AlunoEtapa, string | null> = {
  lead: "Comprar Low-ticket de entrada",
  entrada: "Adquirir Protocolo TikTok Shop (Core)",
  core: "Entrar em Mentoria",
  avancado: null,
}

function whatsappUrl(phone: string) {
  const digits = phone.replace(/\D/g, "")
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`
  return `https://wa.me/${withCountry}`
}

function WhatsappButton({ phone }: { phone: string }) {
  return (
    <a
      href={whatsappUrl(phone)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-green-500/15 text-green-500 border border-green-500/30 hover:bg-green-500/25 transition-colors"
    >
      💬 Falar no WhatsApp
    </a>
  )
}

function FormField({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="space-y-0.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  )
}

export default async function AlunoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  const { data: isVendas } = await supabase.rpc("current_user_is_vendas")
  if (!isAdmin && !isVendas) redirect("/hub")

  const { id } = await params
  const admin = createAdminClient()

  const [
    { data: aluno },
    { data: compras },
    { data: carrinhos },
    { data: notas },
    { data: resposta },
    { data: interacoesComerciais },
    { data: tarefasSdr },
    { data: responsaveis },
  ] = await Promise.all([
    admin.from("alunos").select("*").eq("id", id).single(),
    admin.from("compras_alunos").select("*, produtos_tiktok(id, nome, tipo)").eq("aluno_id", id).order("data_compra", { ascending: false }),
    admin.from("carrinhos_abandonados").select("*, produtos_tiktok(id, nome, tipo)").eq("aluno_id", id).order("data_abandono", { ascending: false }),
    admin.from("notas_alunos").select("*, profiles(nome)").eq("aluno_id", id).order("created_at", { ascending: false }),
    admin.from("respostas_formulario").select("*").eq("aluno_id", id).maybeSingle(),
    admin.from("interacoes_comerciais").select("*, profiles(nome)").eq("aluno_id", id).order("data", { ascending: false }),
    admin.from("tarefas_sdr").select("*").eq("aluno_id", id).order("data_prazo", { ascending: true }),
    admin.from("profiles").select("id, nome").in("role", ["admin", "vendas"]).order("nome"),
  ])

  if (!aluno) notFound()

  const a = aluno as Aluno & {
    score: number; score_label: ScoreLabel; whatsapp?: string; instagram?: string; tem_formulario?: boolean
    etapa_pipeline: string; score_comercial: number; proxima_melhor_oferta: string | null
    responsavel_id: string | null; tipo_lead: string | null
  }
  const proxima = proximaEtapa[a.etapa]
  const scoreInfo = SCORE_DISPLAY[a.score_label ?? 'sem_dados']

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{a.nome}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-sm text-muted-foreground">{a.email}</span>
            {a.telefone && <span className="text-sm text-muted-foreground">· {a.telefone}</span>}
            {a.instagram && <span className="text-sm text-muted-foreground">· @{a.instagram.replace('@','')}</span>}
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${etapaCor[a.etapa]}`}>
              {etapaLabel[a.etapa]}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${scoreInfo.cor}`}>
              {scoreInfo.emoji} {scoreInfo.label} {a.score > 0 && `(${a.score} pts)`}
            </span>
            {a.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
            {(a.whatsapp || a.telefone) && <WhatsappButton phone={a.whatsapp || a.telefone!} />}
          </div>
        </div>
        <AlunoDetalheActions alunoId={a.id} tags={a.tags} />
      </div>

      <LeadPipelinePainel
        alunoId={a.id}
        etapaPipeline={a.etapa_pipeline}
        tipoLead={a.tipo_lead}
        scoreComercial={a.score_comercial}
        proximaMelhorOferta={a.proxima_melhor_oferta}
        responsavelId={a.responsavel_id}
        responsaveis={responsaveis ?? []}
        interacoes={(interacoesComerciais ?? []) as InteracaoComercial[]}
        tarefas={(tarefasSdr ?? []) as TarefaSdr[]}
      />

      {proxima && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="py-3 text-sm flex items-center gap-2">
            <span className="text-yellow-500">↑</span>
            <span><strong>Próxima ascensão:</strong> {proxima}</span>
          </CardContent>
        </Card>
      )}

      {resposta && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Formulário de seleção
              <span className={`text-xs px-2 py-0.5 rounded-full border font-normal ${scoreInfo.cor}`}>
                {scoreInfo.emoji} {scoreInfo.label} · {a.score} pts
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nicho pretendido" value={resposta.nicho} />
            <FormField label="Tipo de venda" value={resposta.tipo_venda} />
            <FormField label="Faturamento atual" value={resposta.faturamento} />
            <FormField label="Já vende em plataforma" value={resposta.ja_vende_plataforma} />
            <FormField label="Cria vídeos" value={resposta.cria_videos} />
            <FormField label="Nível técnico" value={resposta.nivel_tecnico} />
            <FormField label="Executa missões" value={resposta.executa_missoes} />
            <FormField label="Tempo de execução" value={resposta.tempo_execucao} />
            <div className={`col-span-full p-3 rounded-md border ${resposta.interesse_4500?.startsWith('Sim') ? 'border-green-500/40 bg-green-500/5' : 'border-border'}`}>
              <div className="text-xs text-muted-foreground mb-1">Interesse em mentoria individual (R$4.500)</div>
              <div className="text-sm font-medium">{resposta.interesse_4500 ?? '—'}</div>
            </div>
            <div className={`col-span-full p-3 rounded-md border ${resposta.interesse_297?.startsWith('Sim') ? 'border-green-500/40 bg-green-500/5' : 'border-border'}`}>
              <div className="text-xs text-muted-foreground mb-1">Interesse em aceleração 90 dias (R$297)</div>
              <div className="text-sm font-medium">{resposta.interesse_297 ?? '—'}</div>
            </div>
            {resposta.dificuldade_tiktok && (
              <div className="col-span-full space-y-0.5">
                <div className="text-xs text-muted-foreground">Maior dificuldade no TikTok Shop</div>
                <div className="text-sm">{resposta.dificuldade_tiktok}</div>
              </div>
            )}
            {resposta.dor_tiktok && (
              <div className="col-span-full space-y-0.5">
                <div className="text-xs text-muted-foreground">Maior dor</div>
                <div className="text-sm">{resposta.dor_tiktok}</div>
              </div>
            )}
            {resposta.mural_futuro && (
              <div className="col-span-full space-y-0.5">
                <div className="text-xs text-muted-foreground">Mural do Futuro</div>
                <div className="text-sm italic text-muted-foreground">"{resposta.mural_futuro}"</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!resposta && (
        <Card className="border-dashed">
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            Este aluno ainda não preencheu o formulário de seleção.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Compras ({compras?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {!compras || compras.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma compra registrada.</p>
          ) : (
            <div className="space-y-3">
              {(compras as CompraAluno[]).map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <div className="font-medium">{(c.produto as { nome: string } | undefined)?.nome ?? "Produto removido"}</div>
                    <div className="text-xs text-muted-foreground">{new Date(c.data_compra).toLocaleDateString("pt-BR")}</div>
                  </div>
                  <div className="text-right">
                    <div>{c.valor?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ?? "—"}</div>
                    <span className={`text-xs ${c.status === "ativo" ? "text-green-500" : "text-red-400"}`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {carrinhos && carrinhos.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Carrinhos Abandonados ({carrinhos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(carrinhos as CarrinhoAbandonado[]).map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <span>{(c.produto as { nome: string } | undefined)?.nome ?? "Produto removido"}</span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(c.data_abandono).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Notas do Admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AlunoDetalheActions alunoId={a.id} tags={a.tags} mode="nota" />
          {!notas || notas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma nota ainda.</p>
          ) : (
            <div className="space-y-3">
              {(notas as NotaAluno[]).map((n) => (
                <div key={n.id} className="text-sm border-b pb-3 last:border-0 last:pb-0">
                  <p>{n.texto}</p>
                  <span className="text-xs text-muted-foreground">
                    {(n.admin as { nome: string } | undefined)?.nome ?? "Admin"} · {new Date(n.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
