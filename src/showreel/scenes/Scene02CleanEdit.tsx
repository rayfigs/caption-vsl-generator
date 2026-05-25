import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { FrameLabel } from '../components/FrameLabel'
import { SceneBackground } from '../components/SceneBackground'
import { AnimatedCaption } from '../components/AnimatedCaption'
import { ModuleTag } from '../components/ModuleTag'
import { BRAND } from '../data/showreel.config'

export const Scene02CleanEdit: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const fadeIn = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' })

  // "Cut lines" that animate across to show segment extraction
  const cutProgress = interpolate(frame, [20, 55], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <SceneBackground from="#0d0f1c" to="#151830" />

      {/* Video strip with cut marks */}
      <div style={{
        position: 'absolute',
        top: 320,
        left: 60,
        right: 60,
        height: 520,
        borderRadius: 20,
        background: 'linear-gradient(160deg, #1e2040 0%, #12142e 100%)',
        border: `1px solid rgba(144,3,241,0.2)`,
        overflow: 'hidden',
      }}>
        {/* Cut line animation */}
        <div style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${cutProgress * 68}%`,
          width: 3,
          backgroundColor: BRAND.orange,
          boxShadow: `0 0 20px ${BRAND.orange}`,
          borderRadius: 2,
        }} />

        {/* Segment labels */}
        {[
          { label: 'KEEP', left: '4%', color: BRAND.purple },
          { label: 'TRIM', left: '36%', color: BRAND.orange, dim: true },
          { label: 'KEEP', left: '58%', color: BRAND.purple },
        ].map(({ label, left, color, dim }) => (
          <div key={label + left} style={{
            position: 'absolute',
            top: '50%',
            left,
            transform: 'translateY(-50%)',
            padding: '8px 18px',
            borderRadius: 8,
            backgroundColor: dim ? 'rgba(255,93,0,0.12)' : 'rgba(144,3,241,0.12)',
            border: `1px solid ${color}44`,
            color: dim ? 'rgba(255,255,255,0.3)' : color,
            fontSize: 26,
            fontFamily: BRAND.font,
            fontWeight: '800',
            letterSpacing: '1px',
          }}>{label}</div>
        ))}

        {/* Waveform bars */}
        <div style={{
          position: 'absolute',
          bottom: 24,
          left: 24,
          right: 24,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
        }}>
          {Array.from({ length: 80 }).map((_, i) => {
            const h = 10 + Math.sin(i * 0.4) * 18 + Math.sin(i * 1.1) * 12
            const isTrim = i > 26 && i < 44
            return (
              <div key={i} style={{
                flex: 1,
                height: h,
                borderRadius: 2,
                backgroundColor: isTrim ? 'rgba(255,93,0,0.3)' : 'rgba(144,3,241,0.5)',
              }} />
            )
          })}
        </div>
      </div>

      {/* Result caption */}
      <div style={{
        position: 'absolute',
        top: 880,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
      }}>
        <AnimatedCaption
          words={['Sharper', 'cleaner', 'moments']}
          highlightWords={['sharper']}
          highlightColor={BRAND.purple}
          fontSize={82}
          startFrame={40}
        />
      </div>

      <FrameLabel text="Segment extraction + clean edit" />
      <ModuleTag modules={['segment_selector', 'transcript_engine']} />
    </AbsoluteFill>
  )
}
