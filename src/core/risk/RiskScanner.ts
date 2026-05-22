/**
 * 新品风险扫描器
 * 输入产品/原料 → 查询知识规则 + 历史事件 → 输出风险报告
 */

import type { RiskScanResult } from '../../types/risk'
import type { Product, Ingredient, KnowledgeRule, RiskEvent } from '../../types/entities'
import { RISK_LEVEL_CONFIG } from '../../types/risk'

import products from '../../data/products.json'
import ingredients from '../../data/ingredients.json'
import knowledgeRules from '../../data/knowledge_rules.json'
import riskEventsData from '../../data/risk_events.json'

const riskEvents = riskEventsData as unknown as RiskEvent[]

/**
 * 扫描产品风险
 */
export function scanProductRisk(productId: string): RiskScanResult {
  const product = products.find((p) => p.product_id === productId)
  if (!product) {
    return {
      product_id: productId,
      product_name: '未知产品',
      ingredient_risks: [],
      overall_risk_level: 'low',
      suggested_actions: [],
      related_knowledge_rules: [],
    }
  }

  const ingredientRisks = product.key_ingredients.map((ingId) => {
    const ingredient = ingredients.find((i) => i.ingredient_id === ingId)
    const historicalEvents = riskEvents.filter(
      (e) => e.product_id === productId || e.linked_batch.some((b) => b.includes(ingId))
    )

    return {
      ingredient_id: ingId,
      ingredient_name: ingredient?.ingredient_name || ingId,
      known_risks: ingredient?.known_risk || [],
      historical_events: historicalEvents,
      risk_score: historicalEvents.length > 0 ? Math.max(...historicalEvents.map((e) => e.risk_score)) : 0,
    }
  })

  const relatedRules = knowledgeRules.filter((kr) =>
    kr.applies_to_ingredient.some((ingId) => product.key_ingredients.includes(ingId))
  )

  const maxScore = Math.max(...ingredientRisks.map((r) => r.risk_score), 0)
  let overallRiskLevel: 'high' | 'medium_high' | 'medium' | 'low' = 'low'
  if (maxScore >= 9) overallRiskLevel = 'high'
  else if (maxScore >= 7) overallRiskLevel = 'medium_high'
  else if (maxScore >= 4) overallRiskLevel = 'medium'

  const suggestedActions = [
    '检查原料供应商资质',
    '增加入库检测频次',
    '更新SOP检查清单',
    ...relatedRules.map((r) => r.recommended_action),
  ]

  return {
    product_id: productId,
    product_name: product.product_name,
    ingredient_risks: ingredientRisks,
    overall_risk_level: overallRiskLevel,
    suggested_actions: [...new Set(suggestedActions)],
    related_knowledge_rules: relatedRules,
  }
}