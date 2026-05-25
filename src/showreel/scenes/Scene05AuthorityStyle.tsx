import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { FrameLabel } from '../components/FrameLabel'
import { SceneBackground } from '../components/SceneBackground'
import { ModuleTag } from '../components/ModuleTag'
import { BRAND } from '../data/showreel.config'

/**
 * Scene 05: Authority Style
 * Clean typography, calm movement, expert-led trust feel.
 * Voiceover: "Or keep it clean for expert-led trust."
 */
export const Scene05AuthorityStyle: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const fadeIn = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' })

  const softSpring = (f: number) =>
    spring({ frame: f, fps, config: { damping: 36, stiffness: 220, mass: 1.0 } })

  // Title enters first
  const titleFrame = Math.max(0, frame - 8)
  const sTitle = softSpring(titleFrame)
  const titleY = interpolate(sTitle, [0, 1], [20, 0], { extrapolateRight: 'clamp' })
  const titleOpacity = interpolate(sTitle, [0, 1], [0, 1], { extrapolateRight: 'clamp' })

  // Credential line 1
  const cred1Frame = Math.max(0, frame - 28)
  const sCred1 = softSpring(cred1Frame)
  const cred1Y = interpolate(sCred1, [0, 1], [14, 0], { extrapolateRight: 'clamp' })
  const cred1Opacity = interpolate(sCred1, [0, 1], [0, 1], { extrapolateRight: 'clamp' })

  // Credential line 2
  const cred2Frame = Math.max(0, frame - 42)
  const sCred2 = softSpring(cred2Frame)
  const cred2Y = interpolate(sCred2, [0, 1], [14, 0], { extrapolateRight: 'clamp' })
  const cred2Opacity = interpolate(sCred2, [0, 1], [0, 1], { extrapolateRight: 'clamp' })

  // Stats card
  const statsFrame = Math.max(0, frame - 56)
  const sStats = softSpring(statsFrame)
  const statsScale = interpolate(sStats, [0, 1], [0.94, 1], { extrapolateRight: 'clamp' })
  const statsOpacity = interpolate(sStats, [0, 1], [0, 1], { extrapolateRight: 'clamp' })

  // Divider line width
  const dividerWidth = interpolate(frame, [18, 40], [0, 920], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <SceneBackground from="#0e0f1a" to="#171830" angle={140} />

      {/* Central authority card */}
      <div style={{
        position: 'absolute',
        top: 320,
        left: 60,
        right: 60,
        padding: '60px 56px',
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        {/* Expert title */}
        <div style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontSize: 88,
          fontFamily: BRAND.font,
          fontWeight: '800',
          color: BRAND.white,
          letterSpacing: '-2px',
          lineHeight: 1.0,
          marginBottom: 16,
        }}>
          RESULTS
          <span style={{ color: BRAND.purple }}> BACKED</span>
          <br />BY SCIENCE
        </div>

        {/* Divider */}
        <div style={{
          width: dividerWidth,
          height: 2,
          backgroundColor: `rgba(144,3,241,0.5)`,
          marginBottom: 32,
          marginTop: 8,
        }} />

        {/* Credential 1 */}
        <div style={{
          opacity: cred1Opacity,
          transform: `translateY(${cred1Y}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 20,
        }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: BRAND.purple,
            flexShrink: 0,
          }} />
          <span style={{
            fontSize: 40,
            fontFamily: BRAND.font,
            fontWeight: '700',
            color: BRAND.offWhite,
            letterSpacing: '-0.5px',
          }}>Board Certified Medical Doctor</span>
        </div>

        {/* Credential 2 */}
        <div style={{
          opacity: cred2Opacity,
          transform: `translateY(${cred2Y}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: BRAND.orange,
            flexShrink: 0,
          }} />
          <span style={{
            fontSize: 40,
            fontFamily: BRAND.font,
            fontWeight: '700',
            color: BRAND.offWhite,
            letterSpacing: '-0.5px',
          }}>18 Years Clinical Experience</span>
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        position: 'absolute',
        bottom: 200,
        left: 60,
        right: 60,
        opacity: statsOpacity,
        transform: `scale(${statsScale})`,
        display: 'flex',
        gap: 20,
      }}>
        {[
          { num: '10K+', label: 'patients helped' },
          { num: '94%', label: 'satisfaction rate' },
          { num: '#1', label: 'rated program' },
        ].map((stat, i) => (
          <div key={i} style={{
            flex: 1,
            padding: '28px 20px',
            borderRadius: 16,
            backgroundColor: 'rgba(144,3,241,0.12)',
            border: `1px solid rgba(144,3,241,0.3)`,
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: 66,
              fontFamily: BRAND.font,
              fontWeight: '800',
              color: BRAND.white,
              letterSpacing: '-2px',
              lineHeight: 1,
            }}>{stat.num}</div>
            <div style={{
              fontSize: 26,
              fontFamily: BRAND.font,
              fontWeight: '600',
              color: BRAND.dimText,
              marginTop: 6,
            }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Motion profile badge */}
      <div style={{
        position: 'absolute',
        top: 120,
        right: 40,
        padding: '8px 20px',
        borderRadius: 100,
        border: `2px solid rgba(144,3,241,0.5)`,
        color: BRAND.purple,
        fontSize: 22,
        fontFamily: BRAND.font,
        fontWeight: '700',
        letterSpacing: '1px',
      }}>CLEAN AUTHORITY</div>

      <FrameLabel text="Authority style" />
      <ModuleTag modules={['motion_engine', 'brand_engine']} />
    </AbsoluteFill>
  )
}
