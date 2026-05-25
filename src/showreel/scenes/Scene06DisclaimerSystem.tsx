import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { FrameLabel } from '../components/FrameLabel'
import { SceneBackground } from '../components/SceneBackground'
import { FooterDisclaimer } from '../components/FooterDisclaimer'
import { AnimatedCaption } from '../components/AnimatedCaption'
import { ModuleTag } from '../components/ModuleTag'
import { BRAND } from '../data/showreel.config'

/**
 * Scene 06: Disclaimer System
 * Shows the safe footer region with a disclaimer that doesn't wreck the layout.
 * Voiceover: "Handle disclaimers without wrecking the layout."
 */
export const Scene06DisclaimerSystem: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const fadeIn = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' })

  // Safe zone annotation lines slide in
  const annotationFrame = Math.max(0, frame - 18)
  const sAnnotation = spring({ frame: annotationFrame, fps, config: { damping: 30, stiffness: 300, mass: 0.7 } })
  const annotationOpacity = interpolate(sAnnotation, [0, 1], [0, 1], { extrapolateRight: 'clamp' })
  const annotationX = interpolate(sAnnotation, [0, 1], [-30, 0], { extrapolateRight: 'clamp' })

  // Disclaimer slides up from bottom
  const disclaimerFrame = Math.max(0, frame - 32)
  const sDisclaimer = spring({ frame: disclaimerFrame, fps, config: { damping: 28, stiffness: 280, mass: 0.8 } })
  const disclaimerY = interpolate(sDisclaimer, [0, 1], [60, 0], { extrapolateRight: 'clamp' })
  const disclaimerOpacity = interpolate(sDisclaimer, [0, 1], [0, 1], { extrapolateRight: 'clamp' })

  // "No collision" check mark
  const checkFrame = Math.max(0, frame - 54)
  const sCheck = spring({ frame: checkFrame, fps, config: { damping: 24, stiffness: 400, mass: 0.5 } })
  const checkScale = interpolate(sCheck, [0, 1], [0, 1], { extrapolateRight: 'clamp' })
  const checkOpacity = interpolate(sCheck, [0, 1], [0, 1], { extrapolateRight: 'clamp' })

  // Safe zone bottom line Y — sits just above the disclaimer
  const safeLineY = 1700

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <SceneBackground from="#0d0e1a" to="#181929" angle={150} />

      {/* Caption content in safe zone */}
      <div style={{
        position: 'absolute',
        top: 680,
        left: 0, right: 0,
        display: 'flex',
        justifyContent: 'center',
      }}>
        <AnimatedCaption
          words={['Results', 'may', 'vary']}
          highlightWords={['Results']}
          highlightColor={BRAND.purple}
          fontSize={100}
          staggerFrames={4}
          startFrame={8}
        />
      </div>

      {/* Safe zone upper bracket */}
      <div style={{
        position: 'absolute',
        top: 610,
        left: 40,
        right: 40,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.12)',
      }} />

      {/* Safe zone lower boundary line */}
      <div style={{
        position: 'absolute',
        top: safeLineY,
        left: 0,
        right: 0,
        height: 2,
        backgroundImage: `repeating-linear-gradient(90deg, rgba(255,165,0,0.7) 0 18px, transparent 18px 30px)`,
      }} />

      {/* Safe zone label */}
      <div style={{
        position: 'absolute',
        top: safeLineY - 46,
        left: 50,
        opacity: annotationOpacity,
        transform: `translateX(${annotationX}px)`,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{
          width: 10, height: 10,
          borderRadius: '50%',
          backgroundColor: BRAND.orange,
        }} />
        <span style={{
          fontSize: 24,
          fontFamily: BRAND.font,
          fontWeight: '700',
          color: BRAND.orange,
          letterSpacing: '1px',
        }}>DISCLAIMER SAFE ZONE</span>
      </div>

      {/* Disclaimer footer with animation wrapper */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        opacity: disclaimerOpacity,
        transform: `translateY(${disclaimerY}px)`,
      }}>
        <FooterDisclaimer text="Individual results may vary. This is not medical advice. Consult your healthcare provider before starting any program." />
      </div>

      {/* No-collision check badge */}
      <div style={{
        position: 'absolute',
        top: safeLineY + 20,
        right: 50,
        opacity: checkOpacity,
        transform: `scale(${checkScale})`,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 20px',
        borderRadius: 100,
        backgroundColor: 'rgba(0, 200, 100, 0.15)',
        border: '1.5px solid rgba(0, 200, 100, 0.5)',
      }}>
        <span style={{ fontSize: 26, color: '#00c864' }}>✓</span>
        <span style={{
          fontSize: 22,
          fontFamily: BRAND.font,
          fontWeight: '700',
          color: '#00c864',
          letterSpacing: '0.5px',
        }}>NO COLLISION</span>
      </div>

      <FrameLabel text="Compliance engine" />
      <ModuleTag modules={['compliance_engine', 'layout_engine']} />
    </AbsoluteFill>
  )
}
