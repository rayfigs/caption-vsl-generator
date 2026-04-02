import { AbsoluteFill } from 'remotion'
import { Background } from '../components/Background'
import { CaptionBlock } from '../components/CaptionBlock'
import type { CaptionSegment, Template } from '../lib/types'

export interface CaptionVSLProps {
  template: Template
  segments: CaptionSegment[]
  audioUrl: string
  audioDuration: number
}

export const CaptionVSL: React.FC<CaptionVSLProps> = ({ template, segments }) => {
  const activeSegment = segments[0] || null

  return (
    <AbsoluteFill>
      <Background config={template.background} />
      {activeSegment ? (
        <CaptionBlock segment={activeSegment} activeWordIndex={0} template={template} />
      ) : null}
    </AbsoluteFill>
  )
}
