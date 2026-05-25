import { AbsoluteFill, Img, OffthreadVideo } from 'remotion'
import type { Template } from '../lib/types'

interface BackgroundProps {
  config: Template['background']
}

export const Background: React.FC<BackgroundProps> = ({ config }) => {
  const overlay =
    config.darken && config.darken > 0
      ? (
          <AbsoluteFill
            style={{
              backgroundColor: `rgba(0, 0, 0, ${Math.max(0, Math.min(config.darken, 1))})`,
            }}
          />
        )
      : null

  const mediaStyle = config.blur ? { filter: `blur(${config.blur}px)` } : undefined

  if (config.type === 'gradient' && config.gradient) {
    return (
      <>
        <AbsoluteFill
          style={{
            backgroundImage: `linear-gradient(${config.gradient.angle}deg, ${config.gradient.from}, ${config.gradient.to})`,
          }}
        />
        {overlay}
      </>
    )
  }

  if (config.type === 'image' && config.imageUrl) {
    return (
      <>
        <AbsoluteFill>
          <Img src={config.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', ...mediaStyle }} />
        </AbsoluteFill>
        {overlay}
      </>
    )
  }

  if (config.type === 'video' && config.videoUrl) {
    return (
      <>
        <AbsoluteFill>
          {/*
            OffthreadVideo reads frames directly from the file during rendering,
            avoiding the jitter that <Video> causes when Remotion captures frames
            from an HTML video element. Required for smooth output video.
          */}
          <OffthreadVideo src={config.videoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', ...mediaStyle }} />
        </AbsoluteFill>
        {overlay}
      </>
    )
  }

  const radialGlow =
    config.radialGlow
      ? (
          <AbsoluteFill
            style={{
              background: `radial-gradient(ellipse at center, ${config.radialGlow.color} 0%, transparent ${Math.round((config.radialGlow.size ?? 0.5) * 100)}%)`,
              opacity: config.radialGlow.opacity ?? 0.35,
              pointerEvents: 'none',
            }}
          />
        )
      : null

  return (
    <>
      <AbsoluteFill style={{ backgroundColor: config.color || '#000000' }} />
      {radialGlow}
      {overlay}
    </>
  )
}
