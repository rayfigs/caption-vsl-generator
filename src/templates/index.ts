import { boldStatement } from './bold-statement'
import { classicDark } from './classic-dark'
import { classicPurple } from './classic-purple'
import { modernMinimal } from './modern-minimal'
import { notificationCard } from './notification-card'
import type { Template } from '../lib/types'

export const templates: Template[] = [
  classicDark,
  classicPurple,
  modernMinimal,
  boldStatement,
  notificationCard,
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
