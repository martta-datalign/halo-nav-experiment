import * as React from "react"
import { Navigate, Route, Routes } from "react-router-dom"

import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { AccountsProvider } from "@/components/accounts-provider"
import { AccountConnectionNudge } from "@/components/account-connection-nudge"
import { AskHaloProvider } from "@/components/ask-halo"
import { AdvisorMatchOnboarding } from "@/components/advisor-match-onboarding"
import { DemoDataToggle } from "@/components/demo-data-toggle"
import type { AdvisorAppointment } from "@/lib/advisor-match"
import Home from "@/routes/home"
import AskHalo from "@/routes/ask"
import Calculators from "@/routes/calculators"
import Goals from "@/routes/goals"
import Accounts from "@/routes/accounts"
import Disclosures from "@/routes/disclosures"
import Help from "@/routes/help"
import Advisors from "@/routes/advisors"
import Placeholder from "@/routes/placeholder"

export default function App() {
  const [advisorIntroOpen, setAdvisorIntroOpen] = React.useState(false)
  const [appointment, setAppointment] = React.useState<AdvisorAppointment | null>(null)
  const [analysisReady, setAnalysisReady] = React.useState(true)
  const [connectNudgeOpen, setConnectNudgeOpen] = React.useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(
    () => typeof localStorage !== "undefined" && localStorage.getItem("halo:nav-collapsed") === "1"
  )

  const toggleSidebar = React.useCallback(() => {
    setSidebarCollapsed((collapsed) => {
      const next = !collapsed
      try {
        localStorage.setItem("halo:nav-collapsed", next ? "1" : "0")
      } catch {
        // Ignore storage failures (private mode, etc.) — collapse still works this session.
      }
      return next
    })
  }, [])

  function dismissAdvisorIntro() {
    setAdvisorIntroOpen(false)
  }

  function confirmAdvisorAppointment(nextAppointment: AdvisorAppointment) {
    setAppointment(nextAppointment)
  }

  function completeAdvisorIntro() {
    setAdvisorIntroOpen(false)
  }

  function setDemoData(filled: boolean) {
    setAnalysisReady(filled)
    if (filled) setConnectNudgeOpen(false)
  }

  function openAccountConnection() {
    setConnectNudgeOpen(false)
    setAdvisorIntroOpen(true)
  }

  return (
    <TooltipProvider delayDuration={200}>
      <AccountsProvider filled={analysisReady}>
        <AskHaloProvider>
          <div className="flex h-svh flex-col overflow-hidden">
            <TopNav />
            <div className="flex min-h-0 flex-1">
              <AppSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
              <main className="min-w-0 flex-1 overflow-y-auto">
              <Routes>
              <Route
                path="/"
                element={
                  <Home
                    analysisReady={analysisReady}
                    onConnectAccounts={openAccountConnection}
                  />
                }
              />
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
              <Route
                path="/tools/goals"
                element={<Goals filled={analysisReady} />}
              />
              <Route
                path="/advisors"
                element={
                  <Advisors
                    appointment={appointment}
                    onOpenMatch={() => setAdvisorIntroOpen(true)}
                  />
                }
              />
              <Route path="/help" element={<Help />} />
              <Route path="/faq" element={<Navigate to="/help" replace />} />
              <Route path="/disclosures" element={<Disclosures />} />
              <Route
                path="/settings"
                element={
                  <Placeholder
                    title="Settings"
                    description="Profile, notifications, and advisor-sharing preferences. This section isn't available yet."
                  />
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              </main>
            </div>
            <AdvisorMatchOnboarding
              open={advisorIntroOpen}
              appointment={appointment}
              onDismiss={dismissAdvisorIntro}
              onConfirm={confirmAdvisorAppointment}
              onComplete={completeAdvisorIntro}
              onAnalysisReady={() => {
                setAnalysisReady(true)
                setConnectNudgeOpen(false)
              }}
              onAccountsSkipped={() => setConnectNudgeOpen(true)}
            />
            <AccountConnectionNudge
              open={connectNudgeOpen}
              onOpenChange={setConnectNudgeOpen}
              onConnect={openAccountConnection}
            />
          </div>
          <Toaster />
          <DemoDataToggle filled={analysisReady} onChange={setDemoData} />
        </AskHaloProvider>
      </AccountsProvider>
    </TooltipProvider>
  )
}
