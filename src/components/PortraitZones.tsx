import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import type { PortraitZoneConfig } from '../lib/types'

interface PortraitZonesProps {
  zones: PortraitZoneConfig
  canvasWidth: number
  canvasHeight: number
}

/**
 * Renders decorative portrait layout elements: top bar, divider line,
 * side accents, frame lines. Each element animates in on the first few frames.
 */
export const PortraitZones: React.FC<PortraitZonesProps> = ({
  zones,
  canvasWidth,
  canvasHeight,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Global entrance: everything fades/draws in over first 12 frames
  const globalProgress = Math.min(frame / 12, 1)
  const globalOpacity = interpolate(globalProgress, [0, 1], [0, 1])

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>

      {/* Top accent bar — slides down from top */}
      {zones.topBar && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: zones.topBar.height,
            backgroundColor: zones.topBar.color,
            opacity: (zones.topBar.opacity ?? 1) * globalOpacity,
            transform: `translateY(${interpolate(globalProgress, [0, 1], [-zones.topBar.height, 0])}px)`,
          }}
        />
      )}

      {/* Divider line — draws in from left to right */}
      {zones.dividerLine && (() => {
        const widthPercent = zones.dividerLine.widthPercent ?? 100
        const fullWidth = (canvasWidth * widthPercent) / 100
        const lineX = (canvasWidth - fullWidth) / 2
        const lineWidth = fullWidth * Math.min(frame / 18, 1)
        return (
          <div
            style={{
              position: 'absolute',
              top: zones.dividerLine.yPosition,
              left: lineX,
              width: lineWidth,
              height: 2,
              backgroundColor: zones.dividerLine.color,
              opacity: (zones.dividerLine.opacity ?? 0.5) * globalOpacity,
            }}
          />
        )
      })()}

      {/* Side accent bars — left and right edges */}
      {zones.sideAccents && (() => {
        const heightPct = zones.sideAccents.heightPercent ?? 60
        const accentH = (canvasHeight * heightPct) / 100
        const accentY = (canvasHeight - accentH) / 2
        const accentOpacity = (zones.sideAccents.opacity ?? 0.35) * globalOpacity
        return (
          <>
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: accentY,
                width: zones.sideAccents.width,
                height: accentH,
                backgroundColor: zones.sideAccents.color,
                opacity: accentOpacity,
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: accentY,
                width: zones.sideAccents.width,
                height: accentH,
                backgroundColor: zones.sideAccents.color,
                opacity: accentOpacity,
              }}
            />
          </>
        )
      })()}

      {/* Frame lines — horizontal lines above and below the caption area */}
      {zones.frameLines && (() => {
        const lineW = (canvasWidth * zones.frameLines.widthPercent) / 100
        const lineX = (canvasWidth - lineW) / 2
        const captionCenter = canvasHeight / 2
        const lineOpacity = (zones.frameLines.opacity ?? 0.5) * globalOpacity
        const animatedW = lineW * Math.min(frame / 20, 1)
        const animatedX = lineX + (lineW - animatedW) / 2
        return (
          <>
            <div
              style={{
                position: 'absolute',
                top: captionCenter - zones.frameLines.yOffset,
                left: animatedX,
                width: animatedW,
                height: 2,
                backgroundColor: zones.frameLines.color,
                opacity: lineOpacity,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: captionCenter + zones.frameLines.yOffset,
                left: animatedX,
                width: animatedW,
                height: 2,
                backgroundColor: zones.frameLines.color,
                opacity: lineOpacity,
              }}
            />
          </>
        )
      })()}

    </AbsoluteFill>
  )
}
