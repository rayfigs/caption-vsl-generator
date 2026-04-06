import { describe, expect, it } from 'vitest'
import { listRecipes, recommendRecipe } from './recipe-selector'

describe('recipe selector', () => {
  it('returns the expected recipes for the decision matrix examples', () => {
    expect(recommendRecipe({
      clientType: 'medical',
      videoType: 'testimonial',
      energy: 'low',
    }).templateId).toBe('recipe-clean-caption')

    expect(recommendRecipe({
      clientType: 'coaching',
      videoType: 'testimonial',
      energy: 'medium',
    }).templateId).toBe('recipe-clean-caption')

    expect(recommendRecipe({
      clientType: 'fitness',
      videoType: 'testimonial',
      energy: 'high',
    }).templateId).toBe('recipe-hype-reel')

    expect(recommendRecipe({
      clientType: 'corporate',
      videoType: 'talking-head',
      energy: 'low',
    }).templateId).toBe('recipe-documentary')

    expect(recommendRecipe({
      clientType: 'saas',
      videoType: 'compilation',
      energy: 'medium',
    }).templateId).toBe('recipe-social-proof')

    expect(recommendRecipe({
      clientType: 'ecommerce',
      videoType: 'promo',
      energy: 'medium',
    }).templateId).toBe('recipe-hype-reel')
  })

  it('lists all eight recipe templates', () => {
    const recipes = listRecipes()

    expect(recipes).toHaveLength(8)
    expect(recipes).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'recipe-clean-caption' }),
      expect.objectContaining({ id: 'recipe-minimal-luxury' }),
    ]))
  })
})
