import * as React from "react"

import { accounts as initialAccounts, type Account } from "@/lib/data"

type AccountsContextValue = {
  accounts: Account[]
  addAccount: (account: Account) => void
  removeAccount: (accountId: string) => void
}

const AccountsContext = React.createContext<AccountsContextValue | null>(null)

const seededAccounts = () =>
  initialAccounts.map((account) => ({
    ...account,
    source: account.source ?? "connected",
  }))

export function AccountsProvider({
  children,
  filled = true,
}: {
  children: React.ReactNode
  filled?: boolean
}) {
  const [accounts, setAccounts] = React.useState<Account[]>(() =>
    filled ? seededAccounts() : []
  )

  React.useEffect(() => {
    setAccounts(filled ? seededAccounts() : [])
  }, [filled])

  const addAccount = React.useCallback((account: Account) => {
    setAccounts((current) => [account, ...current])
  }, [])

  const removeAccount = React.useCallback((accountId: string) => {
    setAccounts((current) => current.filter((account) => account.id !== accountId))
  }, [])

  const value = React.useMemo(
    () => ({ accounts, addAccount, removeAccount }),
    [accounts, addAccount, removeAccount]
  )

  return <AccountsContext.Provider value={value}>{children}</AccountsContext.Provider>
}

export function useAccounts() {
  const context = React.useContext(AccountsContext)
  if (!context) throw new Error("useAccounts must be used within <AccountsProvider>")
  return context
}
