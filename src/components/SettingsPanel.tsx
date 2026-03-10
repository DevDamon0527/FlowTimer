import { useState, useEffect, useRef } from 'react'
import type { TimerStatus } from '../types/timer'
import {
  type AlarmSoundType,
  ALARM_SOUND_OPTIONS,
  resumeAudioContext,
  previewAlarmSound,
} from '../utils/audio'

// ── 알람음 커스텀 드롭다운 ─────────────────────────────────────────────────────
// 네이티브 <select>의 <option>은 OS가 렌더링하므로 CSS로 배경/텍스트 색을 제어할 수 없다.
// 다크/라이트 모드 모두에서 가독성을 보장하기 위해 커스텀 listbox UI로 구현.

function AlarmSelect({
  options,
  value,
  onChange,
}: {
  options: { value: AlarmSoundType; label: string }[]
  value: AlarmSoundType
  onChange: (v: AlarmSoundType) => void
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedLabel = options.find(o => o.value === value)?.label ?? value

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  // 키보드 처리
  // Enter/Space → 열기/닫기, Escape → 닫기, ArrowDown/Up → 값 이동
  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen(o => !o)
    } else if (e.key === 'Escape') {
      setOpen(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const idx = options.findIndex(o => o.value === value)
      if (idx < options.length - 1) onChange(options[idx + 1].value)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const idx = options.findIndex(o => o.value === value)
      if (idx > 0) onChange(options[idx - 1].value)
    }
  }

  return (
    <div className="alarm-select" ref={containerRef}>
      {/* 트리거 버튼 — 현재 선택값 표시 + 열기/닫기 */}
      <button
        type="button"
        className={`alarm-select__trigger${open ? ' alarm-select__trigger--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`알람음: ${selectedLabel}`}
      >
        <span className="alarm-select__label">{selectedLabel}</span>
        <span className="alarm-select__arrow" aria-hidden="true">▾</span>
      </button>

      {/* 옵션 목록 — 위로 열림 (settings panel이 화면 하단에 위치) */}
      {open && (
        <ul
          className="alarm-select__list"
          role="listbox"
          aria-label="알람음 선택"
        >
          {options.map(opt => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`alarm-select__option${opt.value === value ? ' alarm-select__option--selected' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              onMouseDown={e => e.preventDefault()} // 클릭 시 trigger 버튼 blur 방지
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  studyMinutes:       number
  breakMinutes:       number
  alarmSound:         AlarmSoundType
  status:             TimerStatus
  onStudyChange:      (v: number) => void
  onBreakChange:      (v: number) => void
  onAlarmSoundChange: (v: AlarmSoundType) => void
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────────────────────

export default function SettingsPanel({
  studyMinutes,
  breakMinutes,
  alarmSound,
  status,
  onStudyChange,
  onBreakChange,
  onAlarmSoundChange,
}: Props) {
  const isRunning = status === 'running'

  // 숫자 입력은 로컬 string 상태로 관리 — 빈 문자열 입력 중에도 editable하게 유지
  const [studyStr, setStudyStr] = useState(String(studyMinutes))
  const [breakStr, setBreakStr] = useState(String(breakMinutes))

  // 부모 값이 외부에서 바뀐 경우(예: localStorage 복원) 표시값 동기화
  const prevStudy = useRef(studyMinutes)
  const prevBreak = useRef(breakMinutes)

  useEffect(() => {
    if (prevStudy.current !== studyMinutes) {
      prevStudy.current = studyMinutes
      setStudyStr(String(studyMinutes))
    }
  }, [studyMinutes])

  useEffect(() => {
    if (prevBreak.current !== breakMinutes) {
      prevBreak.current = breakMinutes
      setBreakStr(String(breakMinutes))
    }
  }, [breakMinutes])

  function handleStudyChange(value: string) {
    setStudyStr(value)
    const num = parseInt(value, 10)
    if (!isNaN(num) && num >= 1) onStudyChange(num)
  }

  function handleBreakChange(value: string) {
    setBreakStr(value)
    const num = parseInt(value, 10)
    if (!isNaN(num) && num >= 1) onBreakChange(num)
  }

  // blur 시 유효하지 않은 값이면 마지막 유효 값으로 되돌림
  function handleStudyBlur() {
    const num = parseInt(studyStr, 10)
    if (isNaN(num) || num < 1) setStudyStr(String(studyMinutes))
  }

  function handleBreakBlur() {
    const num = parseInt(breakStr, 10)
    if (isNaN(num) || num < 1) setBreakStr(String(breakMinutes))
  }

  // 미리듣기 — autoplay 정책을 위해 resumeAudioContext 먼저 호출
  function handlePreview() {
    resumeAudioContext()
    previewAlarmSound()
  }

  return (
    <div className="settings-panel" aria-label="타이머 설정">

      {/* 공부 시간 */}
      <div className="settings-row">
        <label className="settings-label" htmlFor="input-study">공부</label>
        <div className="settings-input-group">
          <input
            id="input-study"
            type="number"
            className="settings-input settings-input--number"
            value={studyStr}
            min={1}
            max={999}
            disabled={isRunning}
            onChange={(e) => handleStudyChange(e.target.value)}
            onBlur={handleStudyBlur}
            aria-label="공부 시간 (분)"
          />
          <span className="settings-unit">분</span>
        </div>
      </div>

      <div className="settings-sep" aria-hidden="true" />

      {/* 쉬는 시간 */}
      <div className="settings-row">
        <label className="settings-label" htmlFor="input-break">쉬기</label>
        <div className="settings-input-group">
          <input
            id="input-break"
            type="number"
            className="settings-input settings-input--number"
            value={breakStr}
            min={1}
            max={999}
            disabled={isRunning}
            onChange={(e) => handleBreakChange(e.target.value)}
            onBlur={handleBreakBlur}
            aria-label="쉬는 시간 (분)"
          />
          <span className="settings-unit">분</span>
        </div>
      </div>

      <div className="settings-sep" aria-hidden="true" />

      {/* 알람음 선택 + 미리듣기 버튼 */}
      <div className="settings-row">
        <span className="settings-label">알람음</span>
        <div className="settings-input-group settings-alarm-group">
          <AlarmSelect
            options={ALARM_SOUND_OPTIONS}
            value={alarmSound}
            onChange={onAlarmSoundChange}
          />
          <button
            type="button"
            className="settings-preview-btn"
            onClick={handlePreview}
            aria-label="알람음 미리 듣기"
            title="미리 듣기"
          >
            ▶
          </button>
        </div>
      </div>

    </div>
  )
}
