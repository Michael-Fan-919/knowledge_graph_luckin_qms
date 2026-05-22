/**
 * 风险等级矩阵计算
 * 三维评分矩阵：负面占比(1-4) + 门店数(1-4) + 严重性(1-4) = 综合评分(3-12)
 */

import type { RiskLevel } from '../../types/risk'
import { RISK_LEVEL_CONFIG } from '../../types/risk'

/** 评分细分 */
export interface RiskScoreBreakdown {
  negative_ratio_score: number  // 1-4
  store_count_score: number     // 1-4
  severity_score: number        // 1-4
}

/**
 * 计算风险评分
 * @param negativeRatio 负面反馈占比 (0.0 ~ 1.0)
 * @param storeCount 受影响门店数
 * @param severityKeywords 严重性关键词数量
 */
export function calculateRiskScore(
  negativeRatio: number,
  storeCount: number,
  severityKeywords: number
): RiskScoreBreakdown {
  // 负面占比评分 (1-4)
  let negativeRatioScore = 1
  if (negativeRatio >= 0.8) negativeRatioScore = 4
  else if (negativeRatio >= 0.6) negativeRatioScore = 3
  else if (negativeRatio >= 0.3) negativeRatioScore = 2

  // 门店数评分 (1-4)
  let storeCountScore = 1
  if (storeCount >= 10) storeCountScore = 4
  else if (storeCount >= 6) storeCountScore = 3
  else if (storeCount >= 3) storeCountScore = 2

  // 严重性评分 (1-4)
  let severityScore = 1
  if (severityKeywords >= 8) severityScore = 4
  else if (severityKeywords >= 5) severityScore = 3
  else if (severityKeywords >= 3) severityScore = 2

  return {
    negative_ratio_score: negativeRatioScore,
    store_count_score: storeCountScore,
    severity_score: severityScore,
  }
}

/**
 * 根据总分获取风险等级
 */
export function scoreToLevel(totalScore: number): RiskLevel {
  if (totalScore >= 9) return 'high'
  if (totalScore >= 7) return 'medium_high'
  if (totalScore >= 4) return 'medium'
  return 'low'
}

/**
 * 获取风险等级配置
 */
export function getRiskConfig(level: RiskLevel) {
  return RISK_LEVEL_CONFIG[level]
}