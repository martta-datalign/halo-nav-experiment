import * as React from "react"
import { RiDeleteBinLine, RiUpload2Line } from "@remixicon/react"

import { FileTypeIcon } from "@/components/ask/file-type-icon"
import { AutoAnimated } from "@/components/ui/auto-animated"

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
  { id: "d2", name: "Estate Plan.docx", kind: "DOCX", size: "1.1 MB", when: "Jun 28" },
  { id: "d3", name: "Life Insurance Policy.pdf", kind: "PDF", size: "820 KB", when: "Jun 15" },
  { id: "d4", name: "Brokerage 1099.csv", kind: "CSV", size: "48 KB", when: "May 30" },
  { id: "d5", name: "Property Appraisal.jpg", kind: "JPG", size: "3.2 MB", when: "May 12" },
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
          <DialogTitle>Vault</DialogTitle>
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
            <RiUpload2Line className="size-4.5" />
          </span>
          <span className="text-[13px] font-medium">Drop files here, or click to browse</span>
          <span className="text-xs text-muted-foreground">
            Images, PDF, Word, CSV · max 50 MB per file
          </span>
        </button>

        <div>
          <div className="mb-1 text-xs font-medium text-muted-foreground">
            {docs.length} document{docs.length === 1 ? "" : "s"}
          </div>
          {docs.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-[13px] text-muted-foreground">
              No documents yet. Upload one above to get started.
            </p>
          ) : (
            <AutoAnimated className="-mx-1 space-y-0.5 px-1">
              {docs.map((d) => (
                <div
                  key={d.id}
                  className="group flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-secondary/60"
                >
                  <FileTypeIcon name={d.name} className="size-9" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium text-foreground">
                      {d.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {d.kind} · {d.size} · {d.when}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(d.id)}
                    aria-label={`Delete ${d.name}`}
                    className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-[color,background-color,opacity,transform] duration-150 ease-out hover:bg-negative/10 hover:text-negative active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <RiDeleteBinLine className="size-4" />
                  </button>
                </div>
              ))}
            </AutoAnimated>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
