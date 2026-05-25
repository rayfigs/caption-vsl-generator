import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { BRAND } from '../data/showreel.config'

interface ModuleTagProps {
  modules: string[]
  /** Frame to start animating in */
  startFrame?: number
}

/**
 * Small pill tags showing which system modules are active in this scene.
 * Appears bottom-left with a staggered entry.
 */
export const ModuleTag: React.FC<ModuleTagProps> = ({ modules, startFrame = 10 }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  return (
    <div style={{
      position: 'absolute',
      bottom: 160,
      left: 44,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      {modules.map((mod, i) => {
        const s = spring({
          frame: Math.max(0, frame - startFrame - i * 6),
          fps,
          config: { damping: 28, stiffness: 320, mass: 0.6 },
        })
        const opacity = interpolate(s, [0, 1], [0, 1], { extrapolateRight: 'clamp' })
        const translateX = interpolate(s, [0, 1], [-24, 0], { extrapolateRight: 'clamp' })

        return (
          <div key={i} style={{ opacity, transform: `translateX(${translateX}px)` }}>
            <div style={{
              display: 'inline-block',
              padding: '7px 18px',
              borderRadius: 30,
              backgroundColor: 'rgba(144,3,241,0.18)',
              border: `1px solid ${BRAND.purple}66`,
              color: BRAND.purple,
              fontSize: 22,
              fontFamily: BRAND.font,
              fontWeight: '700',
              letterSpacing: '0.3px',
            }}>
              {mod}
            </div>
          </div>
        )
      })}
    </div>
  )
}
