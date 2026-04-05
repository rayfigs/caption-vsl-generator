/**
 * Recipe Selector — recommends a style recipe based on client type, video type, and energy level.
 *
 * Usage:
 *   const templateId = recommendRecipe({ clientType: 'medical', videoType: 'testimonial', energy: 'low' })
 *   // Returns: 'recipe-clean-caption'
 */

export type ClientType = 'medical' | 'coaching' | 'fitness' | 'corporate' | 'ecommerce' | 'luxury' | 'saas'
export type Platform = 'instagram-reels' | 'tiktok' | 'youtube-shorts' | 'facebook' | 'linkedin'
export type VideoType = 'testimonial' | 'talking-head' | 'compilation' | 'case-study' | 'promo'
export type EnergyLevel = 'low' | 'medium' | 'high'

export interface RecipeInput {
  clientType: ClientType
  platform?: Platform
  videoType: VideoType
  energy: EnergyLevel
}

export interface RecipeRecommendation {
  templateId: string
  reason: string
}

// Decision matrix: [clientType][videoType][energy] → templateId
const RECIPE_MATRIX: Record<string, Record<string, Record<EnergyLevel, string>>> = {
  medical: {
    testimonial:  { low: 'recipe-clean-caption',  medium: 'recipe-documentary',    high: 'recipe-bold-statement' },
    'talking-head': { low: 'recipe-documentary',  medium: 'recipe-clean-caption',  high: 'recipe-bold-statement' },
    compilation:  { low: 'recipe-social-proof',   medium: 'recipe-social-proof',   high: 'recipe-hype-reel' },
    'case-study': { low: 'recipe-story-arc',      medium: 'recipe-story-arc',      high: 'recipe-bold-statement' },
    promo:        { low: 'recipe-brand-immersive', medium: 'recipe-brand-immersive', high: 'recipe-bold-statement' },
  },
  coaching: {
    testimonial:  { low: 'recipe-minimal-luxury',  medium: 'recipe-clean-caption',  high: 'recipe-bold-statement' },
    'talking-head': { low: 'recipe-clean-caption', medium: 'recipe-bold-statement', high: 'recipe-hype-reel' },
    compilation:  { low: 'recipe-social-proof',    medium: 'recipe-social-proof',   high: 'recipe-hype-reel' },
    'case-study': { low: 'recipe-story-arc',       medium: 'recipe-story-arc',      high: 'recipe-bold-statement' },
    promo:        { low: 'recipe-brand-immersive',  medium: 'recipe-hype-reel',     high: 'recipe-hype-reel' },
  },
  fitness: {
    testimonial:  { low: 'recipe-clean-caption',  medium: 'recipe-story-arc',      high: 'recipe-hype-reel' },
    'talking-head': { low: 'recipe-clean-caption', medium: 'recipe-bold-statement', high: 'recipe-hype-reel' },
    compilation:  { low: 'recipe-social-proof',   medium: 'recipe-hype-reel',      high: 'recipe-hype-reel' },
    'case-study': { low: 'recipe-story-arc',      medium: 'recipe-story-arc',      high: 'recipe-hype-reel' },
    promo:        { low: 'recipe-brand-immersive', medium: 'recipe-hype-reel',     high: 'recipe-hype-reel' },
  },
  corporate: {
    testimonial:  { low: 'recipe-documentary',    medium: 'recipe-clean-caption',  high: 'recipe-brand-immersive' },
    'talking-head': { low: 'recipe-documentary',  medium: 'recipe-documentary',    high: 'recipe-bold-statement' },
    compilation:  { low: 'recipe-social-proof',   medium: 'recipe-social-proof',   high: 'recipe-brand-immersive' },
    'case-study': { low: 'recipe-documentary',    medium: 'recipe-story-arc',      high: 'recipe-bold-statement' },
    promo:        { low: 'recipe-brand-immersive', medium: 'recipe-brand-immersive', high: 'recipe-bold-statement' },
  },
  ecommerce: {
    testimonial:  { low: 'recipe-clean-caption',  medium: 'recipe-bold-statement', high: 'recipe-hype-reel' },
    'talking-head': { low: 'recipe-clean-caption', medium: 'recipe-bold-statement', high: 'recipe-hype-reel' },
    compilation:  { low: 'recipe-social-proof',   medium: 'recipe-hype-reel',      high: 'recipe-hype-reel' },
    'case-study': { low: 'recipe-story-arc',      medium: 'recipe-bold-statement', high: 'recipe-hype-reel' },
    promo:        { low: 'recipe-brand-immersive', medium: 'recipe-hype-reel',     high: 'recipe-hype-reel' },
  },
  luxury: {
    testimonial:  { low: 'recipe-minimal-luxury', medium: 'recipe-minimal-luxury', high: 'recipe-clean-caption' },
    'talking-head': { low: 'recipe-minimal-luxury', medium: 'recipe-documentary',  high: 'recipe-bold-statement' },
    compilation:  { low: 'recipe-social-proof',   medium: 'recipe-social-proof',   high: 'recipe-brand-immersive' },
    'case-study': { low: 'recipe-minimal-luxury', medium: 'recipe-story-arc',      high: 'recipe-bold-statement' },
    promo:        { low: 'recipe-minimal-luxury', medium: 'recipe-brand-immersive', high: 'recipe-brand-immersive' },
  },
  saas: {
    testimonial:  { low: 'recipe-clean-caption',  medium: 'recipe-clean-caption',  high: 'recipe-bold-statement' },
    'talking-head': { low: 'recipe-documentary',  medium: 'recipe-clean-caption',  high: 'recipe-bold-statement' },
    compilation:  { low: 'recipe-social-proof',   medium: 'recipe-social-proof',   high: 'recipe-hype-reel' },
    'case-study': { low: 'recipe-story-arc',      medium: 'recipe-story-arc',      high: 'recipe-bold-statement' },
    promo:        { low: 'recipe-brand-immersive', medium: 'recipe-brand-immersive', high: 'recipe-hype-reel' },
  },
}

