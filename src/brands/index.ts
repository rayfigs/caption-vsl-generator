/**
 * Named brand profiles.
 * Use via CLI: --brand <name>
 * Add new clients here and reference them by name without copying JSON every time.
 */
import type { BrandedTemplateProps } from '../lib/types'

export const brandProfiles: Record<string, BrandedTemplateProps> = {
  /**
   * Neon blue tech / SaaS feel.
   * Drop in a logoUrl when you have the asset.
   */
  demo_tech: {
    background: '#05060f',
    textColor: '#e8f4ff',
    highlightColor: '#38bdf8',
    secondaryColor: '#0284c7',
    headingFont: 'Arial',
    bodyFont: 'Arial',
    logoPosition: 'top-right',
    logoScale: 0.1,
  },

  /**
   * Warm premium feel for coaching / high-ticket offers.
   */
  demo_premium: {
    background: '#0f0c08',
    textColor: '#fef3c7',
    highlightColor: '#d97706',
    secondaryColor: '#92400e',
    headingFont: 'Arial',
    bodyFont: 'Arial',
    logoPosition: 'top-left',
    logoScale: 0.1,
  },

  /**
   * The Fitness Doctor — brand guide Aug 2025.
   *
   * Colors (from brand PDF):
   *   Primary:    #9003F1 (purple), #FF5D00 (orange), #1C1D29 (dark navy)
   *   Accent:     #6BBE45 (green),  #9B5DFE (light purple)
   *   Background: #1C1D29 (dark) or #171221 (deeper)
   *
   * Typography (social media per brand guide):
   *   Headlines:  Montserrat ExtraBold
   *   Body:       Montserrat Bold
   *   Tight titles (thumbnails): Bebas Neue Bold
   *
   * For caption videos, using Montserrat ExtraBold with purple (#9003F1) highlight.
   */
  fitness_doctor: {
    background: '#1C1D29',
    textColor: '#ffffff',
    highlightColor: '#9003F1',
    secondaryColor: '#FF5D00',
    headingFont: 'Montserrat',
    bodyFont: 'Montserrat',
    logoPosition: 'top-right',
    logoScale: 0.1,
  },

  /**
   * Ms. Molar / Robert Strazzarino — dental SOP app.
   *
   * Colors (from strategy deck):
   *   Accent:     #4ECDC4 (teal)
   *   Background: #0a0b0d (near-black)
   *   Text:       #f0f2f5 (off-white)
   *   Secondary:  #88E5DF (light teal)
   *
   * These videos target dental practice owners, not patients.
   */
  ms_molar: {
    background: '#0a0b0d',
    textColor: '#f0f2f5',
    highlightColor: '#4ECDC4',
    secondaryColor: '#88E5DF',
    headingFont: 'Arial',
    bodyFont: 'Arial',
    logoPosition: 'top-right',
    logoScale: 0.1,
  },

  /**
   * Colina International School — English-medium, Cluj-Napoca, Romania.
   *
   * Brand feel: clean, trustworthy, warm. International school credibility.
   * Primary accent: deep navy blue (#1E3A5F), warm highlight (#2A5F9E).
   * Used for Avatar VO / VOC videos in the Beni Pop proposal deck.
   */
  colina: {
    background: '#0d1a2e',
    textColor: '#f0f4f8',
    highlightColor: '#4a9edd',
    secondaryColor: '#2A5F9E',
    headingFont: 'Arial',
    bodyFont: 'Arial',
    logoPosition: 'top-right',
    logoScale: 0.1,
  },

  /**
   * Clean white-label neutral — works on any template without strong brand opinions.
   */
  demo_neutral: {
    background: '#18181b',
    textColor: '#fafafa',
    highlightColor: '#a855f7',
    secondaryColor: '#6b21a8',
    headingFont: 'Arial',
    bodyFont: 'Arial',
    logoPosition: 'top-right',
    logoScale: 0.1,
  },
}

/**
 * Look up a brand profile by name.
 * Throws if the name isn't registered.
 */
export function getBrandProfile(name: string): BrandedTemplateProps {
  const profile = brandProfiles[name.toLowerCase()]
  if (!profile) {
    const available = Object.keys(brandProfiles)
    const hint = available.length > 0
      ? `Available: ${available.join(', ')}`
      : 'No brand profiles registered yet. Add them to src/brands/index.ts.'
    throw new Error(`Unknown brand profile: "${name}". ${hint}`)
  }
  return profile
}

/**
 * List all registered brand profile names.
 */
export function listBrandProfiles(): string[] {
  return Object.keys(brandProfiles)
}
