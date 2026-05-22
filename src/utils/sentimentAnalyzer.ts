/**
 * 情感分析工具
 * 基于情感词典的简单情感分析
 */

/** 正面情感词 */
const POSITIVE_WORDS = ['好喝', '好', '不错', '推荐', '满意', '喜欢', '新鲜', '好喝', '棒', '赞']

/** 负面情感词 */
const NEGATIVE_WORDS = ['涩', '苦', '难喝', '差', '坏', '恶心', '不新鲜', '发紫', '变色', '絮状物', '沉淀', '分层', '结块', '颗粒', '没熟', '口感差', '巨涩', '发苦']

/** 否定词 */
const NEGATION_WORDS = ['不', '没', '没有', '不是']

/**
 * 分析文本情感
 * @returns 情感类型和分数 (-1.0 ~ 1.0)
 */
export function analyzeSentiment(text: string): {
  sentiment: 'positive' | 'neutral' | 'negative'
  score: number
} {
  let positiveCount = 0
  let negativeCount = 0

  for (const word of POSITIVE_WORDS) {
    if (text.includes(word)) positiveCount++
  }

  for (const word of NEGATIVE_WORDS) {
    if (text.includes(word)) negativeCount++
  }

  // 简单评分
  const total = positiveCount + negativeCount
  if (total === 0) return { sentiment: 'neutral', score: 0 }

  const score = (positiveCount - negativeCount) / total

  if (score > 0.2) return { sentiment: 'positive', score: Math.min(score, 1) }
  if (score < -0.2) return { sentiment: 'negative', score: Math.max(score, -1) }
  return { sentiment: 'neutral', score }
}

/** 批量情感分析统计 */
export function analyzeBatchSentiment(texts: string[]): {
  positive: number
  neutral: number
  negative: number
  avgScore: number
} {
  let positive = 0
  let neutral = 0
  let negative = 0
  let totalScore = 0

  for (const text of texts) {
    const result = analyzeSentiment(text)
    totalScore += result.score
    if (result.sentiment === 'positive') positive++
    else if (result.sentiment === 'negative') negative++
    else neutral++
  }

  return {
    positive,
    neutral,
    negative,
    avgScore: texts.length > 0 ? totalScore / texts.length : 0,
  }
}