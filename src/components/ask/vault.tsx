import * as React from "react"
import { FileText, Trash2, Upload } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export type VaultDoc = {
  id: string
  name: string
  kind: string
  size: string
  when: string
}

export const SEED_VAULT_DOCS: VaultDoc[] = [
  { id: "d1", name: "2025 Tax Return.pdf", kind: "PDF", size: "2.4 MB", when: "Jul 3" },
  { id: "d2", name: "Home Deed.pdf", kind: "PDF", size: "1.1 MB", when: "Jun 28" },
  { id: "d3", name: "Life Insurance Policy.pdf", kind: "PDF", size: "820 KB", when: "Jun 15" },
  { id: "d4", name: "Brokerage 1099.csv", kind: "CSV", size: "48 KB", when: "May 30" },
]

export function VaultDialog({
  open,
  onOpenChange,
  docs,
  onUpload,
  onDelete,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  docs: VaultDoc[]
  onUpload: (names: string[]) => void
  onDelete: (id: string) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = React.useState(false)

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    onUpload(Array.from(files).map((f) => f.name))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>My Vault</DialogTitle>
          <DialogDescription>
            Documents you upload are added to Halo's knowledge base, so it can tailor
            guidance to your situation.
          </DialogDescription>
        </DialogHeader>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            handleFiles(e.dataTransfer.files)
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
            dragging
              ? "border-halo bg-halo-subtle/60"
              : "border-input hover:border-halo-border hover:bg-halo-subtle/30"
          )}
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-halo-subtle text-halo">
            <Upload className="size-4.5" />
          </span>
          <span className="text-[13px] font-medium">Drop files here, or click to browse</span>
          <span className="text-[11px] text-muted-foreground">
            Images, PDF, Word, CSV · max 50 MB per file
          </span>
        </button>

        <div>
          <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
            {docs.length} document{docs.length === 1 ? "" : "s"}
          </div>
          {docs.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-[13px] text-muted-foreground">
              No documents yet. Upload one above to get started.
            </p>
          ) : (
            <div className="-mx-1 max-h-64 space-y-0.5 overflow-y-auto px-1">
              {docs.map((d) => (
                <div
                  key={d.id}
                  className="group flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-secondary/60"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                    <FileText className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium text-foreground">
                      {d.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {d.kind} · {d.size} · {d.when}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(d.id)}
                    aria-label={`Delete ${d.name}`}
                    className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-negative/10 hover:text-negative focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
