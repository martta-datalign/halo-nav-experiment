import * as React from "react"

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = React.useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(REDUCED_MOTION_QUERY).matches
  )

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY)
    const updatePreference = () => setReducedMotion(mediaQuery.matches)

    // Safari versions before MediaQueryList adopted EventTarget use the
    // legacy listener API. Keep the fallback so motion preferences still
    // update without requiring a reload on older iOS devices.
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updatePreference)
      return () => mediaQuery.removeEventListener("change", updatePreference)
    }

    mediaQuery.addListener(updatePreference)
    return () => mediaQuery.removeListener(updatePreference)
  }, [])

  return reducedMotion
}
