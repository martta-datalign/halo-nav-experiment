import { Navigate, Route, Routes } from "react-router-dom"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { AppSidebar } from "@/components/app-sidebar"
import { AskHaloProvider } from "@/components/ask-halo"
import Home from "@/routes/home"
import AskHalo from "@/routes/ask"
import Calculators from "@/routes/calculators"
import Goals from "@/routes/goals"
import Accounts from "@/routes/accounts"
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
              <Route path="/accounts" element={<Accounts />} />
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
              <Route path="/tools/calculators" element={<Calculators />} />
              <Route path="/tools/goals" element={<Goals />} />
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
                path="/faq"
                element={
                  <Placeholder
                    title="Frequently Asked Questions"
                    description="Find answers to common questions about Halo AI, your accounts, and financial planning."
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
