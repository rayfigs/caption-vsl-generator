import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { FrameLabel } from '../components/FrameLabel'
import { SceneBackground } from '../components/SceneBackground'
import { AnimatedCaption } from '../components/AnimatedCaption'
import { ModuleTag } from '../components/ModuleTag'
import { BRAND } from '../data/showreel.config'

export const Scene03CaptionEngine: React.FC = () => {
  const frame = useCurrentFrame()
  const fadeIn = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' })

  // Two caption lines appear sequentially
  const line1Start = 10
  const line2Start = 55

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <SceneBackground from="#0c0d1e" to="#14152a" angle={155} />

      {/* Caption zone box */}
      <div style={{
        position: 'absolute',
        top: 680,
        left: 40,
        right: 40,
        bottom: 160,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        border: `1.5px solid rgba(144,3,241,0.3)`,
      }}>
        {/* Caption zone label */}
        <div style={{
          position: 'absolute',
          top: -18,
          left: 24,
          padding: '2px 14px',
          borderRadius: 20,
          backgroundColor: BRAND.purple,
          color: '#fff',
          fontSize: 18,
          fontFamily: BRAND.font,
          fontWeight: '700',
          letterSpacing: '0.5px',
        }}>SAFE CAPTION ZONE</div>

        {/* Line 1 */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: 0, right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}>
          <AnimatedCaption
            words={['I finally', 'found', 'something']}
            highlightWords={['found']}
            highlightColor={BRAND.purple}
            fontSize={86}
            staggerFrames={3}
            startFrame={line1Start}
          />
        </div>

        {/* Line 2 */}
        <div style={{
          position: 'absolute',
          top: '55%',
          left: 0, right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}>
          <AnimatedCaption
            words={['that actually', 'worked']}
            highlightWords={['worked']}
            highlightColor={BRAND.orange}
            fontSize={86}
            staggerFrames={3}
            startFrame={line2Start}
          />
        </div>
      </div>

      {/* Sync indicator — pulsing dot */}
      <div style={{
        position: 'absolute',
        top: 620,
        right: 64,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 16, height: 16, borderRadius: '50%',
          backgroundColor: BRAND.purple,
          boxShadow: `0 0 ${12 + Math.sin(frame * 0.2) * 6}px ${BRAND.purple}`,
        }} />
        <span style={{
          color: BRAND.purple,
          fontSize: 22, fontFamily: BRAND.font, fontWeight: '700',
        }}>SYNCED TO SPEECH</span>
      </div>

      <FrameLabel text="Caption intelligence" />
      <ModuleTag modules={['caption_engine', 'motion_engine']} />
    </AbsoluteFill>
  )
}
