const KEY = 'focus-timer-v1'

export interface StoredSettings {
  studyMinutes: number
  breakMinutes: number
  title: string
}

export function loadSettings(): Partial<StoredSettings> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Partial<StoredSettings>
  } catch {
    return {}
  }
}

export function saveSettings(settings: StoredSettings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings))
  } catch {
    // localStorage unavailable (private browsing, storage full, etc.)
  }
}
