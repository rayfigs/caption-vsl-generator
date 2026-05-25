import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { FrameLabel } from '../components/FrameLabel'
import { SceneBackground } from '../components/SceneBackground'
import { ModuleTag } from '../components/ModuleTag'
import { BRAND, SAFE } from '../data/showreel.config'

/**
 * Scene 08: Format Transformer
 * Same content shown across portrait (9:16), square (1:1), and landscape (16:9).
 * Face stays visible in each.
 * Voiceover: "Reframe the same content for every format."
 */
export const Scene08FormatTransformer: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const fadeIn = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' })

  const panelSpring = (startFrame: number) => {
    const f = Math.max(0, frame - startFrame)
    const s = spring({ frame: f, fps, config: { damping: 28, stiffness: 300, mass: 0.7 } })
    return {
      opacity: interpolate(s, [0, 1], [0, 1], { extrapolateRight: 'clamp' }),
      y: interpolate(s, [0, 1], [30, 0], { extrapolateRight: 'clamp' }),
      scale: interpolate(s, [0, 1], [0.92, 1], { extrapolateRight: 'clamp' }),
    }
  }

  const p1 = panelSpring(8)
  const p2 = panelSpring(22)
  const p3 = panelSpring(36)

  // Arrow between panels
  const arrowOpacity = interpolate(frame, [40, 55], [0, 1], { extrapolateRight: 'clamp' })

  // Bottom label
  const labelFrame = Math.max(0, frame - 60)
  const sLabel = spring({ frame: labelFrame, fps, config: { damping: 30, stiffness: 280, mass: 0.75 } })
  const labelOpacity = interpolate(sLabel, [0, 1], [0, 1], { extrapolateRight: 'clamp' })
  const labelY = interpolate(sLabel, [0, 1], [20, 0], { extrapolateRight: 'clamp' })

  // Panel window height is fixed at 240px. Widths derived from aspect ratios.
  // Total window width: 135 + 240 + 427 = 802px + 2×24px gaps = 850px < 1000px safe zone.
  const formats = [
    { label: '9:16', w: 135, h: 240, platform: 'Reels / TikTok', color: BRAND.purple },
    { label: '1:1',  w: 240, h: 240, platform: 'Feed / Stories',  color: BRAND.orange },
    { label: '16:9', w: 427, h: 240, platform: 'YouTube / Ads',   color: '#00c8b4' },
  ]

  const panels = [p1, p2, p3]

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <SceneBackground from="#0b0c1c" to="#141528" angle={155} />

      {/* Header */}
      <div style={{
        position: 'absolute',
        top: 200,
        left: 0, right: 0,
        textAlign: 'center',
        fontSize: 70,
        fontFamily: BRAND.font,
        fontWeight: '800',
        color: BRAND.white,
        letterSpacing: '-2px',
      }}>
        ONE CLIP.{' '}
        <span style={{ color: BRAND.purple }}>EVERY FORMAT.</span>
      </div>

      {/* Three format panels — constrained to safe horizontal zone */}
      <div style={{
        position: 'absolute',
        top: 380,
        left: SAFE.left, right: SAFE.right,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 24,
      }}>
        {formats.map((fmt, i) => (
          <div key={i} style={{
            opacity: panels[i].opacity,
            transform: `translateY(${panels[i].y}px) scale(${panels[i].scale})`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}>
            {/* Format window */}
            <div style={{
              width: fmt.w,
              height: fmt.h,
              borderRadius: 14,
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: `2px solid ${fmt.color}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              overflow: 'hidden',
              position: 'relative',
            }}>
              {/* Simulated talking-head silhouette */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '55%',
                height: '75%',
                borderRadius: '50% 50% 0 0',
                backgroundColor: 'rgba(255,255,255,0.08)',
              }} />
              {/* Head */}
              <div style={{
                position: 'absolute',
                bottom: '55%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '32%',
                height: fmt.w < 200 ? '28%' : '22%',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.14)',
              }} />
              {/* Caption bar */}
              <div style={{
                position: 'relative',
                width: '85%',
                height: 28,
                backgroundColor: fmt.color,
                borderRadius: 6,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{
                  height: 6, width: '65%',
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  borderRadius: 3,
                }} />
              </div>
            </div>

            {/* Format ratio label */}
            <div style={{
              fontSize: 36,
              fontFamily: BRAND.font,
              fontWeight: '800',
              color: fmt.color,
              letterSpacing: '-0.5px',
            }}>{fmt.label}</div>

            {/* Platform */}
            <div style={{
              fontSize: 24,
              fontFamily: BRAND.font,
              fontWeight: '600',
              color: BRAND.dimText,
            }}>{fmt.platform}</div>

            {/* Face-centered badge */}
            <div style={{
              padding: '6px 16px',
              borderRadius: 100,
              backgroundColor: 'rgba(0,200,100,0.12)',
              border: '1px solid rgba(0,200,100,0.35)',
              fontSize: 20,
              fontFamily: BRAND.font,
              fontWeight: '700',
              color: '#00c864',
              letterSpacing: '0.5px',
            }}>face centered ✓</div>
          </div>
        ))}
      </div>

      {/* "Auto-reframe" bottom annotation — kept above SAFE.bottom to clear ModuleTag */}
      <div style={{
        position: 'absolute',
        bottom: SAFE.bottom,
        left: 0, right: 0,
        textAlign: 'center',
        opacity: labelOpacity,
        transform: `translateY(${labelY}px)`,
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 14,
          padding: '14px 36px',
          borderRadius: 100,
          border: `1.5px solid rgba(144,3,241,0.4)`,
          backgroundColor: 'rgba(144,3,241,0.08)',
        }}>
          <span style={{
            fontSize: 32,
            fontFamily: BRAND.font,
            fontWeight: '700',
            color: BRAND.purple,
            letterSpacing: '0.5px',
          }}>AUTO-REFRAME + FACE DETECTION</span>
        </div>
      </div>

      <FrameLabel text="Format transformer" />
      <ModuleTag modules={['format_transformer', 'layout_engine']} />
    </AbsoluteFill>
  )
}
