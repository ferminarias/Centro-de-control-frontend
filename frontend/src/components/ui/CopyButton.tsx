import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { copyToClipboard, cn } from "@/lib/utils"

interface CopyButtonProps {
  text: string
  className?: string
}

export default function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await copyToClipboard(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
        className
      )}
      title="Copiar"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-400" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  )
}
