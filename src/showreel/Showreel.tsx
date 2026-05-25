import { AbsoluteFill, Sequence } from 'remotion'
import { Scene01RawInput } from './scenes/Scene01RawInput'
import { Scene02CleanEdit } from './scenes/Scene02CleanEdit'
import { Scene03CaptionEngine } from './scenes/Scene03CaptionEngine'
import { Scene04DirectResponse } from './scenes/Scene04DirectResponse'
import { Scene05AuthorityStyle } from './scenes/Scene05AuthorityStyle'
import { Scene06DisclaimerSystem } from './scenes/Scene06DisclaimerSystem'
import { Scene07CitationSystem } from './scenes/Scene07CitationSystem'
import { Scene08FormatTransformer } from './scenes/Scene08FormatTransformer'
import { Scene09BRollEngine } from './scenes/Scene09BRollEngine'
import { Scene10BrandVariations } from './scenes/Scene10BrandVariations'
import { Scene11OutputGrid } from './scenes/Scene11OutputGrid'

/**
 * 45-second showreel demonstrating all re:Motion capabilities.
 * Total: 1350 frames at 30fps.
 *
 * Timing matches showreel_system_pack.md:
 *  0:00–0:03   Scene01  Raw input         (90 frames)
 *  0:03–0:07   Scene02  Clean edit        (120 frames)
 *  0:07–0:11   Scene03  Caption engine    (120 frames)
 *  0:11–0:15   Scene04  Direct response   (120 frames)
 *  0:15–0:19   Scene05  Authority style   (120 frames)
 *  0:19–0:22   Scene06  Disclaimer system (90 frames)
 *  0:22–0:25   Scene07  Citation system   (90 frames)
 *  0:25–0:30   Scene08  Format transformer(120 frames)
 *  0:30–0:34   Scene09  B-roll engine     (120 frames)
 *  0:34–0:39   Scene10  Brand variations  (150 frames)
 *  0:39–0:45   Scene11  Output grid       (210 frames)
 */
export const Showreel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#08091a' }}>
      <Sequence from={0}    durationInFrames={90}><Scene01RawInput /></Sequence>
      <Sequence from={90}   durationInFrames={120}><Scene02CleanEdit /></Sequence>
      <Sequence from={210}  durationInFrames={120}><Scene03CaptionEngine /></Sequence>
      <Sequence from={330}  durationInFrames={120}><Scene04DirectResponse /></Sequence>
      <Sequence from={450}  durationInFrames={120}><Scene05AuthorityStyle /></Sequence>
      <Sequence from={570}  durationInFrames={90}><Scene06DisclaimerSystem /></Sequence>
      <Sequence from={660}  durationInFrames={90}><Scene07CitationSystem /></Sequence>
      <Sequence from={750}  durationInFrames={120}><Scene08FormatTransformer /></Sequence>
      <Sequence from={870}  durationInFrames={120}><Scene09BRollEngine /></Sequence>
      <Sequence from={990}  durationInFrames={150}><Scene10BrandVariations /></Sequence>
      <Sequence from={1140} durationInFrames={210}><Scene11OutputGrid /></Sequence>
    </AbsoluteFill>
  )
}
