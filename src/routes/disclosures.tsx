
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
      <main className="app-page">
        <h1 className="text-2xl font-semibold tracking-[-0.02em]">Disclosures</h1>

        <div className="mt-6 flex flex-col">
          {DISCLOSURES.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="group -mx-3 flex items-center justify-between gap-4 rounded-lg px-3 py-3.5 text-sm transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="font-medium">{item.title}</span>
              <span className="text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                {item.label}
              </span>
            </a>
          ))}
        </div>
      </main>
    </>
  )
}
