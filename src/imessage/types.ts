export type Message = {
  id: string;
  type: 'sent' | 'received';
  text?: string;
  image?: string;
  avatar?: string;
  duration: number;
  typingDuration?: number;
};

export type LogoOverlayType =
  | 'corner-badge'
  | 'intro-card'
  | 'outro-card'
  | 'persistent-watermark'
  | 'lower-third';

export type CanvasPreset = 'portrait' | 'square';

export type StyleRecipeId =
  | 'recipe-clean-caption'
  | 'recipe-bold-statement'
  | 'recipe-brand-immersive'
  | 'recipe-social-proof'
  | 'recipe-documentary'
  | 'recipe-hype-reel'
  | 'recipe-story-arc'
  | 'recipe-minimal-luxury';

export type RecipeClientType =
  | 'medical'
  | 'coaching'
  | 'fitness'
  | 'corporate'
  | 'ecommerce'
  | 'luxury'
  | 'saas';

export type RecipePlatform =
  | 'instagram-reels'
  | 'tiktok'
  | 'youtube-shorts'
  | 'facebook'
  | 'linkedin';

export type RecipeVideoType =
  | 'testimonial'
  | 'talking-head'
  | 'compilation'
  | 'case-study'
  | 'promo';

export type RecipeEnergy = 'low' | 'medium' | 'high';

export interface BrandProps {
  sentBubbleColor?: string;
  receivedBubbleColor?: string;
  headerColor?: string;
  backgroundColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  textColor?: string;
  headingFontFamily?: string;
  bodyFontFamily?: string;
  displayFontFamily?: string;
  logoUrl?: string;
  logoPlacement?: LogoOverlayType;
  logoScale?: number;
  logoOpacity?: number;
  tagline?: string;
  brandName?: string;
}

export interface ResolvedBrandProps {
  sentBubbleColor: string;
  receivedBubbleColor: string;
  headerColor: string;
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  headingFontFamily: string;
  bodyFontFamily: string;
  displayFontFamily: string;
  logoUrl?: string;
  logoPlacement: LogoOverlayType;
  logoScale: number;
  logoOpacity: number;
  tagline?: string;
  brandName?: string;
}

export type VideoCompositionProps = {
  conversation: Message[];
  contactName: string;
  subtitle?: string;
  is3D: boolean;
  brand?: BrandProps;
};

export interface RecipeSegment {
  id: string;
  text: string;
  startFrame: number;
  endFrame: number;
  speakerName?: string;
  speakerTitle?: string;
  emphasisWord?: string;
}

export interface RecipeTitleCard {
  id: string;
  label: string;
  startFrame: number;
  durationInFrames: number;
}

export interface RecipeVideoProps {
  templateId: StyleRecipeId;
  contactName: string;
  inputVideoUrl?: string;
  canvas: CanvasPreset;
  brand?: BrandProps;
  segments: RecipeSegment[];
  titleCards?: RecipeTitleCard[];
  counterLabel?: string;
  showNameCard?: boolean;
  showLogo?: boolean;
  hookFrame?: number;
  hasBurnedInText?: boolean;
  faceCenterY?: number;
}

export type RecipeMotionPreset =
  | 'fade-up-word'
  | 'pop-word'
  | 'slide-line'
  | 'line-reveal'
  | 'fade-line'
  | 'cascade-word'
  | 'highlight-word'
  | 'slow-fade-word';

export type RecipeTransitionPreset =
  | 'hard-cut'
  | 'flash-cut'
  | 'cross-dissolve'
  | 'dissolve'
  | 'beat-cut'
  | 'title-card'
  | 'long-dissolve';

export type RecipeCaptionPlacement =
  | 'lower-third'
  | 'center'
  | 'bottom-left'
  | 'center-lower'
  | 'alternating';

export type RecipeAccentMode =
  | 'keyword-color'
  | 'word-background'
  | 'brand-bar'
  | 'underline'
  | 'none';

export type RecipeBackgroundTreatment =
  | 'clean'
  | 'dark-overlay'
  | 'brand-gradient'
  | 'graded'
  | 'desaturated'
  | 'high-contrast'
  | 'vignette';

export interface StyleRecipeDefinition {
  id: StyleRecipeId;
  compositionId: string;
  name: string;
  description: string;
  clientTypes: RecipeClientType[];
  supportedVideoTypes: RecipeVideoType[];
  recommendedPlatforms: RecipePlatform[];
  energy: RecipeEnergy[];
  backgroundTreatment: RecipeBackgroundTreatment;
  captionPlacement: RecipeCaptionPlacement;
  captionFontRole: 'body' | 'heading' | 'display' | 'serif';
  captionWeight: number;
  captionSize: number;
  accentMode: RecipeAccentMode;
  motionPreset: RecipeMotionPreset;
  transitionPreset: RecipeTransitionPreset;
  safeZoneMargin: number;
  hasFrameBorder?: boolean;
  persistentLogo?: boolean;
  defaultProps: RecipeVideoProps;
}

export interface RecipeSelectorInput {
  clientType: RecipeClientType;
  platform: RecipePlatform;
  videoType: RecipeVideoType;
  energy: RecipeEnergy;
}

export interface RenderIMessageOptions {
  conversation: Message[];
  contactName: string;
  subtitle?: string;
  is3D?: boolean;
  brand?: BrandProps;
  outputPath: string;
  width?: number;
  height?: number;
}

export interface RenderIMessageResult {
  outputPath: string;
  duration: number;
}

export interface RenderRecipeVideoOptions {
  templateId: StyleRecipeId;
  inputVideoUrl?: string;
  outputPath: string;
  canvas?: CanvasPreset;
  brand?: BrandProps;
  contactName?: string;
  segments?: RecipeSegment[];
}

export interface QCResult {
  passed: boolean;
  checks: {
    safeZone: 'pass' | 'fail';
    textOnText: 'pass' | 'fail';
    faceVisible: 'pass' | 'fail';
    brandColors: 'pass' | 'fail';
    hookTiming: 'pass' | 'fail';
    captionSync: 'pass' | 'fail';
  };
  issues: string[];
}
