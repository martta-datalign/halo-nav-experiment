import * as React from "react"

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = React.useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(REDUCED_MOTION_QUERY).matches
  )

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY)
    const updatePreference = () => setReducedMotion(mediaQuery.matches)

    mediaQuery.addEventListener("change", updatePreference)
    return () => mediaQuery.removeEventListener("change", updatePreference)
  }, [])

  return reducedMotion
}
