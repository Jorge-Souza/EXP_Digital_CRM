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
import type { Post, Client, Profile } from "@/lib/types"
import { PostDetailSheet } from "@/components/post-detail-sheet"
import { columnConfig, typeColors, typeLabels, groupOrder } from "@/lib/post-status"

type PostWithClient = Post & { clients: Pick<Client, "id" | "nome"> | null }

function KanbanCard({
  post,
  showClient,
  isDragging = false,
  onClick,
}: {
  post: PostWithClient
  showClient: boolean
  isDragging?: boolean
  onClick?: () => void
}) {
  const tc = typeColors[post.tipo] ?? { bar: "bg-gray-300", badge: "bg-gray-100 text-gray-600" }

  return (
    <div
      className={`bg-white dark:bg-card rounded-xl shadow-sm border border-border overflow-hidden transition-all ${isDragging ? "opacity-50 scale-95" : "hover:shadow-md cursor-pointer"}`}
      onClick={onClick}
    >
      <div className={`h-1 w-full ${tc.bar}`} />
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-1">
          <p className="text-sm font-semibold leading-tight flex-1">{post.titulo}</p>
          {post.drive_file_url && (
            <a
              href={post.drive_file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 mt-0.5"
              onClick={(e) => e.stopPropagation()}
            >
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
          <Link
            href={`/clientes/${post.clients.id}/projeto`}
            className="block text-xs text-primary hover:underline truncate font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {post.clients.nome}
          </Link>
        )}
      </div>
    </div>
  )
}

function SortableCard({
  post,
  showClient,
  onClick,
}: {
  post: PostWithClient
  showClient: boolean
  onClick: () => void
}) {
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
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </div>
      <KanbanCard post={post} showClient={showClient} isDragging={isDragging} onClick={onClick} />
    </div>
  )
}

interface PublicacoesKanbanProps {
  posts: PostWithClient[]
  clients: Pick<Client, "id" | "nome">[]
  profiles: Pick<Profile, "id" | "nome">[]
}

export function PublicacoesKanban({ posts: initialPosts, clients, profiles }: PublicacoesKanbanProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [selectedClient, setSelectedClient] = useState<string>("all")
  const [selectedTipo, setSelectedTipo] = useState<string>("all")
  const [activePost, setActivePost] = useState<PostWithClient | null>(null)
  const [selectedPost, setSelectedPost] = useState<PostWithClient | null>(null)
  const router = useRouter()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const filtered = posts
    .filter((p) => selectedClient === "all" || p.client_id === selectedClient)
    .filter((p) => selectedTipo === "all" || p.tipo === selectedTipo)

  const grouped = groupOrder.reduce<Record<string, PostWithClient[]>>((acc, status) => {
    acc[status] = filtered.filter((p) => p.status === status)
    return acc
  }, {} as Record<string, PostWithClient[]>)

  function handleDragStart(event: DragStartEvent) {
    const post = posts.find((p) => p.id === event.active.id)
    setActivePost(post ?? null)
  }

  function handlePostUpdate(postId: string, changes: Partial<Post>) {
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, ...changes } : p))
    setSelectedPost((prev) => prev?.id === postId ? { ...prev, ...changes } as PostWithClient : prev)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActivePost(null)
    if (!over || active.id === over.id) return

    const draggedPost = posts.find((p) => p.id === active.id)
    if (!draggedPost) return

    const overPost = posts.find((p) => p.id === over.id)
    const targetStatus = (over.id as string in columnConfig)
      ? (over.id as string)
      : overPost?.status

    if (!targetStatus || targetStatus === draggedPost.status) return

    setPosts((prev) =>
      prev.map((p) => p.id === draggedPost.id ? { ...p, status: targetStatus as Post["status"] } : p)
    )

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
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
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

            <div className="flex items-center gap-1.5 flex-wrap">
              {(["all", "story", "feed", "reels", "carrossel", "tiktok"] as const).map((tipo) => {
                const baseCount = posts.filter((p) =>
                  (selectedClient === "all" || p.client_id === selectedClient) &&
                  (tipo === "all" || p.tipo === tipo)
                ).length
                const tc = tipo !== "all" ? typeColors[tipo] : null
                const label = tipo === "all" ? "Todos" : typeLabels[tipo]
                const isActive = selectedTipo === tipo
                return (
                  <button
                    key={tipo}
                    onClick={() => setSelectedTipo(tipo)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      isActive
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background text-muted-foreground border-border hover:border-foreground/40"
                    }`}
                  >
                    {tc && <span className={`h-2 w-2 rounded-full ${tc.bar}`} />}
                    {label}
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isActive ? "bg-white/20" : "bg-muted"}`}>
                      {baseCount}
                    </span>
                  </button>
                )
              })}
            </div>

            <span className="text-sm text-muted-foreground ml-auto">
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
                    <div id={status} className="flex-1 p-2 min-h-[100px]">
                      {items.length === 0 ? (
                        <div className="flex items-center justify-center h-20 rounded-lg border-2 border-dashed border-black/10 text-xs text-muted-foreground">
                          Arraste aqui
                        </div>
                      ) : (() => {
                        const normais = items.filter((p) => p.tipo !== "story")
                        const stories = items.filter((p) => p.tipo === "story")
                        return (
                          <div className="space-y-1">
                            {normais.map((post) => (
                              <SortableCard
                                key={post.id}
                                post={post}
                                showClient={selectedClient === "all"}
                                onClick={() => setSelectedPost(post)}
                              />
                            ))}
                            {stories.length > 0 && (
                              <>
                                {normais.length > 0 && (
                                  <div className="flex items-center gap-1.5 py-1.5">
                                    <div className="flex-1 h-px bg-amber-300/60" />
                                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Stories</span>
                                    <div className="flex-1 h-px bg-amber-300/60" />
                                  </div>
                                )}
                                {stories.map((post) => (
                                  <SortableCard
                                    key={post.id}
                                    post={post}
                                    showClient={selectedClient === "all"}
                                    onClick={() => setSelectedPost(post)}
                                  />
                                ))}
                              </>
                            )}
                          </div>
                        )
                      })()}
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

      <PostDetailSheet
        post={selectedPost}
        profiles={profiles}
        open={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        onUpdate={handlePostUpdate}
      />
    </>
  )
}
