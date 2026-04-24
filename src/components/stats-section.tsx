"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp, BarChart2 } from "lucide-react"
import { statusConfig, groupOrder } from "@/lib/post-status"
import type { Post } from "@/lib/types"

function StatsCard({
  title,
  posts,
  metaMensal,
  metaSemanal,
  showWeekly,
}: {
  title: string
  posts: Post[]
  metaMensal: number
  metaSemanal: number
  showWeekly: boolean
}) {
  const postados = posts.filter((p) => p.status === "publicado").length
  const total = posts.length
  const percent = metaMensal > 0 ? Math.round((postados / metaMensal) * 100) : 0

  return (
    <Card className="flex-1 border-0 shadow-sm bg-white dark:bg-card">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-bold capitalize">{title}</CardTitle>
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span>Meta: <strong>{metaMensal} posts/mês</strong></span>
          {showWeekly && metaSemanal > 0 && (
            <span>· <strong>{metaSemanal} posts/sem</strong></span>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Postados</span>
            <span className="font-semibold">
              {postados} / {metaMensal}{" "}
              <span className="text-muted-foreground">({percent}%)</span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                percent >= 100 ? "bg-green-500" : percent >= 60 ? "bg-yellow-500" : "bg-red-500"
              }`}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          {groupOrder.map((s) => {
            const count = posts.filter((p) => p.status === s).length
            return (
              <div key={s} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${statusConfig[s].color}`} />
                  <span className="text-muted-foreground">{statusConfig[s].label}</span>
                </div>
                <span className="font-semibold tabular-nums">{count}</span>
              </div>
            )
          })}
          <div className="flex items-center justify-between text-xs border-t pt-1.5 mt-1">
            <span className="text-muted-foreground font-medium">Total planejado</span>
            <span className="font-bold tabular-nums">{total}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StatsSectionProps {
  currentTitle: string
  currentPosts: Post[]
  nextTitle: string
  nextPosts: Post[]
  metaMensal: number
  metaSemanal: number
}

export function StatsSection({
  currentTitle, currentPosts, nextTitle, nextPosts, metaMensal, metaSemanal,
}: StatsSectionProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border bg-muted/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">📊 Resumo dos Meses</span>
        </div>
        {open
          ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
          : <ChevronDown className="h-4 w-4 text-muted-foreground" />
        }
      </button>

      {open && (
        <div className="px-4 pb-4 flex gap-4 flex-col sm:flex-row">
          <StatsCard
            title={currentTitle}
            posts={currentPosts}
            metaMensal={metaMensal}
            metaSemanal={metaSemanal}
            showWeekly
          />
          <StatsCard
            title={nextTitle}
            posts={nextPosts}
            metaMensal={metaMensal}
            metaSemanal={metaSemanal}
            showWeekly={false}
          />
        </div>
      )}
    </div>
  )
}