const RECIPE_DESCRIPTIONS: Record<string, string> = {
  'recipe-clean-caption': 'Minimal, readable, subject-forward. Captions only, no graphic elements.',
  'recipe-bold-statement': 'Large kinetic type, high contrast, punchy edits. Words as the hero.',
  'recipe-brand-immersive': 'Full brand colour treatment, logo integration, on-brand typography.',
  'recipe-social-proof': 'Multiple testimonials unified by common graphic language.',
  'recipe-documentary': 'Lower thirds, subtle motion, journalistic feel. Credibility-forward.',
  'recipe-hype-reel': 'Fast cuts, music-synced, energetic transitions. Emotion-forward.',
  'recipe-story-arc': 'Three-act structure with title cards between acts.',
  'recipe-minimal-luxury': 'Slow, deliberate, high-end. Negative space, elegant typography.',
}

export function recommendRecipe(input: RecipeInput): RecipeRecommendation {
  const clientMatrix = RECIPE_MATRIX[input.clientType]
  if (!clientMatrix) {
    return { templateId: 'recipe-clean-caption', reason: `Unknown client type "${input.clientType}", defaulting to clean caption.` }
  }

  const videoMatrix = clientMatrix[input.videoType]
  if (!videoMatrix) {
    return { templateId: 'recipe-clean-caption', reason: `Unknown video type "${input.videoType}", defaulting to clean caption.` }
  }

  const templateId = videoMatrix[input.energy]
  const description = RECIPE_DESCRIPTIONS[templateId] || ''

  return {
    templateId,
    reason: `${input.clientType} + ${input.videoType} + ${input.energy} energy → ${templateId}. ${description}`,
  }
}

export function listRecipes(): Array<{ id: string; description: string }> {
  return Object.entries(RECIPE_DESCRIPTIONS).map(([id, description]) => ({ id, description }))
}
