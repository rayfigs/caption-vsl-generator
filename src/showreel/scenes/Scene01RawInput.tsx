import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { FrameLabel } from '../components/FrameLabel'
import { BRAND } from '../data/showreel.config'

/**
 * Scene 01 — Raw testimonial input (3s)
 * Shows the unedited baseline: messy, unframed, no captions.
 * Deliberately rough to contrast with the cleaned versions.
 */
export const Scene01RawInput: React.FC = () => {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ backgroundColor: '#080810', opacity }}>
      {/* Simulated raw video frame — dark, slightly off-center */}
      <div style={{
        position: 'absolute',
        top: 80,
        left: 60,
        right: 60,
        bottom: 120,
        borderRadius: 18,
        backgroundImage: `linear-gradient(160deg, #1a1a2e 0%, #0d0d18 60%, #16213e 100%)`,
        overflow: 'hidden',
        border: '2px solid rgba(255,255,255,0.06)',
      }}>
        {/* Simulated talking head silhouette */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-46%)',
          width: 520,
          height: 820,
          borderRadius: '50% 50% 0 0',
          background: 'radial-gradient(ellipse at 50% 30%, #2a2a3e 0%, #111122 70%)',
          opacity: 0.85,
        }} />

        {/* "No captions" indicator */}
        <div style={{
          position: 'absolute',
          bottom: 60,
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.2)',
          fontSize: 28,
          fontFamily: BRAND.font,
          fontWeight: '600',
          letterSpacing: '2px',
          textTransform: 'uppercase',
        }}>no captions · no reframing · raw</div>

        {/* REC indicator */}
        <div style={{
          position: 'absolute',
          top: 28,
          right: 32,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <div style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            backgroundColor: '#ff3333',
            opacity: frame % 30 < 15 ? 1 : 0.3,
          }} />
          <span style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: 24,
            fontFamily: BRAND.font,
            fontWeight: '700',
          }}>REC</span>
        </div>

        {/* Timestamp */}
        <div style={{
          position: 'absolute',
          bottom: 28,
          right: 32,
          color: 'rgba(255,255,255,0.3)',
          fontSize: 22,
          fontFamily: 'monospace',
        }}>00:00:{String(Math.floor(frame / 30)).padStart(2, '0')}</div>
      </div>

      <FrameLabel text="Raw testimonial input" accentColor="rgba(255,255,255,0.4)" />
    </AbsoluteFill>
  )
}
