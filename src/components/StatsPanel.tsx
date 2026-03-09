import { formatFocusTime } from '../utils/format'

interface Props {
  todayFocusMs: number  // today's focus (study) time
  todayBreakMs: number  // today's break time
  todayTotalMs: number  // focus + break combined
}

export default function StatsPanel({ todayFocusMs, todayBreakMs, todayTotalMs }: Props) {
  return (
    <div className="stats-panel" aria-label="오늘 시간 통계">

      {/* 오늘 총 공부 시간 */}
      <div className="stat-card">
        <span className="stat-label">공부</span>
        <span className="stat-value stat-value--study">{formatFocusTime(todayFocusMs)}</span>
      </div>

      <div className="stat-sep" aria-hidden="true" />

      {/* 오늘 총 쉬는 시간 */}
      <div className="stat-card">
        <span className="stat-label">휴식</span>
        <span className="stat-value stat-value--break">{formatFocusTime(todayBreakMs)}</span>
      </div>

      <div className="stat-sep" aria-hidden="true" />

      {/* 오늘 전체 사용 시간 (공부 + 휴식) */}
      <div className="stat-card">
        <span className="stat-label">합산</span>
        <span className="stat-value">{formatFocusTime(todayTotalMs)}</span>
      </div>

    </div>
  )
}
