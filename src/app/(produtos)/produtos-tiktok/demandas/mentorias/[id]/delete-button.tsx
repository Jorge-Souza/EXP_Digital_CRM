"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export function MentoriaDeleteButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm("Excluir esta mentoria?")) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from("mentorias").delete().eq("id", id)
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success("Mentoria excluída")
    router.push("/produtos-tiktok/demandas/mentorias")
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDelete} disabled={loading}
      className="text-destructive hover:bg-destructive/10">
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
