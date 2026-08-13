import { cn } from "@/lib/utils"

// A recognizable file badge: a solid colored page with the extension in white
// (red PDF, green sheet, blue doc, violet image), matching the familiar
// file-icon look. The hues are fixed and brand-independent by design — like
// the chart palette — so a PDF reads as a PDF in any tenant theme.
type FileFamily = "pdf" | "sheet" | "doc" | "image" | "generic"

const EXT_FAMILY: Record<string, FileFamily> = {
  pdf: "pdf",
  csv: "sheet", tsv: "sheet", xls: "sheet", xlsx: "sheet", numbers: "sheet",
  doc: "doc", docx: "doc", txt: "doc", rtf: "doc", md: "doc", pages: "doc",
  png: "image", jpg: "image", jpeg: "image", gif: "image", heic: "image",
  webp: "image", svg: "image",
}

const FAMILY_COLOR: Record<FileFamily, string> = {
  pdf: "oklch(0.6 0.18 26)",     // red
  sheet: "oklch(0.62 0.13 162)", // green
  doc: "oklch(0.57 0.15 256)",   // blue
  image: "oklch(0.57 0.15 302)", // violet
  generic: "oklch(0.6 0.02 260)",
}

// Keep the on-glyph label to a tidy 3 letters — long extensions get an alias.
const LABEL_ALIAS: Record<string, string> = {
  docx: "DOC", xlsx: "XLS", pptx: "PPT", jpeg: "JPG", numbers: "NUM", pages: "DOC",
}

export function FileTypeIcon({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const ext = (name.split(".").pop() || "").toLowerCase()
  const family = EXT_FAMILY[ext] ?? "generic"
  const label = LABEL_ALIAS[ext] ?? (ext || "file").slice(0, 3).toUpperCase()

  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("shrink-0", className)}
      style={{ color: FAMILY_COLOR[family] }}
      role="img"
      aria-label={`${label} file`}
    >
      {/* page with a dog-eared top-right corner */}
      <path
        d="M8 3h11l6 6v17a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z"
        fill="currentColor"
      />
      {/* the folded corner, lightened */}
      <path d="M19 3l6 6h-4a2 2 0 0 1-2-2V3z" fill="#fff" fillOpacity="0.38" />
      {/* extension label */}
      <text
        x="15"
        y="23"
        textAnchor="middle"
        fill="#fff"
        fontSize={label.length > 3 ? 6 : 7.5}
        fontWeight="700"
        letterSpacing="0.02em"
      >
        {label}
      </text>
    </svg>
  )
}
