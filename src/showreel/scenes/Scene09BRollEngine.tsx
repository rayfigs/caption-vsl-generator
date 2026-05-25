import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { FrameLabel } from '../components/FrameLabel'
import { SceneBackground } from '../components/SceneBackground'
import { AnimatedCaption } from '../components/AnimatedCaption'
import { ModuleTag } from '../components/ModuleTag'
import { BRAND, SAFE } from '../data/showreel.config'

/**
 * Scene 09: B-roll Engine
 * Shows cutaway moments supporting claims, then returning to speaker.
 * Voiceover: "Drop in visuals where they actually help."
 */
export const Scene09BRollEngine: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const fadeIn = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' })

  // Timeline bar progress
  const timelineProgress = interpolate(frame, [10, 100], [0, 1], { extrapolateRight: 'clamp' })

  // B-roll insert panel springs in at frame 28
  const brollFrame = Math.max(0, frame - 28)
  const sBroll = spring({ frame: brollFrame, fps, config: { damping: 26, stiffness: 350, mass: 0.6 } })
  const brollOpacity = interpolate(sBroll, [0, 1], [0, 1], { extrapolateRight: 'clamp' })
  const brollScale = interpolate(sBroll, [0, 1], [0.88, 1], { extrapolateRight: 'clamp' })

  // "CUTAWAY" label flashes
  const cutawayOpacity = interpolate(
    (frame % 24),
    [0, 4, 8, 12],
    [1, 1, 0.4, 1],
    { extrapolateRight: 'clamp' }
  )

  // Return-to-speaker indicator
  const returnFrame = Math.max(0, frame - 72)
  const sReturn = spring({ frame: returnFrame, fps, config: { damping: 28, stiffness: 300, mass: 0.7 } })
  const returnOpacity = interpolate(sReturn, [0, 1], [0, 1], { extrapolateRight: 'clamp' })
  const returnX = interpolate(sReturn, [0, 1], [-30, 0], { extrapolateRight: 'clamp' })

  // Timeline segments: SPEAKER | BROLL | SPEAKER
  const segments = [
    { label: 'SPEAKER', w: 35, color: BRAND.purple },
    { label: 'B-ROLL', w: 28, color: BRAND.orange },
    { label: 'SPEAKER', w: 37, color: BRAND.purple },
  ]

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <SceneBackground from="#0c0c1e" to="#141425" angle={152} />

      {/* Top: Speaker "view" placeholder */}
      <div style={{
        position: 'absolute',
        top: 120,
        left: 60,
        right: 60,
        height: 420,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* Speaker silhouette */}
        <div style={{
          width: 120, height: 200,
          borderRadius: '50% 50% 0 0',
          backgroundColor: 'rgba(255,255,255,0.07)',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: -60, left: '50%',
            transform: 'translateX(-50%)',
            width: 70, height: 70,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.1)',
          }} />
        </div>
        <div style={{
          position: 'absolute',
          top: 16, left: 20,
          fontSize: 22, fontFamily: BRAND.font, fontWeight: '700',
          color: BRAND.dimText, letterSpacing: '1px',
        }}>PRIMARY SPEAKER</div>
      </div>

      {/* Caption under speaker */}
      <div style={{
        position: 'absolute',
        top: 550,
        left: 0, right: 0,
        display: 'flex',
        justifyContent: 'center',
      }}>
        <AnimatedCaption
          words={['Drop', 'in', 'visuals']}
          highlightWords={['visuals']}
          highlightColor={BRAND.purple}
          fontSize={72}
          staggerFrames={3}
          startFrame={8}
        />
      </div>

      {/* B-roll insert */}
      <div style={{
        position: 'absolute',
        top: 700,
        right: 60,
        width: 380,
        height: 240,
        opacity: brollOpacity,
        transform: `scale(${brollScale})`,
        borderRadius: 16,
        backgroundColor: 'rgba(255,93,0,0.12)',
        border: `2px solid ${BRAND.orange}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        overflow: 'hidden',
      }}>
        {/* B-roll visual content placeholder */}
        <div style={{
          width: '80%', height: 80,
          borderRadius: 10,
          backgroundColor: 'rgba(255,93,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: 36 }}>🏃</span>
        </div>
        <div style={{
          fontSize: 26, fontFamily: BRAND.font, fontWeight: '700',
          color: BRAND.orange,
          opacity: cutawayOpacity,
          letterSpacing: '2px',
        }}>CUTAWAY</div>
      </div>

      {/* Return to speaker */}
      <div style={{
        position: 'absolute',
        top: 980,
        left: 60,
        opacity: returnOpacity,
        transform: `translateX(${returnX}px)`,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}>
        <div style={{
          width: 10, height: 10,
          borderRadius: '50%',
          backgroundColor: BRAND.purple,
          boxShadow: `0 0 10px ${BRAND.purple}`,
        }} />
        <span style={{
          fontSize: 28, fontFamily: BRAND.font, fontWeight: '700',
          color: BRAND.purple, letterSpacing: '1px',
        }}>RETURNS TO SPEAKER CLEANLY</span>
      </div>

      {/* Timeline — sits above SAFE.bottom to clear ModuleTag pills */}
      <div style={{
        position: 'absolute',
        bottom: SAFE.bottom,
        left: SAFE.left, right: SAFE.right,
      }}>
        <div style={{
          fontSize: 24, fontFamily: BRAND.font, fontWeight: '700',
          color: BRAND.dimText, marginBottom: 14, letterSpacing: '1px',
        }}>EDIT TIMELINE</div>
        <div style={{
          display: 'flex',
          height: 40,
          borderRadius: 10,
          overflow: 'hidden',
          gap: 3,
        }}>
          {segments.map((seg, i) => {
            const segProgress = interpolate(
              timelineProgress,
              [i / segments.length, (i + 0.9) / segments.length],
              [0, 1],
              { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
            )
            return (
              <div key={i} style={{
                flex: seg.w,
                backgroundColor: `${seg.color}${Math.round(segProgress * 255).toString(16).padStart(2, '0')}`,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'none',
              }}>
                <span style={{
                  fontSize: 18, fontFamily: BRAND.font, fontWeight: '700',
                  color: BRAND.white, letterSpacing: '1px',
                  opacity: segProgress,
                }}>{seg.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      <FrameLabel text="B-roll support" />
      <ModuleTag modules={['broll_engine', 'segment_selector']} />
    </AbsoluteFill>
  )
}
