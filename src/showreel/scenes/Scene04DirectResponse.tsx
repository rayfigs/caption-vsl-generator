import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { FrameLabel } from '../components/FrameLabel'
import { SceneBackground } from '../components/SceneBackground'
import { ModuleTag } from '../components/ModuleTag'
import { BRAND } from '../data/showreel.config'

/**
 * Scene 04: Direct Response Style
 * Faster text pop-ins, bold scaling, punchier emphasis.
 * Voiceover: "Push it harder for scroll-stopping ads."
 */
export const Scene04DirectResponse: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const fadeIn = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: 'clamp' })

  // Words pop in with aggressive spring — fast in, slight overshoot
  const punchSpring = (f: number) =>
    spring({ frame: f, fps, config: { damping: 18, stiffness: 600, mass: 0.4 } })

  // 3 "words" entering fast with big scale
  const word1Frame = Math.max(0, frame - 5)
  const word2Frame = Math.max(0, frame - 16)
  const word3Frame = Math.max(0, frame - 27)

  const s1 = punchSpring(word1Frame)
  const s2 = punchSpring(word2Frame)
  const s3 = punchSpring(word3Frame)

  const wordScale = (s: number) => interpolate(s, [0, 0.6, 1], [0.4, 1.18, 1], { extrapolateRight: 'clamp' })
  const wordOpacity = (s: number) => interpolate(s, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' })

  // Attention bar — pulses horizontally
  const barWidth = interpolate(frame, [38, 58], [0, 100], { extrapolateRight: 'clamp' })

  // Bottom CTA arrow — bounces in at frame 55
  const ctaFrame = Math.max(0, frame - 55)
  const ctaS = spring({ frame: ctaFrame, fps, config: { damping: 14, stiffness: 480, mass: 0.5 } })
  const ctaY = interpolate(ctaS, [0, 1], [40, 0], { extrapolateRight: 'clamp' })
  const ctaOpacity = interpolate(ctaS, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' })

  // Flash effect at frame 0-3
  const flashOpacity = interpolate(frame, [0, 3], [0.25, 0], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <SceneBackground from="#0a0010" to="#160022" angle={165} />

      {/* Hard-cut flash overlay */}
      <AbsoluteFill style={{ backgroundColor: `rgba(144,3,241,${flashOpacity})` }} />

      {/* Central word stack */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
      }}>
        {/* Word 1: STOP */}
        <div style={{
          opacity: wordOpacity(s1),
          transform: `scale(${wordScale(s1)})`,
          fontSize: 160,
          fontFamily: BRAND.font,
          fontWeight: '800',
          color: BRAND.white,
          letterSpacing: '-4px',
          lineHeight: 0.9,
        }}>STOP</div>

        {/* Word 2: SCROLLING — highlighted */}
        <div style={{
          opacity: wordOpacity(s2),
          transform: `scale(${wordScale(s2)})`,
          position: 'relative',
          display: 'inline-block',
        }}>
          <span style={{
            position: 'absolute',
            inset: '-10px -18px',
            backgroundColor: BRAND.purple,
            borderRadius: 12,
            zIndex: 0,
          }} />
          <span style={{
            position: 'relative',
            zIndex: 1,
            fontSize: 140,
            fontFamily: BRAND.font,
            fontWeight: '800',
            color: BRAND.white,
            letterSpacing: '-3px',
            lineHeight: 0.95,
          }}>SCROLLING</span>
        </div>

        {/* Word 3: NOW */}
        <div style={{
          opacity: wordOpacity(s3),
          transform: `scale(${wordScale(s3)})`,
          fontSize: 200,
          fontFamily: BRAND.font,
          fontWeight: '800',
          color: BRAND.orange,
          letterSpacing: '-6px',
          lineHeight: 0.85,
        }}>NOW</div>
      </div>

      {/* Attention bar */}
      <div style={{
        position: 'absolute',
        top: 440,
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${barWidth}%`,
        height: 4,
        backgroundColor: BRAND.orange,
        boxShadow: `0 0 16px ${BRAND.orange}`,
        transition: 'none',
      }} />

      {/* CTA tap hint */}
      <div style={{
        position: 'absolute',
        bottom: 160,
        left: 0, right: 0,
        display: 'flex',
        justifyContent: 'center',
        opacity: ctaOpacity,
        transform: `translateY(${ctaY}px)`,
      }}>
        <div style={{
          padding: '18px 48px',
          borderRadius: 100,
          backgroundColor: BRAND.purple,
          fontSize: 46,
          fontFamily: BRAND.font,
          fontWeight: '800',
          color: BRAND.white,
          letterSpacing: '1px',
        }}>TAP TO LEARN MORE ↗</div>
      </div>

      {/* Motion profile badge */}
      <div style={{
        position: 'absolute',
        top: 120,
        right: 40,
        padding: '8px 20px',
        borderRadius: 100,
        border: `2px solid ${BRAND.orange}`,
        color: BRAND.orange,
        fontSize: 22,
        fontFamily: BRAND.font,
        fontWeight: '700',
        letterSpacing: '1px',
      }}>DIRECT RESPONSE PUNCH</div>

      <FrameLabel text="Direct response style" />
      <ModuleTag modules={['motion_engine', 'caption_engine']} />
    </AbsoluteFill>
  )
}
