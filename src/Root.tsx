import './index.css'
import { Composition } from 'remotion'
import { CaptionVSL, type CaptionVSLProps } from './compositions/CaptionVSL'
import { getTemplate } from './templates'

export const RemotionRoot: React.FC = () => {
  const template = getTemplate('classic-dark')
  const defaultProps: CaptionVSLProps = {
    template,
    brand: undefined,
    audioUrl: '',
    audioDuration: 3,
    segments: [],
  }

  return (
    <>
      <Composition
        id="CaptionVSL"
        component={CaptionVSL as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={90}
        fps={30}
        width={template.canvas.width}
        height={template.canvas.height}
        defaultProps={defaultProps as unknown as Record<string, unknown>}
      />
    </>
  )
}
