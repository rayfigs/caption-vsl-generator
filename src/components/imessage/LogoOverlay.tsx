import React from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import type { ResolvedBrandProps } from '../../imessage/types';

interface LogoOverlayProps {
  brand: ResolvedBrandProps;
  contactName: string;
}

const baseLogoStyle = (brand: ResolvedBrandProps): React.CSSProperties => ({
  width: `${Math.round(1080 * brand.logoScale)}px`,
  objectFit: 'contain',
});

export const LogoOverlay: React.FC<LogoOverlayProps> = ({ brand, contactName }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  if (!brand.logoUrl) {
    return null;
  }

  const fadeInOpacity = interpolate(frame, [0, 30], [0, brand.logoOpacity], {
    extrapolateRight: 'clamp',
  });

  if (brand.logoPlacement === 'intro-card') {
    const introOpacity = interpolate(frame, [0, 10, 24, 30], [0, 1, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    return (
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${brand.backgroundColor} 0%, rgba(0, 0, 0, 0.92) 100%)`,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: introOpacity,
          pointerEvents: 'none',
        }}
      >
        <Img src={brand.logoUrl} style={{ width: `${Math.round(1080 * clampScale(brand.logoScale, 0.18, 0.3))}px`, objectFit: 'contain' }} />
        <div style={{ marginTop: 40, color: '#FFFFFF', fontSize: 44, letterSpacing: 6 }}>
          {contactName.toUpperCase()}
        </div>
      </AbsoluteFill>
    );
  }

  if (brand.logoPlacement === 'outro-card') {
    const outroStart = Math.max(0, durationInFrames - 60);
    const outroOpacity = interpolate(frame, [outroStart, outroStart + 10, durationInFrames], [0, 1, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    return (
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(0, 0, 0, 0.88) 0%, ${brand.backgroundColor} 100%)`,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: outroOpacity,
          pointerEvents: 'none',
        }}
      >
        <Img src={brand.logoUrl} style={{ width: `${Math.round(1080 * clampScale(brand.logoScale, 0.16, 0.28))}px`, objectFit: 'contain' }} />
        <div style={{ marginTop: 36, color: '#FFFFFF', fontSize: 34 }}>
          {brand.tagline ?? `Reply ${contactName} to learn more`}
        </div>
      </AbsoluteFill>
    );
  }

  if (brand.logoPlacement === 'lower-third') {
    return (
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            left: 44,
            right: 44,
            bottom: 160,
            minHeight: 128,
            borderRadius: 999,
            padding: '22px 30px',
            backgroundColor: 'rgba(0, 0, 0, 0.58)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            opacity: fadeInOpacity,
          }}
        >
          <Img src={brand.logoUrl} style={{ width: '100px', height: '100px', objectFit: 'contain', flexShrink: 0 }} />
          <div style={{ color: '#FFFFFF', fontSize: 28, lineHeight: 1.2 }}>
            {brand.tagline ?? contactName}
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  if (brand.logoPlacement === 'corner-badge') {
    return (
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            top: 84,
            right: 70,
            width: `${Math.round(1080 * clampScale(brand.logoScale, 0.1, 0.18))}px`,
            height: `${Math.round(1080 * clampScale(brand.logoScale, 0.1, 0.18))}px`,
            borderRadius: '28px',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(14px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: fadeInOpacity,
          }}
        >
          <Img src={brand.logoUrl} style={{ width: '72%', height: '72%', objectFit: 'contain' }} />
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          right: 76,
          bottom: 124,
          opacity: fadeInOpacity,
        }}
      >
        <Img src={brand.logoUrl} style={baseLogoStyle(brand)} />
      </div>
    </AbsoluteFill>
  );
};

const clampScale = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};
