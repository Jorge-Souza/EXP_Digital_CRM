import { redirect } from "next/navigation"

// A ferramenta de Jornada foi fundida na Gestão de Assessorados — o checklist
// por pilar agora vive na página de cada assessorado. Mantém o redirect pra
// não quebrar links/favoritos antigos.
export default function AssessoriaTiktokPage() {
  redirect("/produtos-tiktok/assessoria/gestao")
}
