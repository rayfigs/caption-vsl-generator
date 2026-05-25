import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { FrameLabel } from '../components/FrameLabel'
import { SceneBackground } from '../components/SceneBackground'
import { ModuleTag } from '../components/ModuleTag'
import { BRAND, SAFE } from '../data/showreel.config'

/**
 * Scene 10: Brand Variations
 * One clip, three different brand identities shown side-by-side or cycling.
 * Voiceover: "Match different brands without rebuilding from scratch."
 */

interface BrandCard {
  name: string
  bg: string
  accent: string
  textColor: string
  font: string
  captionText: string
  highlightWord: string
}

const BRAND_VARIANTS: BrandCard[] = [
  {
    name: 'The Fitness Doctor',
    bg: '#1C1D29',
    accent: '#9003F1',
    textColor: '#ffffff',
    font: 'Montserrat',
    captionText: 'I lost 28 POUNDS',
    highlightWord: 'POUNDS',
  },
  {
    name: 'Clean Slate Wellness',
    bg: '#0d1f1a',
    accent: '#00c896',
    textColor: '#e8fff8',
    font: 'Arial',
    captionText: 'FINALLY free of pain',
    highlightWord: 'free',
  },
  {
    name: 'Peak Performance Lab',
    bg: '#0a0a0a',
    accent: '#ff3c00',
    textColor: '#ffffff',
    font: 'Impact',
    captionText: 'FASTEST results EVER',
    highlightWord: 'FASTEST',
  },
]

export const Scene10BrandVariations: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const fadeIn = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' })

  // Cards stagger in
  const cardSpring = (startFrame: number) => {
    const f = Math.max(0, frame - startFrame)
    const s = spring({ frame: f, fps, config: { damping: 26, stiffness: 320, mass: 0.65 } })
    return {
      opacity: interpolate(s, [0, 1], [0, 1], { extrapolateRight: 'clamp' }),
      y: interpolate(s, [0, 1], [40, 0], { extrapolateRight: 'clamp' }),
      scale: interpolate(s, [0, 1], [0.9, 1], { extrapolateRight: 'clamp' }),
    }
  }

  const cards = [cardSpring(8), cardSpring(26), cardSpring(44)]

  // "Same clip" annotation
  const annotFrame = Math.max(0, frame - 70)
  const sAnnot = spring({ frame: annotFrame, fps, config: { damping: 30, stiffness: 280, mass: 0.75 } })
  const annotOpacity = interpolate(sAnnot, [0, 1], [0, 1], { extrapolateRight: 'clamp' })
  const annotY = interpolate(sAnnot, [0, 1], [16, 0], { extrapolateRight: 'clamp' })

  // Active word pulse for highlight simulation
  const pulse = 0.9 + Math.sin(frame * 0.12) * 0.1

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <SceneBackground from="#080912" to="#10111f" angle={148} />

      {/* Header */}
      <div style={{
        position: 'absolute',
        top: 100,
        left: 0, right: 0,
        textAlign: 'center',
        fontSize: 58,
        fontFamily: BRAND.font,
        fontWeight: '800',
        color: BRAND.white,
        letterSpacing: '-1.5px',
      }}>
        ONE CLIP.{' '}
        <span style={{ color: BRAND.purple }}>THREE BRANDS.</span>
      </div>

      {/* Brand cards */}
      <div style={{
        position: 'absolute',
        top: 220,
        left: 30,
        right: 30,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}>
        {BRAND_VARIANTS.map((brand, i) => (
          <div key={i} style={{
            opacity: cards[i].opacity,
            transform: `translateY(${cards[i].y}px) scale(${cards[i].scale})`,
            backgroundColor: brand.bg,
            borderRadius: 20,
            padding: '28px 32px',
            border: `2px solid ${brand.accent}40`,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
          }}>
            {/* Brand color swatch */}
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              backgroundColor: brand.accent,
              flexShrink: 0,
              boxShadow: `0 0 20px ${brand.accent}60`,
            }} />

            {/* Brand name + caption preview */}
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 26,
                fontFamily: BRAND.font,
                fontWeight: '700',
                color: 'rgba(255,255,255,0.5)',
                marginBottom: 8,
                letterSpacing: '0.5px',
              }}>{brand.name}</div>

              {/* Caption with highlight */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                alignItems: 'center',
              }}>
                {brand.captionText.split(' ').map((word, wi) => {
                  const isHighlight = word.toLowerCase().replace(/[^a-z]/g, '') ===
                    brand.highlightWord.toLowerCase().replace(/[^a-z]/g, '')
                  return (
                    <span key={wi} style={{
                      position: 'relative',
                      display: 'inline-block',
                      fontSize: 38,
                      fontFamily: brand.font,
                      fontWeight: '800',
                      color: isHighlight ? '#000' : brand.textColor,
                      letterSpacing: '-0.5px',
                    }}>
                      {isHighlight && (
                        <span style={{
                          position: 'absolute',
                          inset: '-4px -8px',
                          backgroundColor: brand.accent,
                          borderRadius: 6,
                          zIndex: 0,
                          opacity: pulse,
                        }} />
                      )}
                      <span style={{ position: 'relative', zIndex: 1 }}>{word}</span>
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Template badge */}
            <div style={{
              padding: '8px 16px',
              borderRadius: 100,
              backgroundColor: `${brand.accent}20`,
              border: `1.5px solid ${brand.accent}60`,
              fontSize: 20,
              fontFamily: BRAND.font,
              fontWeight: '700',
              color: brand.accent,
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap',
            }}>brand profile</div>
          </div>
        ))}
      </div>

      {/* "Same source clip" annotation — above SAFE.bottom to clear ModuleTag */}
      <div style={{
        position: 'absolute',
        bottom: SAFE.bottom,
        left: 0, right: 0,
        textAlign: 'center',
        opacity: annotOpacity,
        transform: `translateY(${annotY}px)`,
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 32px',
          borderRadius: 100,
          border: `1.5px solid rgba(144,3,241,0.4)`,
          backgroundColor: 'rgba(144,3,241,0.08)',
        }}>
          <span style={{ fontSize: 28 }}>🎬</span>
          <span style={{
            fontSize: 30,
            fontFamily: BRAND.font,
            fontWeight: '700',
            color: BRAND.purple,
            letterSpacing: '0.5px',
          }}>SAME SOURCE. DIFFERENT BRAND RULES.</span>
        </div>
      </div>

      <FrameLabel text="Brand + template system" />
      <ModuleTag modules={['brand_engine', 'output_engine']} />
    </AbsoluteFill>
  )
}
