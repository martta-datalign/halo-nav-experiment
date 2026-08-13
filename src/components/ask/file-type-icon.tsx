import { cn } from "@/lib/utils"

// A recognizable file badge: a white page (dog-eared corner) with a small
// colored type chip in the lower-left — red PDF, green sheet, blue doc, violet
// image. The chip hues are fixed and brand-independent by design — like the
// chart palette — so a PDF reads as a PDF in any tenant theme.
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
      role="img"
      aria-label={`${label} file`}
    >
      {/* white page */}
      <path
        d="M8 4 H18 L24 10 V26 A2 2 0 0 1 22 28 H8 A2 2 0 0 1 6 26 V6 A2 2 0 0 1 8 4 Z"
        fill="#fff"
        stroke="oklch(0.84 0 0)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* folded top-right corner */}
      <path
        d="M18 4 L24 10 H19.5 A1.5 1.5 0 0 1 18 8.5 Z"
        fill="oklch(0.92 0 0)"
        stroke="oklch(0.84 0 0)"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      {/* colored type chip */}
      <rect x="3" y="17.5" width="15.5" height="8.5" rx="2.2" fill={FAMILY_COLOR[family]} />
      <text
        x="10.75"
        y="23.7"
        textAnchor="middle"
        fill="#fff"
        fontSize="6"
        fontWeight="700"
        letterSpacing="0.02em"
      >
        {label}
      </text>
    </svg>
  )
}
