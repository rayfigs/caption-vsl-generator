import { AbsoluteFill } from 'remotion'
import { BRAND } from '../data/showreel.config'

interface SceneBackgroundProps {
  /** Optional gradient angle. Defaults to a subtle dark gradient */
  from?: string
  to?: string
  angle?: number
  /** Overlay opacity for depth */
  overlayOpacity?: number
}

/**
 * Standard dark background for motion-graphic showreel scenes.
 * Uses TFD brand deep navy so all scenes feel cohesive.
 */
export const SceneBackground: React.FC<SceneBackgroundProps> = ({
  from = BRAND.bgDeep,
  to = BRAND.bg,
  angle = 145,
  overlayOpacity = 0,
}) => {
  return (
    <>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${angle}deg, ${from}, ${to})`,
        }}
      />
      {/* Subtle noise/depth overlay */}
      {overlayOpacity > 0 && (
        <AbsoluteFill
          style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
        />
      )}
      {/* Brand accent line at top */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 5,
        backgroundImage: `linear-gradient(90deg, ${BRAND.purple}, ${BRAND.orange})`,
      }} />
    </>
  )
}
