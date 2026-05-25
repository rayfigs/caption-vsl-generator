import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { SceneBackground } from '../components/SceneBackground'
import { BRAND, SAFE } from '../data/showreel.config'

/**
 * Scene 11: Output Grid
 * Final scene — a wall of output variants.
 * One source clip → many usable ads.
 * Voiceover: "One source clip. Many usable ads."
 */

const OUTPUT_TILES = [
  { label: 'Testimonial', format: '9:16', style: 'Warm', color: BRAND.purple, icon: '🎤' },
  { label: 'Direct CTA', format: '9:16', style: 'Punch', color: '#ff3c00', icon: '📣' },
  { label: 'Authority', format: '16:9', style: 'Clean', color: '#00b4d8', icon: '🏥' },
  { label: 'Cited Claim', format: '9:16', style: 'Authority', color: '#00c896', icon: '📊' },
  { label: 'Disclaimer', format: '1:1', style: 'Compliant', color: BRAND.orange, icon: '⚖️' },
  { label: 'B-Roll Cut', format: '9:16', style: 'Dynamic', color: '#c084fc', icon: '🎬' },
  { label: 'Brand A', format: '9:16', style: 'Purple', color: BRAND.purple, icon: '💜' },
  { label: 'Brand B', format: '1:1', style: 'Teal', color: '#00c896', icon: '🩵' },
]

export const Scene11OutputGrid: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const fadeIn = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' })

  // Stagger each tile
  const tileSpring = (i: number) => {
    const startFrame = 10 + i * 8
    const f = Math.max(0, frame - startFrame)
    const s = spring({ frame: f, fps, config: { damping: 24, stiffness: 350, mass: 0.55 } })
    return {
      opacity: interpolate(s, [0, 1], [0, 1], { extrapolateRight: 'clamp' }),
      scale: interpolate(s, [0, 1], [0.7, 1], { extrapolateRight: 'clamp' }),
    }
  }

  // Final tagline
  const taglineFrame = Math.max(0, frame - 130)
  const sTagline = spring({ frame: taglineFrame, fps, config: { damping: 28, stiffness: 260, mass: 0.9 } })
  const taglineOpacity = interpolate(sTagline, [0, 1], [0, 1], { extrapolateRight: 'clamp' })
  const taglineY = interpolate(sTagline, [0, 1], [30, 0], { extrapolateRight: 'clamp' })

  // "Source: 1 clip" counter
  const counterFrame = Math.max(0, frame - 90)
  const sCounter = spring({ frame: counterFrame, fps, config: { damping: 30, stiffness: 300, mass: 0.7 } })
  const counterOpacity = interpolate(sCounter, [0, 1], [0, 1], { extrapolateRight: 'clamp' })

  // Pulse for live grid
  const glow = 0.6 + Math.sin(frame * 0.1) * 0.4

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <SceneBackground from="#080910" to="#0f1020" angle={145} />

      {/* Header */}
      <div style={{
        position: 'absolute',
        top: 60,
        left: 0, right: 0,
        textAlign: 'center',
        fontSize: 52,
        fontFamily: BRAND.font,
        fontWeight: '800',
        color: BRAND.white,
        letterSpacing: '-1px',
      }}>
        ONE INPUT
        <span style={{ color: BRAND.purple }}> → </span>
        MANY OUTPUTS
      </div>

      {/* Source counter */}
      <div style={{
        position: 'absolute',
        top: 138,
        left: 0, right: 0,
        textAlign: 'center',
        opacity: counterOpacity,
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 24px',
          borderRadius: 100,
          backgroundColor: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          fontSize: 26,
          fontFamily: BRAND.font,
          fontWeight: '700',
          color: BRAND.dimText,
          letterSpacing: '1px',
        }}>
          <span style={{
            width: 10, height: 10,
            borderRadius: '50%',
            display: 'inline-block',
            backgroundColor: '#00c864',
            boxShadow: `0 0 ${8 * glow}px #00c864`,
          }} />
          SOURCE: 1 RAW CLIP
        </div>
      </div>

      {/* Output tile grid — 4 columns, 2 rows */}
      <div style={{
        position: 'absolute',
        top: 210,
        left: 30,
        right: 30,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
      }}>
        {OUTPUT_TILES.map((tile, i) => {
          const t = tileSpring(i)
          return (
            <div key={i} style={{
              opacity: t.opacity,
              transform: `scale(${t.scale})`,
              borderRadius: 16,
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: `1.5px solid ${tile.color}50`,
              padding: '22px 18px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Glow accent */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: 3,
                backgroundColor: tile.color,
                opacity: 0.8,
              }} />

              {/* Icon */}
              <div style={{ fontSize: 36 }}>{tile.icon}</div>

              {/* Simulated video thumbnail */}
              <div style={{
                width: '100%',
                height: 90,
                borderRadius: 10,
                backgroundColor: `${tile.color}18`,
                border: `1px solid ${tile.color}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {/* Caption bar preview */}
                <div style={{
                  width: '70%', height: 16,
                  borderRadius: 4,
                  backgroundColor: tile.color,
                  opacity: 0.7,
                }} />
              </div>

              {/* Tile label */}
              <div style={{
                fontSize: 22,
                fontFamily: BRAND.font,
                fontWeight: '800',
                color: BRAND.white,
                letterSpacing: '-0.3px',
                textAlign: 'center',
              }}>{tile.label}</div>

              {/* Format + style badges */}
              <div style={{
                display: 'flex',
                gap: 6,
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: 100,
                  backgroundColor: `${tile.color}25`,
                  fontSize: 16,
                  fontFamily: BRAND.font,
                  fontWeight: '700',
                  color: tile.color,
                }}>{tile.format}</span>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: 100,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  fontSize: 16,
                  fontFamily: BRAND.font,
                  fontWeight: '600',
                  color: BRAND.dimText,
                }}>{tile.style}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Final tagline — no ModuleTag in this scene so SAFE.left/right margin is enough */}
      <div style={{
        position: 'absolute',
        bottom: SAFE.top,  // 160px — well inside the canvas edge
        left: 0, right: 0,
        textAlign: 'center',
        opacity: taglineOpacity,
        transform: `translateY(${taglineY}px)`,
      }}>
        <div style={{
          fontSize: 52,
          fontFamily: BRAND.font,
          fontWeight: '800',
          color: BRAND.white,
          letterSpacing: '-1.5px',
          lineHeight: 1.1,
        }}>
          One clip in.{' '}
          <span style={{
            color: BRAND.purple,
            textShadow: `0 0 30px ${BRAND.purple}80`,
          }}>Many usable ads out.</span>
        </div>
      </div>
    </AbsoluteFill>
  )
}
