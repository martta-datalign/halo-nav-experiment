import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function AccountConnectionNudge({
  open,
  onOpenChange,
  onConnect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnect: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect accounts to get started</DialogTitle>
          <DialogDescription className="max-w-sm leading-6">
            Halo needs at least one account to build your financial analysis and
            populate your dashboard.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onConnect}>Connect accounts</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
