import { Toaster as Sonner } from "sonner"

/** App-wide toast host. Success/info banners pop from the bottom-center. */
export function Toaster() {
  return (
    <Sonner
      position="top-right"
      closeButton
      toastOptions={{ duration: 4000 }}
    />
  )
}
