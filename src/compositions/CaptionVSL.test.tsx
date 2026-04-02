import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CaptionVSL, getActiveSegment } from './CaptionVSL'
import { classicPurple } from '../templates/classic-purple'

vi.mock('remotion', async () => {
  const actual = await vi.importActual<typeof import('remotion')>('remotion')

  return {
    ...actual,
    useCurrentFrame: () => 15,
    useVideoConfig: () => ({ fps: 30, width: 1080, height: 1080, durationInFrames: 90, id: 'CaptionVSL' }),
    Audio: ({ src }: { src: string }) => <div data-testid="audio">{src}</div>,
    Video: ({ src }: { src: string }) => <div data-testid="video">{src}</div>,
    Img: ({ src }: { src: string }) => <img alt="" src={src} />,
  }
})

describe('CaptionVSL', () => {
  it('finds the active segment at a given timestamp', () => {
    expect(
      getActiveSegment(
        [
          { text: 'One', startTime: 0, endTime: 0.5, words: [], activeWordIndex: 0 },
          { text: 'Two', startTime: 0.5, endTime: 1, words: [], activeWordIndex: 0 },
        ],
        0.75
      )?.text
    ).toBe('Two')
  })

  it('renders the active segment and audio track', () => {
    render(
      <CaptionVSL
        template={classicPurple}
        audioUrl="/tmp/mock.mp3"
        audioDuration={2}
        segments={[
          {
            text: 'First segment',
            startTime: 0,
            endTime: 0.4,
            words: [
              { word: 'First', start: 0, end: 0.2 },
              { word: 'segment', start: 0.2, end: 0.4 },
            ],
            activeWordIndex: 0,
          },
          {
            text: 'Second segment',
            startTime: 0.4,
            endTime: 1.2,
            words: [
              { word: 'Second', start: 0.4, end: 0.6 },
              { word: 'segment', start: 0.6, end: 1.2 },
            ],
            activeWordIndex: 0,
          },
        ]}
      />
    )

    expect(screen.getByTestId('audio')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('marks the active word for highlighting', () => {
    render(
      <CaptionVSL
        template={classicPurple}
        audioUrl=""
        audioDuration={2}
        segments={[
          {
            text: 'Second segment',
            startTime: 0.4,
            endTime: 1.2,
            words: [
              { word: 'Second', start: 0.4, end: 0.45 },
              { word: 'segment', start: 0.45, end: 1.2 },
            ],
            activeWordIndex: 0,
          },
        ]}
      />
    )

    const activeSegmentWord = screen
      .getAllByText('segment')
      .find((element) => element.getAttribute('data-active') === 'true')

    expect(activeSegmentWord).toHaveAttribute('data-active', 'true')
  })
})
