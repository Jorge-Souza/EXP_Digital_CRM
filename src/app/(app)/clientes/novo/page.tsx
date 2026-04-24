import { ClientForm } from "@/components/client-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NovoClientePage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/clientes" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Novo Cliente</h1>
          <p className="text-muted-foreground">Preencha os dados do novo cliente</p>
        </div>
      </div>
      <ClientForm />
    </div>
  )
}
