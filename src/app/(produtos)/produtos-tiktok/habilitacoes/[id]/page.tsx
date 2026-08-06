import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, ExternalLink } from "lucide-react"

type Produto = {
  nome: string; descricao?: string; sku?: string; ncm: string
  preco: string; custo?: string; unidade: string; estoque: string; marca?: string
  comprimento?: string; largura?: string; altura?: string; peso?: string
  fotos?: string[]; tem_variacao?: boolean
  variacoes?: { tipo: string; itens: string; preco: string; imagem_url: string }[]
}

type Hab = {
  id: string; email: string; status: string | null; etapa_atual: number | null
  created_at: string; termos_aceitos_at: string | null
  aceito_privacidade: boolean | null; aceito_uso_imagem: boolean | null; aceito_divulgacao: boolean | null
  nome_empresa: string | null; cnpj: string | null; data_constituicao: string | null
  endereco_comercial: string | null; cnpj_doc_url: string | null
  rep_nome: string | null; rep_data_nascimento: string | null
  rep_nacionalidade: string | null; rep_endereco: string | null
  rep_comprovante_url: string | null; tipo_documento: string | null
  doc_frente_url: string | null; selfie_url: string | null; selfie_doc_url: string | null
  ja_habilitou_loja: boolean | null
  etapa1_pulada: boolean | null
  inscricao_estadual: string | null; nicho: string | null; subnicho: string | null
  certificado_url: string | null; senha_certificado: string | null
  produtos: Produto[] | null
}

function fmt(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function FieldItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm">{value ?? <span className="text-muted-foreground italic">Não preenchido</span>}</p>
    </div>
  )
}

function FileLink({ label, url }: { label: string; url: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      {url ? (
        <div className="flex gap-2">
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-purple-500/10 text-purple-700 border-purple-500/30 hover:bg-purple-500/20 transition-colors">
            <ExternalLink size={12} />
            Visualizar
          </a>
          <a href={url} download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-green-500/10 text-green-700 border-green-500/30 hover:bg-green-500/20 transition-colors">
            <Download size={12} />
            Baixar
          </a>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">Não enviado</p>
      )}
    </div>
  )
}

const STATUS_COR: Record<string, string> = {
  enviado:    "bg-green-500/15 text-green-700 border-green-500/30",
  em_analise: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30",
  aprovado:   "bg-green-500/15 text-green-700 border-green-500/30",
  reprovado:  "bg-red-500/15 text-red-600 border-red-500/30",
  pendente:   "bg-gray-500/10 text-gray-500 border-gray-400/20",
}
const STATUS_LABEL: Record<string, string> = {
  enviado: "Enviado", em_analise: "Em análise", aprovado: "Aprovado",
  reprovado: "Reprovado", pendente: "Pendente",
}

