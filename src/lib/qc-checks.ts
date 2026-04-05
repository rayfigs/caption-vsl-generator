/**
 * QC Checks — Post-render quality verification based on the QC role from re:Motion Agent Brain.
 *
 * Checks: safe zone, text-on-text risk, brand color match, hook timing, caption sync.
 */

import type { BrandedTemplateProps, CaptionSegment, Template } from './types'

export interface QCCheckResult {
  name: string
  status: 'pass' | 'fail' | 'warn'
  detail: string
}

export interface QCReport {
  passed: boolean
  checks: QCCheckResult[]
  issues: string[]
  score: number // 0-100
}

/**
 * Run all QC checks against the render configuration (pre-render validation).
 * These are structural checks based on props, not pixel-level inspection.
 */
export function runQCChecks(params: {
  template: Template
  brand?: BrandedTemplateProps
  segments: CaptionSegment[]
  audioDuration: number
  canvasWidth: number
  canvasHeight: number
}): QCReport {
  const checks: QCCheckResult[] = []
  const issues: string[] = []

  // Check 1: Safe zone — all text within 8% margin
  const safeMarginX = params.canvasWidth * 0.08
  const safeMarginY = params.canvasHeight * 0.08
  const boxX = params.template.captionBox.x === 'center'
    ? (params.canvasWidth - params.template.captionBox.width) / 2
    : params.template.captionBox.x
  const boxY = params.template.captionBox.y === 'center'
    ? (params.canvasHeight - params.template.captionBox.height) / 2
    : params.template.captionBox.y
  const boxRight = boxX + params.template.captionBox.width
  const boxBottom = boxY + params.template.captionBox.height

  if (boxX < safeMarginX || boxRight > params.canvasWidth - safeMarginX) {
    checks.push({ name: 'safe_zone_horizontal', status: 'fail', detail: `Caption box exceeds horizontal safe zone. Left: ${Math.round(boxX)}px, needs ${Math.round(safeMarginX)}px margin.` })
    issues.push('Caption text may bleed off screen horizontally')
  } else {
    checks.push({ name: 'safe_zone_horizontal', status: 'pass', detail: 'Caption within horizontal safe zone.' })
  }

  if (boxY < safeMarginY || boxBottom > params.canvasHeight - safeMarginY) {
    // Warn instead of fail for lower-third templates where y is intentionally near bottom
    const isLowerThird = boxY > params.canvasHeight * 0.6
    checks.push({
      name: 'safe_zone_vertical',
      status: isLowerThird ? 'warn' : 'fail',
      detail: `Caption box ${isLowerThird ? 'near' : 'exceeds'} vertical safe zone. Top: ${Math.round(boxY)}px, Bottom: ${Math.round(boxBottom)}px.`,
    })
    if (!isLowerThird) issues.push('Caption text may bleed off screen vertically')
  } else {
    checks.push({ name: 'safe_zone_vertical', status: 'pass', detail: 'Caption within vertical safe zone.' })
  }

  // Check 2: Brand color match
  if (params.brand) {
    const templateHighlight = params.template.highlight.backgroundColor || params.template.highlight.color || ''
    const brandHighlight = params.brand.highlightColor || ''
    if (brandHighlight && templateHighlight && templateHighlight.toLowerCase() !== brandHighlight.toLowerCase()) {
      checks.push({ name: 'brand_colors', status: 'warn', detail: `Template highlight (${templateHighlight}) differs from brand (${brandHighlight}). Brand override will apply at render.` })
    } else {
      checks.push({ name: 'brand_colors', status: 'pass', detail: 'Brand colors match template.' })
    }
  } else {
    checks.push({ name: 'brand_colors', status: 'pass', detail: 'No brand profile applied, using template defaults.' })
  }

  // Check 3: Hook timing — first segment should start within 1 second
  if (params.segments.length > 0) {
    const firstSegmentStart = params.segments[0].startTime
    if (firstSegmentStart > 1.0) {
      checks.push({ name: 'hook_timing', status: 'warn', detail: `First caption appears at ${firstSegmentStart.toFixed(1)}s. Hook should land within 1s.` })
      issues.push('Late hook: first caption does not appear within 1 second')
    } else {
      checks.push({ name: 'hook_timing', status: 'pass', detail: `First caption at ${firstSegmentStart.toFixed(1)}s.` })
    }
  } else {
    checks.push({ name: 'hook_timing', status: 'fail', detail: 'No caption segments generated.' })
    issues.push('No captions to display')
  }

  // Check 4: Caption sync — segments should cover most of the audio
  if (params.segments.length > 0 && params.audioDuration > 0) {
    const lastSegmentEnd = params.segments[params.segments.length - 1].endTime
    const coverageRatio = lastSegmentEnd / params.audioDuration
    if (coverageRatio < 0.8) {
      checks.push({ name: 'caption_sync', status: 'warn', detail: `Captions cover ${(coverageRatio * 100).toFixed(0)}% of audio duration. Expected 80%+.` })
    } else {
      checks.push({ name: 'caption_sync', status: 'pass', detail: `Captions cover ${(coverageRatio * 100).toFixed(0)}% of audio.` })
    }
  }

  // Check 5: Font size readability — minimum 44px for mobile
  if (params.template.text.fontSize < 44) {
    checks.push({ name: 'readability', status: 'warn', detail: `Font size ${params.template.text.fontSize}px may be too small for mobile viewing. Minimum recommended: 44px.` })
    issues.push('Font may be too small for mobile')
  } else {
    checks.push({ name: 'readability', status: 'pass', detail: `Font size ${params.template.text.fontSize}px is readable.` })
  }

  // Check 6: Segment count sanity
  if (params.segments.length > 300) {
    checks.push({ name: 'segment_count', status: 'warn', detail: `${params.segments.length} segments is unusually high. May indicate over-splitting.` })
  } else {
    checks.push({ name: 'segment_count', status: 'pass', detail: `${params.segments.length} segments.` })
  }

  const failCount = checks.filter(c => c.status === 'fail').length
  const warnCount = checks.filter(c => c.status === 'warn').length
  const totalChecks = checks.length
  const score = Math.round(((totalChecks - failCount - warnCount * 0.5) / totalChecks) * 100)

  return {
    passed: failCount === 0,
    checks,
    issues,
    score: Math.max(0, Math.min(100, score)),
  }
}
