import type { TimerMode } from '../types/timer'

interface Props {
  mode: TimerMode
  onChange: (mode: TimerMode) => void
  disabled: boolean
}

const TABS: { id: TimerMode; label: string }[] = [
  { id: 'cycle', label: '사이클' },
  { id: 'focus', label: '공부' },
  { id: 'break', label: '쉬는 시간' },
]

export default function ModeTabs({ mode, onChange, disabled }: Props) {
  return (
    <div className="mode-tabs" role="tablist" aria-label="실행 모드 선택">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          className={`mode-tab${mode === tab.id ? ' mode-tab--active' : ''}`}
          aria-selected={mode === tab.id}
          onClick={() => onChange(tab.id)}
          disabled={disabled}
          aria-label={`${tab.label} 모드`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
