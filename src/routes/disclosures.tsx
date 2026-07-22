import { SiteHeader } from "@/components/site-header"

const DISCLOSURES = [
  {
    title: "Form ADV Part 2A",
    label: "PDF",
    href: "https://assets.datalignadvisory.com/pdfs/Datalign-Form-ADV-Part-2A.pdf",
  },
  {
    title: "Form CRS",
    label: "PDF",
    href: "https://assets.datalignadvisory.com/pdfs/Datalign-CRS.pdf",
  },
  {
    title: "Privacy Policy",
    label: "Web",
    href: "https://datalign.com/privacy-policy",
  },
  {
    title: "Disclosures",
    label: "Web",
    href: "https://datalign.com/disclosures",
  },
] as const

export default function Disclosures() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em]">Disclosures</h1>

        <div className="mt-7 border-t border-border">
          {DISCLOSURES.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-4 border-b border-border py-4 text-sm transition-colors hover:text-halo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="font-medium">{item.title}</span>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </a>
          ))}
        </div>
      </main>
    </>
  )
}
