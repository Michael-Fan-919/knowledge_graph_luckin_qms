/**
 * Stage4: 聚合分析
 * 按产品/门店/供应商维度聚合，调用 RiskLevelMatrix，判断是否生成事件
 */

import type { CaseId } from '../../../types/entities'
import type { PipelineStageResult, ProcessedFeedback, AggregationResult } from '../../../types/pipeline'
import { createStageResult } from '../PipelineResult'
import { calculateRiskScore, scoreToLevel } from '../../risk/RiskLevelMatrix'
import { CASE_PRODUCT_MAP } from '../../../utils/constants'

import products from '../../../data/products.json'
import stores from '../../../data/stores.json'
import batches from '../../../data/batches.json'

export async function executeAggregation(
  caseId: CaseId,
  input: ProcessedFeedback[]
): Promise<PipelineStageResult & { aggregation: AggregationResult }> {
  const start = Date.now()

  const productId = CASE_PRODUCT_MAP[caseId]
  const product = products.find((p) => p.product_id === productId)
  const productName = product?.product_name || ''

  // 按门店统计
  const storeIds = [...new Set(input.map((f) => f.store_id))]
  const affectedStores = storeIds

  // 关联批次
  const storeBatchIds = stores
    .filter((s) => storeIds.includes(s.store_id))
    .map((s) => s.batch_id)
  const affectedBatches = [...new Set(storeBatchIds)]

  // 负面率
  const negativeCount = input.filter((f) => {
    const keywords = (f as ProcessedFeedback).keywords || []
    const sentiment = (f as ProcessedFeedback).sentiment
    return sentiment === 'negative' || keywords.length > 0
  }).length
  const negativeRatio = input.length > 0 ? negativeCount / input.length : 0

  // 关键词统计
  const keywordMap: Record<string, number> = {}
  input.forEach((f) => {
    const pf = f as ProcessedFeedback
    if (pf.keywords) {
      pf.keywords.forEach((kw: string) => { keywordMap[kw] = (keywordMap[kw] || 0) + 1 })
    }
  })
  const topKeywords = Object.entries(keywordMap)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)

  // 风险评分
  const breakdown = calculateRiskScore(negativeRatio, affectedStores.length, topKeywords.length)
  const totalScore = breakdown.negative_ratio_score + breakdown.store_count_score + breakdown.severity_score
  const riskLevel = scoreToLevel(totalScore)

  const aggregation: AggregationResult = {
    product_id: productId,
    product_name: productName,
    total_feedback: input.length,
    negative_ratio: negativeRatio,
    top_keywords: topKeywords.slice(0, 10),
    affected_stores: affectedStores,
    affected_batches: affectedBatches,
    suggested_risk_level: riskLevel,
    risk_score: totalScore,
    risk_score_breakdown: breakdown,
    should_generate_event: totalScore >= 4,
  }

  const duration = Date.now() - start

  return {
    ...createStageResult('aggregation', 'completed', input.length, 1, {
      aggregation,
      risk_level: riskLevel,
      risk_score: totalScore,
    }, duration),
    aggregation,
  }
}