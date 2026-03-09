let faviconLink: HTMLLinkElement | null = null

function getLink(): HTMLLinkElement {
  if (!faviconLink) {
    faviconLink =
      document.querySelector<HTMLLinkElement>('link[rel="icon"]') ??
      document.createElement('link')
    faviconLink.rel = 'icon'
    if (!faviconLink.parentNode) document.head.appendChild(faviconLink)
  }
  return faviconLink
}

/** Render a filled circle favicon in the given color */
export function setFavicon(color: string): void {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(16, 16, 14, 0, Math.PI * 2)
    ctx.fill()
    getLink().href = canvas.toDataURL('image/png')
  } catch {
    // canvas not available — ignore
  }
}
