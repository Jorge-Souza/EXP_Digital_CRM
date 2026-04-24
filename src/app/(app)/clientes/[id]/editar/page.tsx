import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ClientForm } from "@/components/client-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Client } from "@/lib/types"

export default async function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: client } = await supabase.from("clients").select("*").eq("id", id).single()

  if (!client) notFound()

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href={`/clientes/${id}`} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar Cliente</h1>
          <p className="text-muted-foreground">{(client as Client).nome}</p>
        </div>
      </div>
      <ClientForm client={client as Client} />
    </div>
  )
}
