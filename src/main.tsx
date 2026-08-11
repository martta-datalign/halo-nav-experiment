import "@fontsource-variable/instrument-sans"
import "./index.css"

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App.tsx"
import { applyTenantTheme } from "@/lib/theme"
import { resolveTenant } from "@/lib/tenant.config"

// White-label: apply the firm's brand (accent + font) before first render so
// there's no flash of the default theme. resolveTenant() is where the backend
// plugs in real per-firm resolution.
applyTenantTheme(resolveTenant())

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
