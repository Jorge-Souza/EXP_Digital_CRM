import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProdutosTiktokActions } from "@/components/produtos-tiktok-actions"
import type { ProdutoTiktok, ProdutoTipoTiktok } from "@/lib/types"

const tipoLabel: Record<ProdutoTipoTiktok, string> = {
  lowticket: "Low-ticket",
  core: "Core",
  mentoria: "Mentoria",
  outro: "Outro",
}

export default async function ProdutosTiktokPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) redirect("/produtos-tiktok/alunos")

  const admin = createAdminClient()
  const { data: produtos } = await admin.from("produtos_tiktok").select("*").order("tipo").order("nome")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos TikTok Shop</h1>
        <ProdutosTiktokActions />
      </div>

      {!produtos || produtos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            Nenhum produto cadastrado ainda. Adicione os produtos para que o webhook consiga vinculá-los às compras.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(produtos as ProdutoTiktok[]).map((p) => (
            <Card key={p.id} className={!p.ativo ? "opacity-50" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold">{p.nome}</CardTitle>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted shrink-0">{tipoLabel[p.tipo]}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                {p.preco != null && (
                  <div className="text-lg font-bold">
                    {p.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </div>
                )}
                {p.kiwify_product_id && (
                  <div className="text-xs text-muted-foreground truncate">ID: {p.kiwify_product_id}</div>
                )}
                <ProdutosTiktokActions produto={p} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
