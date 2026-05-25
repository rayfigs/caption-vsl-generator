/**
 * Showreel configuration.
 * TFD brand palette + scene timing matches the 45-second script.
 */

export const BRAND = {
  bg: '#1C1D29',
  bgDeep: '#0e0f18',
  purple: '#9003F1',
  orange: '#FF5D00',
  white: '#ffffff',
  offWhite: '#e8e8f0',
  dimText: 'rgba(255,255,255,0.45)',
  font: 'Montserrat',
  fontWeight: '800',
}

/** Scene timing in frames at 30fps — matches the 45s script */
export const SCENES = [
  { id: 'raw_input',          label: 'Raw testimonial input',        from: 0,    duration: 90  },
  { id: 'clean_edit',         label: 'Segment extraction + clean edit', from: 90,  duration: 120 },
  { id: 'caption_engine',     label: 'Caption intelligence',         from: 210,  duration: 120 },
  { id: 'direct_response',    label: 'Direct response style',        from: 330,  duration: 120 },
  { id: 'authority_style',    label: 'Authority style',              from: 450,  duration: 120 },
  { id: 'disclaimer_system',  label: 'Compliance engine',            from: 570,  duration: 90  },
  { id: 'citation_system',    label: 'Citation system',              from: 660,  duration: 90  },
  { id: 'format_transformer', label: 'Format transformer',           from: 750,  duration: 120 },
  { id: 'broll_engine',       label: 'B-roll support',               from: 870,  duration: 120 },
  { id: 'brand_variations',   label: 'Brand + template system',      from: 990,  duration: 150 },
  { id: 'output_grid',        label: 'One input → many outputs',     from: 1140, duration: 210 },
] as const

export const TOTAL_FRAMES = 1350

/**
 * Safe zone constants for the 1080×1920 canvas.
 *
 * - top: reserve space below FrameLabel (top:52 + height ~80px)
 * - bottom: reserve space above ModuleTag pills (bottom:160 + up to ~120px of pill stack)
 * - left / right: standard horizontal bleed margin
 *
 * Scene-level annotations (badges, labels, banners) must stay
 * within these bounds. Never place persistent UI below SAFE.bottom
 * or above SAFE.top.
 */
export const SAFE = {
  top: 160,
  bottom: 300,   // bottom:300 keeps content clear of ModuleTag at bottom:160
  left: 44,
  right: 44,
} as const
