import './index.css'
import { Composition } from 'remotion'
import { loadFont as loadMontserrat } from '@remotion/google-fonts/Montserrat'
import { CaptionVSL, type CaptionVSLProps } from './compositions/CaptionVSL'
import { TitleCard } from './compositions/TitleCard'
import { LowerThird } from './compositions/LowerThird'
import { ExplainerScene } from './compositions/ExplainerScene'
import { EndCard } from './compositions/EndCard'
import { Showreel } from './showreel/Showreel'
import { getTemplate } from './templates'

// Pre-load Montserrat so it's available when the Fitness Doctor brand renders.
// This is a no-op if the font is already cached.
loadMontserrat()

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
      <Composition
        id="TitleCard"
        component={TitleCard as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          title: 'Title',
          subtitle: '',
          backgroundColor: '#000000',
          textColor: '#ffffff',
          accentColor: '#2563EB',
          fontFamily: 'Montserrat',
          duration: 3,
          style: 'scale-in',
        } as unknown as Record<string, unknown>}
      />
      <Composition
        id="LowerThird"
        component={LowerThird as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          name: 'Speaker Name',
          title: 'Title',
          backgroundColor: 'rgba(0,0,0,0.6)',
          textColor: '#ffffff',
          accentColor: '#2563EB',
          fontFamily: 'Montserrat',
          enterAt: 30,
          exitAt: 120,
          position: 'left',
        } as unknown as Record<string, unknown>}
      />
      <Composition
        id="ExplainerScene"
        component={ExplainerScene as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          points: [
            { icon: '1', heading: 'First Point', body: 'Description here' },
            { icon: '2', heading: 'Second Point', body: 'Another description' },
            { icon: '3', heading: 'Third Point', body: 'Final description' },
          ],
          backgroundColor: '#0F172A',
          textColor: '#ffffff',
          accentColor: '#2563EB',
          fontFamily: 'Montserrat',
          secondsPerPoint: 3,
        } as unknown as Record<string, unknown>}
      />
      <Composition
        id="EndCard"
        component={EndCard as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          ctaText: 'Book Your Free Consultation',
          contactLine: 'example.com',
          backgroundColor: '#0F172A',
          textColor: '#ffffff',
          accentColor: '#2563EB',
          fontFamily: 'Montserrat',
        } as unknown as Record<string, unknown>}
      />
      <Composition
        id="AgencyShowreel"
        component={Showreel}
        durationInFrames={1350}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
    </>
  )
}
