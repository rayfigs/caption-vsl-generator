import './index.css'
import { Composition } from 'remotion'
import { CaptionVSL } from './compositions/CaptionVSL'
import { getTemplate } from './templates'

export const RemotionRoot: React.FC = () => {
  const template = getTemplate('classic-dark')

  return (
    <>
      <Composition
        id="CaptionVSL"
        component={CaptionVSL}
        durationInFrames={90}
        fps={30}
        width={template.canvas.width}
        height={template.canvas.height}
        defaultProps={{
          template,
          audioUrl: '',
          audioDuration: 3,
          segments: [],
        }}
      />
    </>
  )
}
