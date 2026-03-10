import type { Phase } from '../types/timer'

// ── 타입 정의 ─────────────────────────────────────────────────────────────────

/**
 * 알람음 preset 식별자.
 * 새 preset 추가 시:
 *   1. 이 타입에 값을 추가
 *   2. ALARM_PRESETS 배열 하단에 AlarmPreset 객체를 구현
 *   (ALARM_SOUND_OPTIONS은 자동으로 갱신됨)
 */
export type AlarmSoundType =
  | 'beep1'
  | 'beep2'
  | 'softBell'
  | 'digitalTone'
  | 'chime'
  | 'doubleBeep'
  | 'softAlert'
  | 'focusEnd'

/** preset 구현 인터페이스 — 배열로 관리해 손쉽게 추가/삭제 가능 */
interface AlarmPreset {
  readonly value: AlarmSoundType
  readonly label: string          // UI에 표시되는 이름
  play(ctx: AudioContext, phase: Phase): void
}

// ── 모듈 상태 ─────────────────────────────────────────────────────────────────

let ctx: AudioContext | null = null
let _soundEnabled = true
let _alarmSound: AlarmSoundType = 'beep1'
let _lastPlayTime = 0

// 가장 긴 preset(Soft Bell ~2.4s)에 맞게 설정 — 짧은 음이 중복 재생되는 것을 방지
const DEBOUNCE_MS = 2500

// ── AudioContext 관리 ─────────────────────────────────────────────────────────

