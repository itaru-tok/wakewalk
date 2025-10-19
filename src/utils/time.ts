export function formatClockTime(date: Date): string {
  const hours = date.getHours().toString()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours} : ${minutes}`
}

export function getDateKey(date: Date) {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addMinutes(date: Date, minutes: number) {
  const next = new Date(date)
  next.setMinutes(next.getMinutes() + minutes)
  return next
}

export function isBefore(a: Date, b: Date) {
  return a.getTime() < b.getTime()
}

export function clampDateToMinute(date: Date) {
  const next = new Date(date)
  next.setSeconds(0, 0)
  return next
}
