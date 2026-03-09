import { useMemo } from 'react'
import type { Phase } from '../types/timer'

interface Props {
  /** 0.0 (empty) → 1.0 (full / phase just started) */
  progress: number
  phase: Phase
  size?: number
  strokeWidth?: number
}

export default function ProgressRing({ progress, phase, size = 280, strokeWidth = 6 }: Props) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  // dashoffset = 0  → full circle visible (progress = 1)
  // dashoffset = C  → nothing visible   (progress = 0)
  const dashOffset = useMemo(() => {
    const clamped = Math.max(0, Math.min(1, progress))
    return circumference * (1 - clamped)
  }, [circumference, progress])

  const cx = size / 2
  const cy = size / 2
  const colorVar = phase === 'study' ? 'var(--color-study)' : 'var(--color-break)'

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      className="progress-ring"
    >
      {/* Track */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="var(--color-ring-track)"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={colorVar}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 0.15s linear, stroke 0.4s ease' }}
      />
    </svg>
  )
}
