import { formatTime } from '../utils/format'
import type { Phase } from '../types/timer'
import ProgressRing from './ProgressRing'

interface Props {
  displayMs: number
  totalMs: number
  phase: Phase
}

export default function TimerDisplay({ displayMs, totalMs, phase }: Props) {
  const progress = totalMs > 0 ? displayMs / totalMs : 1
  const timeStr = formatTime(displayMs)

  return (
    <div className="timer-display">
      <div className="timer-ring-wrapper">
        <ProgressRing progress={progress} phase={phase} size={320} strokeWidth={7} />
        <div className="timer-time">
          <span
            className="timer-digits"
            aria-label={`남은 시간 ${timeStr}`}
            aria-live="off"
          >
            {timeStr}
          </span>
        </div>
      </div>
    </div>
  )
}
