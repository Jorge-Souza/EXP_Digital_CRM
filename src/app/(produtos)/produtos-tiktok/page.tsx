import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ShoppingCart, TrendingUp, Package } from "lucide-react"

export default async function ProdutosTiktokPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) redirect("/hub")

  const admin = createAdminClient()

  const [
    { count: totalAlunos },
    { count: carrinhos },
    { data: vendasPorProduto },
    { data: etapas },
  ] = await Promise.all([
    admin.from("alunos").select("*", { count: "exact", head: true }),
    admin.from("carrinhos_abandonados").select("*", { count: "exact", head: true }),
    admin.from("compras_alunos")
      .select("valor, produto_id, produtos_tiktok(nome, tipo)")
      .eq("status", "ativo"),
    admin.from("alunos").select("etapa"),
  ])

  const receitaTotal = (vendasPorProduto ?? []).reduce((sum, c) => sum + (c.valor ?? 0), 0)

  const porProduto: Record<string, { nome: string; vendas: number; receita: number }> = {}
  for (const c of vendasPorProduto ?? []) {
    const pt = c.produtos_tiktok as { nome: string; tipo: string } | null
    const nome = pt?.nome ?? "Produto removido"
    if (!porProduto[nome]) porProduto[nome] = { nome, vendas: 0, receita: 0 }
    porProduto[nome].vendas++
    porProduto[nome].receita += c.valor ?? 0
  }

  const noCore = (etapas ?? []).filter((e) => e.etapa === "core" || e.etapa === "avancado").length

  const etapaLabel: Record<string, string> = {
    lead: "Leads",
    entrada: "Entrada",
    core: "Core",
    avancado: "Avançado",
  }
  const etapaCount: Record<string, number> = {}
  for (const e of etapas ?? []) {
    etapaCount[e.etapa] = (etapaCount[e.etapa] ?? 0) + 1
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAlunos ?? 0}</div>
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
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carrinhos Abandonados</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{carrinhos ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Core / Avançado</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{noCore}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vendas por Produto</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.values(porProduto).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma venda registrada ainda.</p>
            ) : (
              <div className="space-y-3">
                {Object.values(porProduto).sort((a, b) => b.receita - a.receita).map((p) => (
                  <div key={p.nome} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{p.nome}</span>
                    <div className="text-right">
                      <span className="text-muted-foreground mr-3">{p.vendas} vendas</span>
                      <span className="font-semibold">
                        {p.receita.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alunos por Etapa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {["lead", "entrada", "core", "avancado"].map((etapa) => (
                <div key={etapa} className="flex items-center justify-between text-sm">
                  <span>{etapaLabel[etapa]}</span>
                  <span className="font-semibold">{etapaCount[etapa] ?? 0}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
