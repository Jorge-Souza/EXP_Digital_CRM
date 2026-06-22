import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ShoppingCart, TrendingUp, FileText, BookOpen } from "lucide-react"

export default async function ProdutosTiktokPage({ searchParams }: { searchParams: Promise<{ produto?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) redirect("/produtos-tiktok/alunos")

  const params = await searchParams
  const admin = createAdminClient()

  const [
    { count: totalAlunos },
    { count: totalFormularios },
    { count: carrinhos },
    { data: compras },
    { data: etapas },
    { data: produtos },
  ] = await Promise.all([
    admin.from("alunos").select("*", { count: "exact", head: true }),
    admin.from("alunos").select("*", { count: "exact", head: true }).eq("tem_formulario", true),
    admin.from("carrinhos_abandonados").select("*", { count: "exact", head: true }),
    admin.from("compras_alunos")
      .select("valor, produto_id, aluno_id, data_compra, status, produtos_tiktok(id, nome, tipo), alunos(nome, email)")
      .order("data_compra", { ascending: false }),
    admin.from("alunos").select("etapa"),
    admin.from("produtos_tiktok").select("id, nome, tipo").eq("ativo", true).order("nome"),
  ])

  type Compra = {
    valor: number | null
    produto_id: string | null
    aluno_id: string | null
    data_compra: string
    status: string
    produtos_tiktok: { id: string; nome: string; tipo: string } | null
    alunos: { nome: string; email: string } | null
  }

  const comprasList = (compras ?? []) as unknown as Compra[]

  // Alunos em algum curso (com pelo menos 1 compra ativa)
  const alunosComCompra = new Set(comprasList.filter(c => c.status === "ativo").map(c => c.aluno_id)).size

  const receitaTotal = comprasList.filter(c => c.status === "ativo").reduce((sum, c) => sum + (c.valor ?? 0), 0)

  // Agrupa por produto
  const porProduto: Record<string, { id: string; nome: string; vendas: number; receita: number }> = {}
  for (const c of comprasList.filter(c => c.status === "ativo")) {
    const pt = c.produtos_tiktok
    const id = pt?.id ?? "sem-produto"
    const nome = pt?.nome ?? "Produto removido"
    if (!porProduto[id]) porProduto[id] = { id, nome, vendas: 0, receita: 0 }
    porProduto[id].vendas++
    porProduto[id].receita += c.valor ?? 0
  }

  // Filtra histórico se produto selecionado
  const comprasFiltradas = params.produto
    ? comprasList.filter(c => c.produto_id === params.produto)
    : comprasList

  const etapaLabel: Record<string, string> = { lead: "Leads", entrada: "Entrada", core: "Core", avancado: "Avançado" }
  const etapaCount: Record<string, number> = {}
  for (const e of etapas ?? []) etapaCount[e.etapa] = (etapaCount[e.etapa] ?? 0) + 1

  const produtoAtivo = params.produto ? (produtos ?? []).find(p => p.id === params.produto) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">TikTok Shop</h1>
          <p className="text-sm text-muted-foreground">Gestão de alunos e infoprodutos</p>
        </div>
        <div className="flex gap-2">
          <Link href="/produtos-tiktok/alunos" className="text-sm px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Ver alunos
          </Link>
          <Link href="/produtos-tiktok/produtos" className="text-sm px-4 py-2 rounded-md border hover:bg-accent transition-colors">
            Produtos
          </Link>
        </div>
      </div>

      {/* Cards métricas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAlunos ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">na base completa</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responderam Formulário</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFormularios ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">com dados de qualificação</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos em Cursos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alunosComCompra}</div>
            <p className="text-xs text-muted-foreground mt-1">com pelo menos 1 compra ativa</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {receitaTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">compras ativas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Vendas por Produto */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vendas por Produto</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.values(porProduto).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma venda registrada ainda.</p>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/produtos-tiktok"
                  className={`flex items-center justify-between text-sm px-2 py-1.5 rounded-md transition-colors ${!params.produto ? "bg-primary/10 text-primary font-medium" : "hover:bg-accent"}`}
                >
                  <span>Todos os produtos</span>
                  <span className="text-muted-foreground">{comprasList.length} vendas</span>
                </Link>
                {Object.values(porProduto).sort((a, b) => b.receita - a.receita).map((p) => (
                  <Link
                    key={p.id}
                    href={`/produtos-tiktok?produto=${p.id}`}
                    className={`flex items-center justify-between text-sm px-2 py-1.5 rounded-md transition-colors ${params.produto === p.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-accent"}`}
                  >
                    <span>{p.nome}</span>
                    <div className="text-right text-xs">
                      <span className="text-muted-foreground mr-2">{p.vendas} vendas</span>
                      <span className="font-semibold">{p.receita.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alunos por Etapa */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alunos por Etapa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {["lead", "entrada", "core", "avancado"].map((etapa) => (
                <Link key={etapa} href={`/produtos-tiktok/alunos?etapa=${etapa}`} className="flex items-center justify-between text-sm hover:text-primary transition-colors">
                  <span>{etapaLabel[etapa]}</span>
                  <span className="font-semibold">{etapaCount[etapa] ?? 0}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Carrinhos abandonados */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Carrinhos Abandonados</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{carrinhos ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">oportunidades de recuperação</p>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de vendas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Histórico de Vendas
            {produtoAtivo && <span className="ml-2 text-sm font-normal text-muted-foreground">— {produtoAtivo.nome}</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {comprasFiltradas.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">Nenhuma venda encontrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Aluno</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Produto</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Data</th>
                    <th className="text-right px-4 py-3 font-medium">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {comprasFiltradas.slice(0, 50).map((c, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium">{c.alunos?.nome ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{c.alunos?.email ?? "—"}</div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                        {c.produtos_tiktok?.nome ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                          c.status === "ativo" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                          c.status === "reembolsado" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                          "bg-red-500/20 text-red-400 border-red-500/30"
                        }`}>
                          {c.status === "ativo" ? "Ativo" : c.status === "reembolsado" ? "Reembolsado" : "Chargeback"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                        {new Date(c.data_compra).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {c.valor != null ? c.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {comprasFiltradas.length > 50 && (
                <p className="text-xs text-muted-foreground text-center py-3">Mostrando 50 de {comprasFiltradas.length} vendas</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
