// Applique les couleurs choisies dans le dashboard.
// - accent prédéfini : géré par les blocs :root[data-accent='…'] de style.css
// - accent personnalisé : on calcule ses variantes lisibles (texte sur fond clair,
//   texte sur fond noir, texte posé sur l'accent) pour garder un bon contraste.

const DEFAULT_BG = '#ece8df'
const DEFAULT_INK = '#111110'

const VARS = [
  '--color-signal',
  '--color-signal-dark',
  '--color-signal-light',
  '--color-signal-mark',
  '--color-on-signal',
  '--color-bone',
  '--color-ink',
]

export const isHex = (v) => /^#[0-9a-f]{6}$/i.test(v || '')

const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
const toHex = (rgb) => '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
const mix = (a, b, t) => toHex(toRgb(a).map((v, i) => v + (toRgb(b)[i] - v) * t))

function luminance(hex) {
  const [r, g, b] = toRgb(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

// Fonce (vers le noir) ou éclaircit (vers le blanc) jusqu'au contraste visé
function adjustFor(color, against, target, towards) {
  for (let t = 0; t <= 1; t += 0.05) {
    const c = mix(color, towards, t)
    if (contrast(c, against) >= target) return c
  }
  return towards
}

export function deriveAccent(accent, bg = DEFAULT_BG, ink = DEFAULT_INK) {
  const onDark = contrast(accent, '#111110')
  const onLight = contrast(accent, '#ffffff')
  return {
    signal: accent,
    dark: adjustFor(accent, bg, 4.5, '#000000'),
    light: adjustFor(accent, ink, 4.5, '#ffffff'),
    mark: contrast(accent, bg) >= 3 ? accent : adjustFor(accent, bg, 3, '#000000'),
    on: onDark >= onLight ? '#111110' : '#ffffff',
  }
}

export function applyTheme(theme = {}) {
  const root = document.documentElement
  VARS.forEach((v) => root.style.removeProperty(v))

  const bg = isHex(theme.background) ? theme.background : DEFAULT_BG
  const ink = isHex(theme.ink) ? theme.ink : DEFAULT_INK
  if (isHex(theme.background)) root.style.setProperty('--color-bone', bg)
  if (isHex(theme.ink)) root.style.setProperty('--color-ink', ink)

  if (theme.accent === 'custom' && isHex(theme.customAccent)) {
    root.dataset.accent = 'custom'
    const a = deriveAccent(theme.customAccent, bg, ink)
    root.style.setProperty('--color-signal', a.signal)
    root.style.setProperty('--color-signal-dark', a.dark)
    root.style.setProperty('--color-signal-light', a.light)
    root.style.setProperty('--color-signal-mark', a.mark)
    root.style.setProperty('--color-on-signal', a.on)
  } else {
    root.dataset.accent = theme.accent && theme.accent !== 'custom' ? theme.accent : 'orange'
  }
}
