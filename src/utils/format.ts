/** Format milliseconds as MM:SS string */
export function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function minutesToMs(minutes: number): number {
  return minutes * 60 * 1000
}

/** Format milliseconds as human-readable study time (e.g. "1시간 20분") */
export function formatFocusTime(ms: number): string {
  const totalMinutes = Math.floor(ms / 60_000)
  if (totalMinutes === 0) return '0분'
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}분`
  if (minutes === 0) return `${hours}시간`
  return `${hours}시간 ${minutes}분`
}
