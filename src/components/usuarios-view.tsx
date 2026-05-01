"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Plus, Trash2, UserCog, Phone, MapPin, Calendar, Shield, User, ToggleLeft, ToggleRight, Pencil } from "lucide-react"
import type { Profile } from "@/lib/types"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface UsuariosViewProps {
  usuarios: Profile[]
}

const roleLabel: Record<string, string> = {
  admin: "Admin",
  profissional: "Profissional",
}

const roleBadge: Record<string, string> = {
  admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  profissional: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
}

const formVazio = { nome: "", email: "", senha: "", role: "profissional", telefone: "", endereco: "", data_admissao: "" }

export function UsuariosView({ usuarios: inicial }: UsuariosViewProps) {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<Profile[]>(inicial)
  const [dialogAberto, setDialogAberto] = useState(false)
  const [editando, setEditando] = useState<Profile | null>(null)
  const [removendo, setRemovendo] = useState<string | null>(null)
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  const [form, setForm] = useState(formVazio)

  function setF(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function abrirCriar() {
    setEditando(null)
    setForm(formVazio)
    setDialogAberto(true)
  }

  function abrirEditar(u: Profile) {
    setEditando(u)
    setForm({
      nome: u.nome,
      email: u.email,
      senha: "",
      role: u.role,
      telefone: u.telefone ?? "",
      endereco: u.endereco ?? "",
      data_admissao: u.data_admissao ?? "",
    })
    setDialogAberto(true)
  }

  function fecharDialog() {
    setDialogAberto(false)
    setEditando(null)
    setForm(formVazio)
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim()) { toast.error("Nome é obrigatório"); return }
    if (!editando && !form.email.trim()) { toast.error("E-mail é obrigatório"); return }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("E-mail inválido"); return
    }
    if (!editando && form.senha && form.senha.length < 6) {
      toast.error("Senha deve ter pelo menos 6 caracteres"); return
    }
    setSalvando(true)
    try {
      let res: Response
      if (editando) {
        res = await fetch("/api/admin/usuarios", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editando.id, ...form }),
        })
      } else {
        res = await fetch("/api/admin/usuarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
      }
      const data = await res.json() as { ok?: boolean; error?: string }
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar")
      toast.success(editando ? `${form.nome} atualizado!` : `${form.nome} cadastrado com sucesso!`)
      fecharDialog()
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar")
    } finally {
      setSalvando(false)
    }
  }

  async function handleToggleStatus(id: string, statusAtual: string) {
    const novoStatus = statusAtual === "ativo" ? "inativo" : "ativo"
    setTogglingStatus(id)
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: novoStatus }),
      })
      const data = await res.json() as { ok?: boolean; error?: string }
      if (!res.ok) throw new Error(data.error ?? "Erro ao atualizar status")
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, status: novoStatus as 'ativo' | 'inativo' } : u))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar status")
    } finally {
      setTogglingStatus(null)
    }
  }

  async function handleRemover(id: string, nome: string) {
    if (!confirm(`Remover o usuário "${nome}"? Essa ação não pode ser desfeita.`)) return
    setRemovendo(id)
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      const data = await res.json() as { ok?: boolean; error?: string }
      if (!res.ok) throw new Error(data.error ?? "Erro ao remover")
      toast.success(`${nome} removido.`)
      setUsuarios((prev) => prev.filter((u) => u.id !== id))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover")
    } finally {
      setRemovendo(null)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserCog className="h-6 w-6 text-primary" />
            Usuários do Sistema
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie os acessos das profissionais da EXP Digital
          </p>
        </div>

        <Button className="gap-2" onClick={abrirCriar}>
          <Plus className="h-4 w-4" />
          Nova Profissional
        </Button>
      </div>

      <Dialog open={dialogAberto} onOpenChange={(v) => { if (!v) fecharDialog() }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar Profissional" : "Cadastrar Profissional"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSalvar} className="space-y-4 mt-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Nome completo *</Label>
                <Input value={form.nome} onChange={(e) => setF("nome", e.target.value)} placeholder="Ex: Ana Silva" required />
              </div>
              <div className="space-y-2">
                <Label>E-mail de acesso {!editando && "*"}</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setF("email", e.target.value)}
                  placeholder="ana@expdigital.com"
                  required={!editando}
                  disabled={!!editando}
                  className={editando ? "opacity-60" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label>{editando ? "Nova senha (opcional)" : "Senha temporária *"}</Label>
                <Input
                  type="password"
                  value={form.senha}
                  onChange={(e) => setF("senha", e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={form.senha ? 6 : undefined}
                  required={!editando}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone / WhatsApp</Label>
                <Input value={form.telefone} onChange={(e) => setF("telefone", e.target.value)} placeholder="(11) 99999-9999" />
              </div>
              <div className="space-y-2">
                <Label>Data de Admissão</Label>
                <Input type="date" value={form.data_admissao} onChange={(e) => setF("data_admissao", e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Endereço</Label>
                <Input value={form.endereco} onChange={(e) => setF("endereco", e.target.value)} placeholder="Rua, número, bairro, cidade" />
              </div>
              <div className="space-y-2">
                <Label>Perfil de acesso</Label>
                <Select value={form.role} onValueChange={(v) => setF("role", v ?? "profissional")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profissional">Profissional</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={salvando} className="flex-1">
                {salvando ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : editando ? "Salvar Alterações" : "Cadastrar"}
              </Button>
              <Button type="button" variant="outline" onClick={fecharDialog}>Cancelar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {usuarios.map((u) => (
          <Card key={u.id} className="hover:shadow-md transition-shadow">
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ background: u.role === "admin" ? "linear-gradient(135deg,#9333EA,#7C3AED)" : "linear-gradient(135deg,#3B82F6,#2563EB)" }}
                  >
                    {u.nome.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{u.nome}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${roleBadge[u.role] ?? roleBadge.profissional}`}>
                        {u.role === "admin" ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                        {roleLabel[u.role] ?? u.role}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${u.status === "inativo" ? "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>
                        {u.status === "inativo" ? "Inativo" : "Ativo"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      {u.telefone && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" /> {u.telefone}
                        </span>
                      )}
                      {u.data_admissao && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Admitida em {format(new Date(u.data_admissao + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      )}
                      {u.endereco && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {u.endereco}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-primary"
                    onClick={() => abrirEditar(u)}
                    title="Editar usuário"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={u.status === "inativo" ? "text-gray-400 hover:text-green-600" : "text-green-600 hover:text-gray-400"}
                    onClick={() => handleToggleStatus(u.id, u.status ?? "ativo")}
                    disabled={togglingStatus === u.id}
                    title={u.status === "inativo" ? "Ativar usuário" : "Desativar usuário"}
                  >
                    {togglingStatus === u.id
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : u.status === "inativo"
                        ? <ToggleLeft className="h-5 w-5" />
                        : <ToggleRight className="h-5 w-5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemover(u.id, u.nome)}
                    disabled={removendo === u.id}
                  >
                    {removendo === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {usuarios.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <UserCog className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Nenhum usuário cadastrado ainda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
