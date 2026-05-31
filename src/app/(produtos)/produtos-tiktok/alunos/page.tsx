import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SyncFormulariosButton } from "@/components/sync-formularios-button"
import { AlunoSearch } from "@/components/aluno-search"
import { SCORE_DISPLAY } from "@/lib/form-score"
import type { Aluno, AlunoEtapa, ScoreLabel } from "@/lib/types"

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

export default async function AlunosPage({ searchParams }: { searchParams: Promise<{ etapa?: string; score?: string; q?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: isAdmin } = await supabase.rpc("current_user_is_admin")
  if (!isAdmin) redirect("/hub")

  const params = await searchParams
  const admin = createAdminClient()

  let query = admin.from("alunos").select("*").order("score", { ascending: false }).order("created_at", { ascending: false })

  if (params.etapa) query = query.eq("etapa", params.etapa)
  if (params.score) query = query.eq("score_label", params.score)
  if (params.q) query = query.or(`nome.ilike.%${params.q}%,email.ilike.%${params.q}%`)

  const { data: alunos } = await query

  const scoreLabels: { value: string; label: string; emoji: string }[] = [
    { value: "quente", label: "Quente", emoji: "🔥" },
    { value: "morno",  label: "Morno",  emoji: "⚡" },
    { value: "frio",   label: "Frio",   emoji: "❄️" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Alunos</h1>
          <p className="text-sm text-muted-foreground">{alunos?.length ?? 0} alunos · ordenados por score</p>
        </div>
        <SyncFormulariosButton />
      </div>

      <AlunoSearch />

      <div className="flex flex-wrap gap-2">
        <Link
          href="/produtos-tiktok/alunos"
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${!params.etapa && !params.score ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}
        >
          Todos
        </Link>
        {scoreLabels.map((s) => (
          <Link
            key={s.value}
            href={`/produtos-tiktok/alunos?score=${s.value}`}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${params.score === s.value ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}
          >
            {s.emoji} {s.label}
          </Link>
        ))}
        <span className="text-gray-600 text-xs px-1 self-center">|</span>
        {["lead", "entrada", "core", "avancado"].map((etapa) => (
          <Link
            key={etapa}
            href={`/produtos-tiktok/alunos?etapa=${etapa}`}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${params.etapa === etapa ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}
          >
            {etapaLabel[etapa as AlunoEtapa]}
          </Link>
        ))}
      </div>

      {!alunos || alunos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            Nenhum aluno encontrado.
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Aluno</th>
                <th className="text-left px-4 py-3 font-medium">Score</th>
                <th className="text-left px-4 py-3 font-medium">Etapa</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Tags</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Entrada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(alunos as (Aluno & { score: number; score_label: ScoreLabel; whatsapp?: string })[]).map((aluno) => {
                const scoreInfo = SCORE_DISPLAY[aluno.score_label ?? 'sem_dados']
                return (
                  <tr key={aluno.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/produtos-tiktok/alunos/${aluno.id}`} className="hover:underline">
                        <div className="font-medium">{aluno.nome}</div>
                        <div className="text-xs text-muted-foreground">{aluno.email}</div>
                        {aluno.whatsapp && (
                          <div className="text-xs text-muted-foreground">{aluno.whatsapp}</div>
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${scoreInfo.cor}`}>
                        {scoreInfo.emoji} {scoreInfo.label}
                        {aluno.score > 0 && <span className="ml-1 opacity-70">({aluno.score})</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${etapaCor[aluno.etapa]}`}>
                        {etapaLabel[aluno.etapa]}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {aluno.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      {new Date(aluno.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
