import { createClient } from "@/lib/supabase/server"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Users } from "lucide-react"
import Link from "next/link"
import type { Client } from "@/lib/types"

const statusConfig = {
  ativo: { label: "Ativo", variant: "default" as const },
  inativo: { label: "Inativo", variant: "secondary" as const },
  pausado: { label: "Pausado", variant: "outline" as const },
}

export default async function ClientesPage() {
  const supabase = await createClient()

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("nome")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">{clients?.length ?? 0} clientes cadastrados</p>
        </div>
        <Link href="/clientes/novo" className={buttonVariants()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Link>
      </div>

      {!clients || clients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg">Nenhum cliente ainda</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-4">
              Cadastre o primeiro cliente da EXP Digital
            </p>
            <Link href="/clientes/novo" className={buttonVariants()}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(clients as Client[]).map((client) => {
            const s = statusConfig[client.status]
            return (
              <Link key={client.id} href={`/clientes/${client.id}`} className="block">
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                        <span className="text-sm font-bold text-primary">
                          {client.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <Badge variant={s.variant}>{s.label}</Badge>
                    </div>
                    <h3 className="font-semibold truncate">{client.nome}</h3>
                    <p className="text-sm text-muted-foreground">{client.nicho || "—"}</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                      <span>{client.posts_mensais} posts/mês</span>
                      {client.instagram && <span>@{client.instagram}</span>}
                    </div>
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
