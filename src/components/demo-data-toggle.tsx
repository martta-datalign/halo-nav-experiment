import { cn } from "@/lib/utils"

export function DemoDataToggle({
  filled,
  onChange,
}: {
  filled: boolean
  onChange: (filled: boolean) => void
}) {
  return (
    <div className="fixed bottom-4 right-4 z-[80] flex items-center gap-1 rounded-full border border-border bg-background p-1 shadow-lg">
      <span className="px-2 text-xs font-medium text-muted-foreground">Demo data</span>
      {[
        { label: "Empty", value: false },
        { label: "Filled", value: true },
      ].map((option) => (
        <button
          key={option.label}
          type="button"
          aria-pressed={filled === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100",
            filled === option.value
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