export default async function HabilitacaoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) redirect("/produtos-tiktok/alunos")

  const admin = createAdminClient()
  const { data } = await admin.from("habilitacoes").select("*").eq("id", id).maybeSingle()
  if (!data) notFound()

  const h = data as Hab
  const statusKey = h.status ?? "pendente"

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Voltar + cabeçalho */}
      <div>
        <Link href="/produtos-tiktok/habilitacoes"
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-4 transition-colors">
          <ArrowLeft size={14} />
          Voltar para Habilitações
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {h.nome_empresa ?? <span className="text-muted-foreground italic font-normal">Empresa sem nome</span>}
            </h1>
            <p className="text-sm text-muted-foreground">{h.email}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className={`${STATUS_COR[statusKey] ?? STATUS_COR.pendente}`}>
              {STATUS_LABEL[statusKey] ?? "Pendente"}
            </Badge>
            <span className="text-xs text-muted-foreground">Cadastro: {fmt(h.created_at)}</span>
          </div>
        </div>
      </div>

      {h.etapa1_pulada && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
          <p className="text-sm font-semibold text-yellow-700">⏭️ Cliente pulou a Etapa 1 (Empresa/Representante)</p>
          <p className="text-xs text-muted-foreground mt-0.5">Esses dados precisam ser coletados manualmente pela equipe (WhatsApp/planilha).</p>
        </div>
      )}

      {/* Empresa */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">🏢 Informações da Empresa</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-8 gap-y-4">
          <FieldItem label="Razão social" value={h.nome_empresa} />
          <FieldItem label="CNPJ" value={h.cnpj} />
          <FieldItem label="Data de constituição" value={h.data_constituicao} />
          <FieldItem label="Endereço comercial" value={h.endereco_comercial} />
          <div className="col-span-2">
            <FileLink label="Comprovante CNPJ" url={h.cnpj_doc_url} />
          </div>
        </CardContent>
      </Card>

      {/* Representante */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">👤 Representante Legal</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-8 gap-y-4">
          <FieldItem label="Nome civil completo" value={h.rep_nome} />
          <FieldItem label="Data de nascimento" value={h.rep_data_nascimento} />
          <FieldItem label="Nacionalidade" value={h.rep_nacionalidade} />
          <FieldItem label="Endereço residencial" value={h.rep_endereco} />
          <div className="col-span-2">
            <FileLink label="Comprovante de residência" url={h.rep_comprovante_url} />
          </div>
        </CardContent>
      </Card>

      {/* Documentos de identidade */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">🪪 Documentos de Identidade</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-8 gap-y-4">
          {h.ja_habilitou_loja ? (
            <div className="col-span-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
              <p className="text-sm font-semibold text-green-700">✅ Cliente já habilitou a loja por conta própria</p>
              <p className="text-xs text-muted-foreground mt-0.5">Não enviou documentos de identidade — marcou essa opção no formulário.</p>
            </div>
          ) : (
            <>
              <FieldItem label="Tipo de documento" value={h.tipo_documento} />
              <div />
              <FileLink label={`${h.tipo_documento ?? "Documento"} – frente`} url={h.doc_frente_url} />
              <FileLink label="Selfie do titular" url={h.selfie_url} />
              <div className="col-span-2">
                <FileLink label="Selfie com o documento" url={h.selfie_doc_url} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Loja */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">🏪 Dados da Loja</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-8 gap-y-4">
          {h.ja_habilitou_loja ? (
            <div className="col-span-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
              <p className="text-sm font-semibold text-green-700">✅ Cliente já habilitou a loja por conta própria</p>
              <p className="text-xs text-muted-foreground mt-0.5">Não preencheu os dados fiscais/certificado — marcou essa opção no formulário.</p>
            </div>
          ) : (
            <>
              <FieldItem label="Inscrição estadual" value={h.inscricao_estadual} />
              <FieldItem label="Nicho" value={h.nicho} />
              <FieldItem label="Subnicho" value={h.subnicho} />
              <div />
              <FileLink label="Certificado digital A1" url={h.certificado_url} />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-0.5">Senha do certificado</p>
                {h.senha_certificado
                  ? <p className="text-sm font-mono bg-muted px-2 py-1 rounded w-fit">{h.senha_certificado}</p>
                  : <p className="text-sm text-muted-foreground italic">Não informado</p>
                }
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Termos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">✅ Aceite de Termos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <FieldItem label="Termos aceitos em" value={fmt(h.termos_aceitos_at)} />
            <FieldItem label="Etapa atual" value={h.etapa_atual != null ? `Etapa ${h.etapa_atual} de 3` : "—"} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Privacidade e dados (LGPD)", aceito: h.aceito_privacidade },
              { label: "Uso de imagem e marca", aceito: h.aceito_uso_imagem },
              { label: "Divulgação do relacionamento", aceito: h.aceito_divulgacao },
            ].map(item => (
              <div key={item.label}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                  item.aceito
                    ? "border-green-500/30 bg-green-500/10 text-green-700"
                    : "border-red-500/30 bg-red-500/10 text-red-600"
                }`}>
                <span>{item.aceito ? "✅" : "❌"}</span>
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Produtos */}
      {h.produtos && h.produtos.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">📦 Produtos ({h.produtos.length})</h2>
          {h.produtos.map((p, i) => (
            <Card key={i} className="border-pink-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span className="bg-pink-500/15 text-pink-700 border border-pink-500/30 rounded px-2 py-0.5 text-xs font-bold">
                    Produto #{i + 1}
                  </span>
                  {p.nome}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  <FieldItem label="Nome" value={p.nome} />
                  <FieldItem label="NCM" value={p.ncm} />
                  <FieldItem label="SKU" value={p.sku} />
                  <FieldItem label="Marca" value={p.marca} />
                  <FieldItem label="Preço de venda" value={p.preco ? `R$ ${p.preco}` : null} />
                  <FieldItem label="Custo" value={p.custo ? `R$ ${p.custo}` : null} />
                  <FieldItem label="Unidade" value={p.unidade} />
                  <FieldItem label="Estoque" value={p.estoque} />
                  <FieldItem label="Comprimento" value={p.comprimento ? `${p.comprimento} cm` : null} />
                  <FieldItem label="Largura" value={p.largura ? `${p.largura} cm` : null} />
                  <FieldItem label="Altura" value={p.altura ? `${p.altura} cm` : null} />
                  <FieldItem label="Peso" value={p.peso ? `${p.peso} kg` : null} />
                  {p.descricao && (
                    <div className="col-span-2">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-0.5">Descrição</p>
                      <p className="text-sm leading-relaxed">{p.descricao}</p>
                    </div>
                  )}
                </div>

                {/* Fotos */}
                {p.fotos && p.fotos.filter(Boolean).length > 0 && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                      Fotos ({p.fotos.filter(Boolean).length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {p.fotos.filter(Boolean).map((url, fi) => (
                        <a key={fi} href={url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border bg-purple-500/10 text-purple-700 border-purple-500/25 hover:bg-purple-500/20 transition-colors">
                          <ExternalLink size={11} />
                          {fi === 0 ? "Capa" : `Foto ${fi + 1}`}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Variações */}
                {p.tem_variacao && p.variacoes && p.variacoes.length > 0 && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Variações</p>
                    <div className="space-y-1.5">
                      {p.variacoes.map((v, vi) => (
                        <div key={vi} className="flex flex-wrap items-center gap-3 px-3 py-2 rounded-lg border bg-muted/50 text-sm">
                          <span className="font-medium text-muted-foreground">{v.tipo}:</span>
                          <span>{v.itens || "—"}</span>
                          {v.preco && <span className="text-muted-foreground">R$ {v.preco}</span>}
                          {v.imagem_url && (
                            <a href={v.imagem_url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-purple-700 hover:underline">
                              <ExternalLink size={10} /> Imagem
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            Nenhum produto cadastrado ainda.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
