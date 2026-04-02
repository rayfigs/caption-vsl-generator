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

export function getTemplate(id: string): Template {
  const template = templates.find((entry) => entry.id === id)

  if (!template) {
    throw new Error(`Unknown template: ${id}`)
  }

  return template
}
