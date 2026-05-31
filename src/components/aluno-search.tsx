"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function AlunoSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get("q") ?? "")

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setValue(val)
    const params = new URLSearchParams(searchParams.toString())
    if (val) params.set("q", val)
    else params.delete("q")
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  return (
    <div className="relative w-full max-w-xs">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Buscar por nome ou email..."
        value={value}
        onChange={handleChange}
        className="pl-8"
      />
    </div>
  )
}
