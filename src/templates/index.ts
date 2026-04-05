import { boldStatement } from './bold-statement'
import { classicDark } from './classic-dark'
import { classicPurple } from './classic-purple'
import { modernMinimal } from './modern-minimal'
import { notificationCard } from './notification-card'
import { rorickBold } from './rorick-bold'
import { portraitKinetic } from './portrait-kinetic'
import { portraitImpact } from './portrait-impact'
import { portraitTumble } from './portrait-tumble'
import { portraitTypewriter } from './portrait-typewriter'
import { portraitWave } from './portrait-wave'
import { portraitBlur } from './portrait-blur'
import { portraitTestimonial } from './portrait-testimonial'
import { recipeCleanCaption } from './recipe-clean-caption'
import { recipeBoldStatement } from './recipe-bold-statement'
import { recipeBrandImmersive } from './recipe-brand-immersive'
import { recipeSocialProof } from './recipe-social-proof'
import { recipeDocumentary } from './recipe-documentary'
import { recipeHypeReel } from './recipe-hype-reel'
import { recipeStoryArc } from './recipe-story-arc'
import { recipeMinimalLuxury } from './recipe-minimal-luxury'
import type { Template } from '../lib/types'

export const templates: Template[] = [
  // Original templates
  classicDark,
  classicPurple,
  modernMinimal,
  boldStatement,
  notificationCard,
  rorickBold,
  // Portrait templates
  portraitKinetic,
  portraitImpact,
  portraitTumble,
  portraitTypewriter,
  portraitWave,
  portraitBlur,
  portraitTestimonial,
  // Style recipes (from re:Motion Agent Brain)
  recipeCleanCaption,
  recipeBoldStatement,
  recipeBrandImmersive,
  recipeSocialProof,
  recipeDocumentary,
  recipeHypeReel,
  recipeStoryArc,
  recipeMinimalLuxury,
]

export function validateTemplate(template: Template): Template {
  if (!template.id || !template.name) {
    throw new Error('Template must include an id and name')
  }

  if (!template.brandDefaults) {
    throw new Error(`Template ${template.id} must define brand defaults`)
  }

  if (template.canvas.width <= 0 || template.canvas.height <= 0) {
    throw new Error(`Template ${template.id} must define a positive canvas size`)
  }

  if (template.captionBox.width <= 0 || template.captionBox.height <= 0) {
    throw new Error(`Template ${template.id} must define a positive caption box size`)
  }

  if (template.text.fontSize <= 0) {
    throw new Error(`Template ${template.id} must define a positive font size`)
  }

  return template
}

export function getTemplate(id: string): Template {
  const template = templates.find((entry) => entry.id === id)

  if (!template) {
    throw new Error(`Unknown template: ${id}`)
  }

  return validateTemplate(template)
}
