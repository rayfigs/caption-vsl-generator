import { cleanup, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CaptionVSL } from '../compositions/CaptionVSL'
import { applyBrandingToTemplate } from '../lib/branding'
import { templates, validateTemplate } from './index'

vi.mock('remotion', async () => {
  const actual = await vi.importActual<typeof import('remotion')>('remotion')

  return {
    ...actual,
    useCurrentFrame: () => 0,
    useVideoConfig: () => ({ fps: 30, width: 1080, height: 1080, durationInFrames: 90, id: 'CaptionVSL' }),
    Audio: ({ src }: { src: string }) => <div data-testid="audio">{src}</div>,
    Video: ({ src }: { src: string }) => <div data-testid="video">{src}</div>,
    Img: ({ src }: { src: string }) => <div data-img-src={src} />,
  }
})

describe('templates', () => {
  it('validates every template config', () => {
    expect(templates).toHaveLength(5)

    for (const template of templates) {
      expect(validateTemplate(template)).toBe(template)
    }
  })

  it('renders each template without crashing in the composition', () => {
    for (const template of templates) {
      const view = render(
        <CaptionVSL
          template={template}
          audioUrl=""
          audioDuration={1}
          segments={[
            {
              text: 'This is a test caption',
              startTime: 0,
              endTime: 1,
              activeWordIndex: 1,
              words: [
                { word: 'This', start: 0, end: 0.2 },
                { word: 'is', start: 0.21, end: 0.3 },
                { word: 'a', start: 0.31, end: 0.4 },
                { word: 'test', start: 0.41, end: 0.6 },
                { word: 'caption', start: 0.61, end: 1 },
              ],
            },
          ]}
        />
      )

      expect(screen.getByText('This')).toBeInTheDocument()
      view.unmount()
      cleanup()
    }
  })

  it('applies brand overrides on top of template defaults', () => {
    const resolved = applyBrandingToTemplate(templates[0], {
      background: '#112233',
      textColor: '#fefefe',
      highlightColor: '#ff5500',
      bodyFont: 'Montserrat',
    })

    expect(resolved.template.background.color).toBe('#112233')
    expect(resolved.template.text.color).toBe('#fefefe')
    expect(resolved.template.highlight.color).toBe('#ff5500')
    expect(resolved.template.text.fontFamily).toBe('Montserrat')
  })
})
