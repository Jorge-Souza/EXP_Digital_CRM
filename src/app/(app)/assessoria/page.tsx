import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, GraduationCap, User, Calendar, DollarSign } from "lucide-react"
import type { Assessorado } from "@/lib/types"

export default async function AssessoriaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) redirect("/dashboard")

  const { data: assessorados } = await supabase
    .from("assessorados")
    .select("*")
    .order("created_at", { ascending: false })

  const lista = (assessorados ?? []) as Assessorado[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-purple-500" />
            Assessoria TikTok Shop
          </h1>
          <p className="text-muted-foreground">{lista.length} assessorado(s) cadastrado(s)</p>
        </div>
        <Link href="/assessoria/novo" className={buttonVariants()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Assessorado
        </Link>
      </div>

      {lista.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <GraduationCap className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">Nenhum assessorado ainda.</p>
            <Link href="/assessoria/novo" className={buttonVariants({ variant: "outline" })}>
              Cadastrar primeiro assessorado
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lista.map((a) => (
            <Link key={a.id} href={`/assessoria/${a.id}`}>
              <Card className="hover:border-purple-500/50 hover:shadow-md transition-all cursor-pointer h-full">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                        <User className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-semibold leading-tight">{a.nome}</p>
                        {a.email && <p className="text-xs text-muted-foreground">{a.email}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Contratou em {new Date(a.data_contratacao + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                    </div>
                    {a.valor_assessoria && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>{a.valor_assessoria.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                      </div>
                    )}
                  </div>

                  <Badge variant="outline" className="text-purple-400 border-purple-400/30 bg-purple-400/5">
                    Ver sessões
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
