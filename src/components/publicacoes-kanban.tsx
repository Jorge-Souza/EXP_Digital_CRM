"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExternalLink } from "lucide-react"
import Link from "next/link"
import type { Post, Client } from "@/lib/types"

const statusConfig = {
  planejado:    { label: "Falta Fazer",          variant: "outline" as const },
  falta_insumo: { label: "Falta Insumo",         variant: "destructive" as const },
  producao:     { label: "Em Produção",           variant: "secondary" as const },
  aprovado:     { label: "P/ Aprovação",          variant: "default" as const },
  publicado:    { label: "Postado",               variant: "default" as const },
}

const typeLabels: Record<string, string> = {
  feed: "Feed",
  reels: "Reels",
  story: "Story",
  tiktok: "TikTok",
  carrossel: "Carrossel",
}

const groupOrder = ["planejado", "falta_insumo", "producao", "aprovado", "publicado"] as const

type PostWithClient = Post & { clients: Pick<Client, "id" | "nome"> | null }

interface PublicacoesKanbanProps {
  posts: PostWithClient[]
  clients: Pick<Client, "id" | "nome">[]
}

export function PublicacoesKanban({ posts, clients }: PublicacoesKanbanProps) {
  const [selectedClient, setSelectedClient] = useState<string>("all")

  const filtered = selectedClient === "all"
    ? posts
    : posts.filter((p) => p.client_id === selectedClient)

  const grouped = groupOrder.reduce<Record<string, PostWithClient[]>>((acc, status) => {
    acc[status] = filtered.filter((p) => p.status === status)
    return acc
  }, {} as Record<string, PostWithClient[]>)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={selectedClient} onValueChange={(v) => setSelectedClient(v ?? "all")}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Todos os clientes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os clientes</SelectItem>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filtered.length} publicaç{filtered.length === 1 ? "ão" : "ões"}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {groupOrder.map((status) => {
          const s = statusConfig[status]
          const items = grouped[status]
          return (
            <Card key={status} className="flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span>{s.label}</span>
                  <Badge variant={s.variant} className="text-xs">{items.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-2">
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Nenhum item</p>
                ) : (
                  items.map((post) => (
                    <div key={post.id} className="rounded-lg border bg-card p-3 space-y-1.5">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-xs font-semibold leading-tight">{post.titulo}</p>
                        {post.drive_file_url && (
                          <a href={post.drive_file_url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                            <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {typeLabels[post.tipo] ?? post.tipo}
                      </p>
                      {post.clients && selectedClient === "all" && (
                        <Link href={`/clientes/${post.clients.id}`} className="block text-xs text-primary hover:underline truncate">
                          {post.clients.nome}
                        </Link>
                      )}
                      {post.data_publicacao && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.data_publicacao + "T00:00:00").toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
