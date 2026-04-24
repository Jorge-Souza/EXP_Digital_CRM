"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExternalLink, GripVertical } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Post, Client } from "@/lib/types"

const columnConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  planejado:    { label: "Falta Fazer",         color: "border-t-gray-400",   bg: "bg-gray-100 dark:bg-gray-800",    dot: "bg-gray-400" },
  falta_insumo: { label: "Falta Insumo",        color: "border-t-red-500",    bg: "bg-red-50 dark:bg-red-950/30",    dot: "bg-red-500" },
  producao:     { label: "Em Produção",          color: "border-t-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/30", dot: "bg-yellow-500" },
  aprovado:     { label: "P/ Aprovação",         color: "border-t-blue-500",   bg: "bg-blue-50 dark:bg-blue-950/30",  dot: "bg-blue-500" },
  publicado:    { label: "Postado ✅",           color: "border-t-green-500",  bg: "bg-green-50 dark:bg-green-950/30", dot: "bg-green-500" },
}

const typeColors: Record<string, { bar: string; badge: string }> = {
  feed:      { bar: "bg-blue-400",   badge: "bg-blue-100 text-blue-700" },
  reels:     { bar: "bg-pink-400",   badge: "bg-pink-100 text-pink-700" },
  story:     { bar: "bg-amber-400",  badge: "bg-amber-100 text-amber-700" },
  carrossel: { bar: "bg-violet-400", badge: "bg-violet-100 text-violet-700" },
  tiktok:    { bar: "bg-cyan-400",   badge: "bg-cyan-100 text-cyan-700" },
}

const typeLabels: Record<string, string> = {
  feed: "Feed", reels: "Reels", story: "Story", tiktok: "TikTok", carrossel: "Carrossel",
}

const groupOrder = ["planejado", "falta_insumo", "producao", "aprovado", "publicado"] as const

type PostWithClient = Post & { clients: Pick<Client, "id" | "nome"> | null }

function KanbanCard({
  post,
  showClient,
  isDragging = false,
}: {
  post: PostWithClient
  showClient: boolean
  isDragging?: boolean
}) {
  const tc = typeColors[post.tipo] ?? { bar: "bg-gray-300", badge: "bg-gray-100 text-gray-600" }

  return (
    <div className={`bg-white dark:bg-card rounded-xl shadow-sm border border-border overflow-hidden transition-all ${isDragging ? "opacity-50 scale-95" : "hover:shadow-md"}`}>
      <div className={`h-1 w-full ${tc.bar}`} />
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-1">
          <p className="text-sm font-semibold leading-tight flex-1">{post.titulo}</p>
          {post.drive_file_url && (
            <a href={post.drive_file_url} target="_blank" rel="noopener noreferrer" className="shrink-0 mt-0.5">
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
            </a>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tc.badge}`}>
            {typeLabels[post.tipo] ?? post.tipo}
          </span>
          {post.data_publicacao && (
            <span className="text-xs text-muted-foreground">
              {new Date(post.data_publicacao + "T00:00:00").toLocaleDateString("pt-BR")}
            </span>
          )}
        </div>
        {showClient && post.clients && (
          <Link href={`/clientes/${post.clients.id}/projeto`} className="block text-xs text-primary hover:underline truncate font-medium">
            {post.clients.nome}
          </Link>
        )}
      </div>
    </div>
  )
}

function SortableCard({ post, showClient }: { post: PostWithClient; showClient: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: post.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 rounded text-muted-foreground hover:text-foreground transition-opacity"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </div>
      <KanbanCard post={post} showClient={showClient} isDragging={isDragging} />
    </div>
  )
}

interface PublicacoesKanbanProps {
  posts: PostWithClient[]
  clients: Pick<Client, "id" | "nome">[]
}

export function PublicacoesKanban({ posts: initialPosts, clients }: PublicacoesKanbanProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [selectedClient, setSelectedClient] = useState<string>("all")
  const [activePost, setActivePost] = useState<PostWithClient | null>(null)
  const router = useRouter()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const filtered = selectedClient === "all" ? posts : posts.filter((p) => p.client_id === selectedClient)

  const grouped = groupOrder.reduce<Record<string, PostWithClient[]>>((acc, status) => {
    acc[status] = filtered.filter((p) => p.status === status)
    return acc
  }, {} as Record<string, PostWithClient[]>)

  function handleDragStart(event: DragStartEvent) {
    const post = posts.find((p) => p.id === event.active.id)
    setActivePost(post ?? null)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActivePost(null)
    if (!over || active.id === over.id) return

    const draggedPost = posts.find((p) => p.id === active.id)
    if (!draggedPost) return

    // Descobre a coluna de destino
    const newStatus = groupOrder.find((s) =>
      s === over.id || posts.find((p) => p.id === over.id)?.status === s ||
      over.id === s
    )

    // over.id pode ser o id de outro post ou o id de uma coluna
    const overPost = posts.find((p) => p.id === over.id)
    const targetStatus = (over.id as string in columnConfig)
      ? (over.id as string)
      : overPost?.status

    if (!targetStatus || targetStatus === draggedPost.status) return

    // Atualiza localmente
    setPosts((prev) =>
      prev.map((p) => p.id === draggedPost.id ? { ...p, status: targetStatus as Post["status"] } : p)
    )

    // Persiste no Supabase
    const supabase = createClient()
    const { error } = await supabase
      .from("posts")
      .update({ status: targetStatus })
      .eq("id", draggedPost.id)

    if (error) {
      toast.error("Erro ao mover publicação")
      setPosts(initialPosts)
    } else {
      toast.success(`Movido para "${columnConfig[targetStatus]?.label}"`)
      router.refresh()
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Select value={selectedClient} onValueChange={(v) => setSelectedClient(v ?? "all")}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Todos os clientes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">👥 Todos os clientes</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {filtered.length} publicaç{filtered.length === 1 ? "ão" : "ões"}
          </span>
        </div>

        {/* Board */}
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1">
          {groupOrder.map((status) => {
            const col = columnConfig[status]
            const items = grouped[status]
            return (
              <div
                key={status}
                id={status}
                className={`flex flex-col rounded-xl border-t-4 ${col.color} ${col.bg} shrink-0 w-[280px] min-h-[400px] shadow-sm`}
              >
                {/* Cabeçalho da coluna */}
                <div className="flex items-center justify-between px-3 py-3 border-b border-black/5">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                    <span className="text-sm font-bold">{col.label}</span>
                  </div>
                  <span className="text-xs font-bold bg-white/70 dark:bg-black/20 rounded-full px-2 py-0.5 min-w-[24px] text-center">
                    {items.length}
                  </span>
                </div>

                {/* Cards */}
                <SortableContext items={items.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                  <div
                    id={status}
                    className="flex-1 p-2 space-y-2 min-h-[100px]"
                  >
                    {items.length === 0 ? (
                      <div className="flex items-center justify-center h-20 rounded-lg border-2 border-dashed border-black/10 text-xs text-muted-foreground">
                        Arraste aqui
                      </div>
                    ) : (
                      items.map((post) => (
                        <SortableCard
                          key={post.id}
                          post={post}
                          showClient={selectedClient === "all"}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </div>
            )
          })}
        </div>
      </div>

      <DragOverlay>
        {activePost && (
          <div className="rotate-2 scale-105 shadow-2xl">
            <KanbanCard post={activePost} showClient={selectedClient === "all"} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
