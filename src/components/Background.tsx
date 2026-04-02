import { AbsoluteFill } from 'remotion'
import type { Template } from '../lib/types'

interface BackgroundProps {
  config: Template['background']
}

export const Background: React.FC<BackgroundProps> = ({ config }) => {
  if (config.type === 'gradient' && config.gradient) {
    return (
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${config.gradient.angle}deg, ${config.gradient.from}, ${config.gradient.to})`,
        }}
      />
    )
  }

  return <AbsoluteFill style={{ backgroundColor: config.color || '#000000' }} />
}
