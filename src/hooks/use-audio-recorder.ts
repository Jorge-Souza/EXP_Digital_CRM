import { useState, useRef } from "react"
import { toast } from "sonner"

export function useAudioRecorder(onTranscricao: (texto: string) => void) {
  const [gravando, setGravando] = useState(false)
  const [transcrevendo, setTranscrevendo] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  async function iniciar() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        setTranscrevendo(true)
        try {
          const form = new FormData()
          form.append("audio", blob, "audio.webm")
          const res = await fetch("/api/laboratorio/transcrever-audio", { method: "POST", body: form })
          const data = await res.json() as { transcricao?: string; error?: string }
          if (!res.ok) throw new Error(data.error ?? "Erro ao transcrever")
          onTranscricao(data.transcricao ?? "")
          toast.success("Áudio transcrito!")
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Erro ao transcrever áudio")
        } finally {
          setTranscrevendo(false)
        }
      }
      mr.start()
      mediaRecorderRef.current = mr
      setGravando(true)
    } catch {
      toast.error("Permissão de microfone negada")
    }
  }

  function parar() {
    mediaRecorderRef.current?.stop()
    setGravando(false)
  }

  return { gravando, transcrevendo, iniciar, parar }
}
