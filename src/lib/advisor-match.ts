export const advisorMatch = {
  firm: "Carson Wealth Partners",
  logo: "/carson-wealth-logo.svg",
  website: "carsonwealth.com",
  websiteUrl: "https://www.carsonwealth.com/",
  phone: "+1 (888) 321-0808",
  advFormUrl: "https://reports.adviserinfo.sec.gov/reports/ADV/155344/PDF/155344.pdf",
  secProfileUrl: "https://adviserinfo.sec.gov/firm/summary/155344",
  matchReasons: [
    "Retirement planning",
    "Comprehensive wealth planning",
    "Hands-off portfolio management",
  ],
  expertise: [
    "Retirement income strategies",
    "Tax-aware investing",
    "Long-term wealth building",
    "Portfolio management",
  ],
  note:
    "We’ll learn what matters to you, answer your questions, and help you decide whether Carson Wealth is the right fit.",
} as const

export const appointmentDates = [
  { id: "2026-07-23", weekday: "Thu", month: "Jul", day: 23 },
  { id: "2026-07-24", weekday: "Fri", month: "Jul", day: 24 },
  { id: "2026-07-27", weekday: "Mon", month: "Jul", day: 27 },
  { id: "2026-07-28", weekday: "Tue", month: "Jul", day: 28 },
] as const

export const appointmentTimes = [
  "9:30 AM",
  "10:00 AM",
  "11:30 AM",
  "1:00 PM",
  "2:30 PM",
  "4:00 PM",
] as const

export type AdvisorAppointment = {
  date: (typeof appointmentDates)[number]["id"]
  time: (typeof appointmentTimes)[number]
  label: string
}

export function appointmentLabel(dateId: string, time: string) {
  const date = new Date(`${dateId}T12:00:00`)
  const label = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
  return `${label} at ${time}`
}

export function downloadAdvisorAppointment({ date, time }: AdvisorAppointment) {
  const [hourText, minuteAndPeriod] = time.split(":")
  const [minuteText, period] = minuteAndPeriod.split(" ")
  let hour = Number(hourText) % 12
  if (period === "PM") hour += 12

  const startMinutes = hour * 60 + Number(minuteText)
  const endMinutes = startMinutes + 30
  const formatTime = (minutes: number) =>
    `${String(Math.floor(minutes / 60)).padStart(2, "0")}${String(minutes % 60).padStart(2, "0")}00`
  const compactDate = date.replaceAll("-", "")
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
  const escapeIcs = (value: string) =>
    value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;")
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Halo by Datalign//Advisor Match//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${compactDate}-${formatTime(startMinutes)}@halo.datalign.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=America/New_York:${compactDate}T${formatTime(startMinutes)}`,
    `DTEND;TZID=America/New_York:${compactDate}T${formatTime(endMinutes)}`,
    `SUMMARY:${escapeIcs(`Introduction with ${advisorMatch.firm}`)}`,
    `DESCRIPTION:${escapeIcs("A complimentary 30-minute RIA firm introduction scheduled through Halo.")}`,
    "LOCATION:Secure video call",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")

  const url = URL.createObjectURL(new Blob([calendar], { type: "text/calendar;charset=utf-8" }))
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `halo-ria-introduction-${date}.ics`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
