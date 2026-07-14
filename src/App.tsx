import { Navigate, Route, Routes } from "react-router-dom"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { AppSidebar } from "@/components/app-sidebar"
import { AskHaloProvider } from "@/components/ask-halo"
import Home from "@/routes/home"
import AskHalo from "@/routes/ask"
import Placeholder from "@/routes/placeholder"

export default function App() {
  return (
    <TooltipProvider delayDuration={200}>
      <AskHaloProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="min-w-0">
            <Routes>
              <Route path="/" element={<Home />} />
                <Route path="/ask" element={<AskHalo />} />
                <Route
                  path="/tools"
                  element={
                    <Placeholder
                      title="Financial Tools"
                      description="Calculators and planning tools live here. Choose Calculators or Goals from the sidebar."
                    />
                  }
                />
                <Route
                  path="/tools/calculators"
                  element={
                    <Placeholder
                      title="Calculators"
                      description="Retirement, savings, and scenario calculators. Coming in a later pass."
                    />
                  }
                />
                <Route
                  path="/tools/goals"
                  element={
                    <Placeholder
                      title="Goals"
                      description="Set and model financial goals. Coming in a later pass."
                    />
                  }
                />
                <Route
                  path="/advisors"
                  element={
                    <Placeholder
                      title="Advisor Match"
                      description="Get matched with a fiduciary advisor from Barron's top 100. Coming in a later pass."
                    />
                  }
                />
                <Route
                  path="/disclosures"
                  element={
                    <Placeholder
                      title="Disclosures"
                      description="Form ADV 2A, Form CRS, and privacy disclosures. Coming in a later pass."
                    />
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <Placeholder
                      title="Settings"
                      description="Profile, notifications, and advisor-sharing preferences. Coming in a later pass."
                    />
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </AskHaloProvider>
    </TooltipProvider>
  )
}
