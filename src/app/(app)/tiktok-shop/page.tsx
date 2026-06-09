import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, ShoppingBag, Package, Percent } from "lucide-react"
import type { TikTokProduto } from "@/lib/types"

const statusLabel: Record<string, { label: string; class: string }> = {
  rascunho: { label: "Rascunho", class: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5" },
  ativo:    { label: "Ativo",    class: "text-green-400 border-green-400/30 bg-green-400/5" },
  inativo:  { label: "Inativo",  class: "text-gray-400 border-gray-400/30 bg-gray-400/5" },
}

function formatBRL(n: number | null) {
  if (n == null) return "—"
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export default async function TikTokShopPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: produtos } = await supabase
    .from("tiktok_produtos")
    .select("*, client:clients(id, nome, avatar_emoji, cor)")
    .order("created_at", { ascending: false })

  const lista = (produtos ?? []) as TikTokProduto[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-purple-500" />
            TikTok Shop
          </h1>
          <p className="text-muted-foreground">{lista.length} produto(s) cadastrado(s)</p>
        </div>
        <Link href="/tiktok-shop/novo" className={buttonVariants()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Link>
      </div>

      {lista.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <Package className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">Nenhum produto cadastrado ainda.</p>
            <Link href="/tiktok-shop/novo" className={buttonVariants({ variant: "outline" })}>
              Cadastrar primeiro produto
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lista.map((p) => {
            const st = statusLabel[p.status] ?? statusLabel.rascunho
            return (
              <Link key={p.id} href={`/tiktok-shop/${p.id}/editar`}>
                <Card className="hover:border-purple-500/50 hover:shadow-md transition-all cursor-pointer h-full">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {p.client && (
                          <span
                            className="h-7 w-7 rounded-md shrink-0 flex items-center justify-center text-sm"
                            style={{
                              background: p.client.cor ? `${p.client.cor}30` : "rgba(99,102,241,0.2)",
                              border: `1px solid ${p.client.cor ?? "#6366f1"}40`,
                            }}
                          >
                            {p.client.avatar_emoji ?? "🏢"}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold leading-tight truncate">{p.nome}</p>
                          {p.client && (
                            <p className="text-xs text-muted-foreground truncate">{p.client.nome}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className={`shrink-0 text-xs ${st.class}`}>
                        {st.label}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      {p.preco != null && (
                        <div>
                          <span className="text-muted-foreground text-xs">Preço</span>
                          <p className="font-semibold">{formatBRL(p.preco)}</p>
                        </div>
                      )}
                      {p.margem != null && (
                        <div>
                          <span className="text-muted-foreground text-xs flex items-center gap-1">
                            <Percent className="h-3 w-3" /> Margem
                          </span>
                          <p className="font-semibold text-green-400">{p.margem}%</p>
                        </div>
                      )}
                      {p.estoque != null && (
                        <div>
                          <span className="text-muted-foreground text-xs">Estoque</span>
                          <p>{p.estoque} {p.unidade ?? "un"}</p>
                        </div>
                      )}
                      {p.sku && (
                        <div>
                          <span className="text-muted-foreground text-xs">SKU</span>
                          <p className="font-mono text-xs">{p.sku}</p>
                        </div>
                      )}
                    </div>

                    {(p.nicho || p.marca) && (
                      <div className="flex gap-1.5 flex-wrap">
                        {p.nicho && (
                          <Badge variant="outline" className="text-xs text-purple-400 border-purple-400/30 bg-purple-400/5">
                            {p.nicho}
                          </Badge>
                        )}
                        {p.marca && (
                          <Badge variant="outline" className="text-xs">
                            {p.marca}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
