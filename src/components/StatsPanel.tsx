import { formatFocusTime } from '../utils/format'

interface Props {
  todayMs: number
  totalMs: number
}

export default function StatsPanel({ todayMs, totalMs }: Props) {
  return (
    <div className="stats-panel" aria-label="집중 시간 통계">
      <div className="stat-card">
        <span className="stat-label">오늘 집중</span>
        <span className="stat-value">{formatFocusTime(todayMs)}</span>
      </div>
      <div className="stat-sep" aria-hidden="true" />
      <div className="stat-card">
        <span className="stat-label">전체 누적</span>
        <span className="stat-value">{formatFocusTime(totalMs)}</span>
      </div>
    </div>
  )
}
