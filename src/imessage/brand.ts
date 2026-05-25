import type { BrandProps, LogoOverlayType, ResolvedBrandProps } from '../types.ts';

const DEFAULT_LOGO_PLACEMENT: LogoOverlayType = 'persistent-watermark';

export const defaultBrandProps: ResolvedBrandProps = {
  sentBubbleColor: '#34C759',
  receivedBubbleColor: '#E9E9EB',
  headerColor: '#111111',
  backgroundColor: '#FFFFFF',
  primaryColor: '#34C759',
  secondaryColor: '#0F172A',
  accentColor: '#93C5FD',
  textColor: '#FFFFFF',
  headingFontFamily: 'Inter, Helvetica Neue, Arial, sans-serif',
  bodyFontFamily: 'Inter, Helvetica Neue, Arial, sans-serif',
  displayFontFamily: 'Inter Tight, Inter, Helvetica Neue, Arial, sans-serif',
  logoPlacement: DEFAULT_LOGO_PLACEMENT,
  logoScale: 0.16,
  logoOpacity: 0.18,
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const withAlpha = (color: string, opacity: number): string => {
  if (color.startsWith('#') && (color.length === 7 || color.length === 4)) {
    const hex =
      color.length === 4
        ? color
            .slice(1)
            .split('')
            .map((char) => char + char)
            .join('')
        : color.slice(1);
    const red = parseInt(hex.slice(0, 2), 16);
    const green = parseInt(hex.slice(2, 4), 16);
    const blue = parseInt(hex.slice(4, 6), 16);

    return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
  }

  return color;
};

const isLogoPlacement = (value: string): value is LogoOverlayType => {
  return [
    'corner-badge',
    'intro-card',
    'outro-card',
    'persistent-watermark',
    'lower-third',
  ].includes(value);
};

export const resolveBrandProps = (brand?: BrandProps): ResolvedBrandProps => {
  if (!brand) {
    return defaultBrandProps;
  }

  return {
    sentBubbleColor: brand.sentBubbleColor ?? defaultBrandProps.sentBubbleColor,
    receivedBubbleColor: brand.receivedBubbleColor ?? defaultBrandProps.receivedBubbleColor,
    headerColor: brand.headerColor ?? defaultBrandProps.headerColor,
    backgroundColor: brand.backgroundColor ?? defaultBrandProps.backgroundColor,
    primaryColor: brand.primaryColor ?? brand.sentBubbleColor ?? defaultBrandProps.primaryColor,
    secondaryColor: brand.secondaryColor ?? brand.headerColor ?? defaultBrandProps.secondaryColor,
    accentColor: brand.accentColor ?? brand.receivedBubbleColor ?? defaultBrandProps.accentColor,
    textColor: brand.textColor ?? defaultBrandProps.textColor,
    headingFontFamily: brand.headingFontFamily ?? defaultBrandProps.headingFontFamily,
    bodyFontFamily: brand.bodyFontFamily ?? defaultBrandProps.bodyFontFamily,
    displayFontFamily: brand.displayFontFamily ?? defaultBrandProps.displayFontFamily,
    logoUrl: brand.logoUrl,
    logoPlacement: brand.logoPlacement ?? defaultBrandProps.logoPlacement,
    logoScale: clamp(brand.logoScale ?? defaultBrandProps.logoScale, 0.08, 0.3),
    logoOpacity: clamp(brand.logoOpacity ?? defaultBrandProps.logoOpacity, 0.05, 1),
    tagline: brand.tagline,
    brandName: brand.brandName,
  };
};

export const parseBrandJson = (value?: string): BrandProps | undefined => {
  if (!value) {
    return undefined;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid --brand-json value: ${message}`);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Invalid --brand-json value: expected a JSON object.');
  }

  const record = parsed as Record<string, unknown>;
  const brand: BrandProps = {};

  if (typeof record.sentBubbleColor === 'string') brand.sentBubbleColor = record.sentBubbleColor;
  if (typeof record.receivedBubbleColor === 'string') {
    brand.receivedBubbleColor = record.receivedBubbleColor;
  }
  if (typeof record.headerColor === 'string') brand.headerColor = record.headerColor;
  if (typeof record.backgroundColor === 'string') brand.backgroundColor = record.backgroundColor;
  if (typeof record.primaryColor === 'string') brand.primaryColor = record.primaryColor;
  if (typeof record.secondaryColor === 'string') brand.secondaryColor = record.secondaryColor;
  if (typeof record.accentColor === 'string') brand.accentColor = record.accentColor;
  if (typeof record.textColor === 'string') brand.textColor = record.textColor;
  if (typeof record.headingFontFamily === 'string') {
    brand.headingFontFamily = record.headingFontFamily;
  }
  if (typeof record.bodyFontFamily === 'string') {
    brand.bodyFontFamily = record.bodyFontFamily;
  }
  if (typeof record.displayFontFamily === 'string') {
    brand.displayFontFamily = record.displayFontFamily;
  }
  if (typeof record.logoUrl === 'string') brand.logoUrl = record.logoUrl;
  if (typeof record.logoPlacement === 'string' && isLogoPlacement(record.logoPlacement)) {
    brand.logoPlacement = record.logoPlacement;
  }
  if (typeof record.logoScale === 'number') brand.logoScale = record.logoScale;
  if (typeof record.logoOpacity === 'number') brand.logoOpacity = record.logoOpacity;
  if (typeof record.tagline === 'string') brand.tagline = record.tagline;
  if (typeof record.brandName === 'string') brand.brandName = record.brandName;

  return brand;
};