function getCtx(): AudioContext | null {
  if (
    typeof AudioContext === 'undefined' &&
    typeof (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext === 'undefined'
  ) {
    return null
  }
  if (!ctx) {
    const WinCtx = (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    ctx = new (AudioContext ?? WinCtx!)()
  }
  return ctx
}

/** 브라우저 autoplay 정책 통과를 위해 사용자 입력 이벤트 핸들러 안에서 호출 */
export function resumeAudioContext(): void {
  const audioCtx = getCtx()
  if (audioCtx && audioCtx.state === 'suspended') {
    void audioCtx.resume()
  }
}

// ── 외부 설정 API ─────────────────────────────────────────────────────────────

/** 알람 on/off 전환 */
export function setSoundEnabled(enabled: boolean): void {
  _soundEnabled = enabled
}

/** 활성 알람 preset 변경 */
export function setAlarmSound(type: AlarmSoundType): void {
  _alarmSound = type
}

/** 현재 선택된 알람 preset 반환 */
export function getAlarmSound(): AlarmSoundType {
  return _alarmSound
}

// ── 내부 유틸리티 ─────────────────────────────────────────────────────────────

/** 중복 재생 방지: on/off 확인 + debounce 체크 */
function canPlay(): boolean {
  if (!_soundEnabled) return false
  const now = Date.now()
  if (now - _lastPlayTime < DEBOUNCE_MS) return false
  _lastPlayTime = now
  return true
}

/**
 * OscillatorNode 하나를 생성해 지정된 시간에 예약 재생한다.
 * @param attackTime - 볼륨이 0 → volume 까지 올라가는 시간 (기본 0.01s = 즉시)
 */
function scheduleTone(
  audioCtx: AudioContext,
  frequency: number,
  startOffset: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine',
  attackTime: number = 0.01,
): void {
  const osc  = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.connect(gain)
  gain.connect(audioCtx.destination)

  osc.type = type
  osc.frequency.value = frequency

  const t = audioCtx.currentTime + startOffset
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(volume, t + attackTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)

  osc.start(t)
  osc.stop(t + duration + 0.05)
}

// ── Preset 구현 목록 ──────────────────────────────────────────────────────────
//
// 모든 preset은 phase에 따라 다른 소리를 낸다:
//   phase === 'break' → 공부 종료, 쉬기 시작 → 편안한/내림 느낌
//   phase === 'study' → 쉬기 종료, 공부 시작 → 활기/오름 느낌
//
// 각 소리는 1.5~2.5초 범위로 설계해 사용자가 충분히 인지할 수 있게 했다.

const ALARM_PRESETS: AlarmPreset[] = [

  // ① Beep 1 — 부드러운 두 음절 × 2회 (~1.65s)
  //   쉬기 시작: 고→저 (편안함), 공부 시작: 저→고 (집중 신호)
  {
    value: 'beep1',
    label: 'Beep 1',
    play(ctx, phase) {
      const [a, b] = phase === 'break' ? [784, 659] : [659, 784]
      scheduleTone(ctx, a, 0.00, 0.35, 0.25)
      scheduleTone(ctx, b, 0.30, 0.45, 0.22)
      // 잠시 후 한 번 더 반복 (인지 강화)
      scheduleTone(ctx, a, 0.90, 0.30, 0.20)
      scheduleTone(ctx, b, 1.20, 0.40, 0.17)
    },
  },

  // ② Beep 2 — 짧고 선명한 단음 × 3회, 2세트 (~1.65s)
  //   쉬기 시작: 낮은 음(440Hz), 공부 시작: 중간 음(660Hz)
  {
    value: 'beep2',
    label: 'Beep 2',
    play(ctx, phase) {
      const freq = phase === 'break' ? 440 : 660
      // 1세트
      scheduleTone(ctx, freq, 0.00, 0.15, 0.30)
      scheduleTone(ctx, freq, 0.25, 0.15, 0.28)
      scheduleTone(ctx, freq, 0.50, 0.15, 0.25)
      // 2세트 (0.5s 간격 후 반복)
      scheduleTone(ctx, freq, 1.00, 0.15, 0.28)
      scheduleTone(ctx, freq, 1.25, 0.15, 0.25)
      scheduleTone(ctx, freq, 1.50, 0.15, 0.22)
    },
  },

  // ③ Soft Bell — 긴 decay 벨소리 × 2회 (~2.4s)
  //   명상/집중 앱에서 자주 쓰이는 은은한 벨 느낌
  //   쉬기 시작: C5(523Hz), 공부 시작: E5(659Hz)
  {
    value: 'softBell',
    label: 'Soft Bell',
    play(ctx, phase) {
      const freq = phase === 'break' ? 523 : 659
      scheduleTone(ctx, freq, 0.0, 1.1, 0.35)
      scheduleTone(ctx, freq, 1.3, 1.0, 0.27)
    },
  },

  // ④ Digital Tone — square 파형 3음 패턴 × 2회 (~2.4s)
  //   레트로 전자기기 알림 느낌
  //   쉬기 시작: 고→중→저 내림, 공부 시작: 저→중→고 오름
  {
    value: 'digitalTone',
    label: 'Digital',
    play(ctx, phase) {
      const [f1, f2, f3] = phase === 'break'
        ? [600, 400, 280]   // 내림
        : [280, 500, 750]   // 오름
      // 1회
      scheduleTone(ctx, f1, 0.00, 0.12, 0.18, 'square')
      scheduleTone(ctx, f2, 0.15, 0.12, 0.18, 'square')
      scheduleTone(ctx, f3, 0.30, 0.18, 0.18, 'square')
      // 2회
      scheduleTone(ctx, f1, 1.00, 0.12, 0.15, 'square')
      scheduleTone(ctx, f2, 1.15, 0.12, 0.15, 'square')
      scheduleTone(ctx, f3, 1.30, 0.18, 0.15, 'square')
    },
  },

  // ⑤ Chime — 3음 아르페지오 × 2회 (~2.2s)
  //   밝고 경쾌한 차임 느낌
  //   쉬기 시작: G5→E5→C5 내림, 공부 시작: C5→E5→G5 오름
  {
    value: 'chime',
    label: 'Chime',
    play(ctx, phase) {
      const [f1, f2, f3] = phase === 'break'
        ? [784, 659, 523]   // G5→E5→C5
        : [523, 659, 784]   // C5→E5→G5
      // 1회
      scheduleTone(ctx, f1, 0.00, 0.40, 0.25)
      scheduleTone(ctx, f2, 0.30, 0.40, 0.25)
      scheduleTone(ctx, f3, 0.60, 0.65, 0.25)
      // 2회
      scheduleTone(ctx, f1, 1.35, 0.32, 0.20)
      scheduleTone(ctx, f2, 1.62, 0.32, 0.22)
      scheduleTone(ctx, f3, 1.90, 0.55, 0.22)
    },
  },

  // ⑥ Double Beep — beep-beep 패턴 × 3세트 (~1.7s)
  //   짝수 리듬으로 명확하게 두 번씩 반복
  {
    value: 'doubleBeep',
    label: 'Double Beep',
    play(ctx, phase) {
      const freq = phase === 'break' ? 500 : 750
      // 세트 1, 2, 3
      scheduleTone(ctx, freq, 0.00, 0.14, 0.30)
      scheduleTone(ctx, freq, 0.20, 0.14, 0.30)
      scheduleTone(ctx, freq, 0.65, 0.14, 0.28)
      scheduleTone(ctx, freq, 0.85, 0.14, 0.28)
      scheduleTone(ctx, freq, 1.30, 0.14, 0.25)
      scheduleTone(ctx, freq, 1.50, 0.14, 0.25)
    },
  },

  // ⑦ Soft Alert — 천천히 페이드인 후 자연스럽게 사라지는 경고음 (~1.8s)
  //   attackTime=0.5s: 갑자기 울리지 않아 놀라지 않게
  {
    value: 'softAlert',
    label: 'Soft Alert',
    play(ctx, phase) {
      const freq = phase === 'break' ? 440 : 620
      scheduleTone(ctx, freq, 0, 1.8, 0.30, 'sine', 0.5)
    },
  },

  // ⑧ Focus End — 단계 전환을 상징하는 특별한 패턴 (~1.5~1.8s)
  //   쉬기 시작: 고→중→저 하강 (충분히 집중했음을 알리는 완료 신호)
  //   공부 시작: 저→중→고→최고 상승 (새 집중 사이클 시작 신호)
  {
    value: 'focusEnd',
    label: 'Focus End',
    play(ctx, phase) {
      if (phase === 'break') {
        scheduleTone(ctx, 880,  0.00, 0.35, 0.25)
        scheduleTone(ctx, 660,  0.35, 0.40, 0.25)
        scheduleTone(ctx, 440,  0.75, 0.70, 0.23)
      } else {
        scheduleTone(ctx, 440,  0.00, 0.28, 0.20)
        scheduleTone(ctx, 660,  0.28, 0.28, 0.23)
        scheduleTone(ctx, 880,  0.56, 0.35, 0.27)
        scheduleTone(ctx, 1047, 0.91, 0.65, 0.25)  // C6 — 집중 시작 강조
      }
    },
  },

]

// ALARM_PRESETS에서 UI 표시용 옵션을 자동 생성 (수동 동기화 불필요)
export const ALARM_SOUND_OPTIONS = ALARM_PRESETS.map(p => ({
  value: p.value,
  label: p.label,
}))

// ── 공개 API ──────────────────────────────────────────────────────────────────

/**
 * phase 전환 시 선택된 알람음을 재생한다.
 * 알람 on/off 및 debounce 조건을 모두 확인한 뒤 재생.
 */
export function playTransitionSound(phase: Phase): void {
  if (!canPlay()) return
  const audioCtx = getCtx()
  if (!audioCtx) return

  const preset = ALARM_PRESETS.find(p => p.value === _alarmSound)
  if (!preset) return

  try {
    preset.play(audioCtx, phase)
  } catch {
    // AudioContext 오류 무시
  }
}

/**
 * 단일 모드(공부 전용 / 쉬기 전용) 완료 시 울리는 완료 차임.
 * C5→E5→G5→C6 상승으로 "끝났다"는 느낌을 명확히 전달.
 */
export function playCompletionSound(): void {
  if (!canPlay()) return
  const audioCtx = getCtx()
  if (!audioCtx) return

  try {
    scheduleTone(audioCtx, 523,  0.00, 0.30, 0.25)  // C5
    scheduleTone(audioCtx, 659,  0.25, 0.30, 0.23)  // E5
    scheduleTone(audioCtx, 784,  0.50, 0.40, 0.23)  // G5
    scheduleTone(audioCtx, 1047, 0.85, 0.75, 0.20)  // C6
  } catch {
    // ignore
  }
}

/**
 * 설정 UI의 미리듣기 버튼용 함수.
 * 알람 on/off 설정과 무관하게 재생되며, debounce는 유지된다.
 * phase='study' 기준으로 재생해 실제 전환 알람과 동일한 패턴을 들을 수 있다.
 */
export function previewAlarmSound(): void {
  const now = Date.now()
  if (now - _lastPlayTime < DEBOUNCE_MS) return
  _lastPlayTime = now

  const audioCtx = getCtx()
  if (!audioCtx) return

  const preset = ALARM_PRESETS.find(p => p.value === _alarmSound)
  if (!preset) return

  try {
    preset.play(audioCtx, 'study')
  } catch {
    // ignore
  }
}
