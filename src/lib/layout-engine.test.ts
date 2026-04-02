import { describe, expect, it } from 'vitest'
import { calculateLayout, fitTextToBox } from './layout-engine'

describe('layout-engine', () => {
  it('calculates usable width and height', () => {
    expect(
      calculateLayout({
        boxWidth: 900,
        boxHeight: 400,
        fontSize: 50,
        lineHeight: 1.4,
        fontFamily: 'Arial',
        padding: 20,
      })
    ).toMatchObject({
      effectiveWidth: 860,
      effectiveHeight: 360,
    })
  })

  it('fits text into lines', () => {
    const lines = fitTextToBox('This is a short test line for the caption box', {
      boxWidth: 400,
      boxHeight: 240,
      fontSize: 40,
      lineHeight: 1.2,
      fontFamily: 'Arial',
      padding: 20,
    })

    expect(lines.length).toBeGreaterThan(0)
  })
})
