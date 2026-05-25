import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { FrameLabel } from '../components/FrameLabel'
import { SceneBackground } from '../components/SceneBackground'
import { CitationFootnote } from '../components/CitationFootnote'
import { AnimatedCaption } from '../components/AnimatedCaption'
import { ModuleTag } from '../components/ModuleTag'
import { BRAND } from '../data/showreel.config'

/**
 * Scene 07: Citation System
 * Citation appears only when the claim appears — deliberate, proof-backed.
 * Voiceover: "Support claims with proof when needed."
 */
export const Scene07CitationSystem: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const fadeIn = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' })

  // Claim text enters
  const claimFrame = Math.max(0, frame - 10)
  const sClaim = spring({ frame: claimFrame, fps, config: { damping: 30, stiffness: 300, mass: 0.7 } })
  const claimOpacity = interpolate(sClaim, [0, 1], [0, 1], { extrapolateRight: 'clamp' })
  const claimY = interpolate(sClaim, [0, 1], [16, 0], { extrapolateRight: 'clamp' })

  // Citation card enters after claim
  const citationFrame = Math.max(0, frame - 38)
  const sCitation = spring({ frame: citationFrame, fps, config: { damping: 26, stiffness: 320, mass: 0.65 } })
  const citationOpacity = interpolate(sCitation, [0, 1], [0, 1], { extrapolateRight: 'clamp' })
  const citationX = interpolate(sCitation, [0, 1], [40, 0], { extrapolateRight: 'clamp' })

  // Connector line from superscript to card
  const lineFrame = Math.max(0, frame - 42)
  const sLine = spring({ frame: lineFrame, fps, config: { damping: 32, stiffness: 280, mass: 0.8 } })
  const lineOpacity = interpolate(sLine, [0, 1], [0, 1], { extrapolateRight: 'clamp' })

  // Superscript pulse
  const pulse = 0.85 + Math.sin(frame * 0.18) * 0.15

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <SceneBackground from="#0c0d1c" to="#13142a" angle={148} />

      {/* Main claim */}
      <div style={{
        position: 'absolute',
        top: 580,
        left: 60,
        right: 60,
        opacity: claimOpacity,
        transform: `translateY(${claimY}px)`,
      }}>
        <div style={{
          fontSize: 88,
          fontFamily: BRAND.font,
          fontWeight: '800',
          color: BRAND.white,
          letterSpacing: '-2px',
          lineHeight: 1.1,
          textAlign: 'center',
        }}>
          Patients lost an average of
        </div>

        <div style={{
          fontSize: 160,
          fontFamily: BRAND.font,
          fontWeight: '800',
          color: BRAND.purple,
          letterSpacing: '-5px',
          lineHeight: 1.0,
          textAlign: 'center',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}>
          28 lbs
          {/* Superscript marker */}
          <span style={{
            fontSize: 48,
            color: BRAND.orange,
            fontFamily: BRAND.font,
            fontWeight: '800',
            marginTop: 16,
            marginLeft: 4,
            opacity: pulse,
          }}>¹</span>
        </div>

        <div style={{
          fontSize: 72,
          fontFamily: BRAND.font,
          fontWeight: '700',
          color: BRAND.offWhite,
          letterSpacing: '-1.5px',
          lineHeight: 1.1,
          textAlign: 'center',
        }}>
          in 12 weeks
        </div>
      </div>

      {/* Connector dot trail */}
      <div style={{
        position: 'absolute',
        top: 1100,
        right: 100,
        opacity: lineOpacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 8,
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6,
            borderRadius: '50%',
            backgroundColor: `rgba(144,3,241,${0.6 - i * 0.15})`,
          }} />
        ))}
      </div>

      {/* Citation card */}
      <div style={{
        position: 'absolute',
        bottom: 160,
        right: 40,
        left: 40,
        opacity: citationOpacity,
        transform: `translateX(${citationX}px)`,
      }}>
        <CitationFootnote
          marker="¹"
          text="Randomized controlled trial, Journal of Metabolic Medicine, 2023. n=342. Results are averages and individual results may vary."
        />
      </div>

      {/* "Proof-backed" badge */}
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
      }}>CITATION TRIGGERED ON CLAIM</div>

      <FrameLabel text="Citation system" />
      <ModuleTag modules={['citation_engine', 'compliance_engine']} />
    </AbsoluteFill>
  )
}
