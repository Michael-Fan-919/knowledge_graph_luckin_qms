/**
 * Stage3: NLP 处理
 * 关键词提取、情感分析、问题分类
 */

import type { CaseId } from '../../../types/entities'
import type { PipelineStageResult, RawFeedback, ProcessedFeedback } from '../../../types/pipeline'
import { createStageResult } from '../PipelineResult'
import { extractKeywords } from '../../../utils/keywordExtractor'
import { analyzeSentiment } from '../../../utils/sentimentAnalyzer'

export async function executeNLP(
  caseId: CaseId,
  input: RawFeedback[]
): Promise<PipelineStageResult & { data: ProcessedFeedback[] }> {
  const start = Date.now()

  const processed: ProcessedFeedback[] = input.map((feedback) => {
    const keywords = extractKeywords(feedback.content)
    const { sentiment, score } = analyzeSentiment(feedback.content)

    return {
      ...feedback,
      keywords,
      sentiment,
      sentiment_score: score,
      issue_type_guess: guessIssueType(keywords),
      risk_tags: mapRiskTags(keywords),
      is_noise: false,
    }
  })

  const duration = Date.now() - start
  const allKeywords = processed.flatMap((p) => p.keywords)
  const keywordCounts: Record<string, number> = {}
  allKeywords.forEach((kw) => { keywordCounts[kw] = (keywordCounts[kw] || 0) + 1 })

  return {
    ...createStageResult('nlp', 'completed', input.length, processed.length, {
      keyword_counts: keywordCounts,
      sentiment_distribution: {
        positive: processed.filter((p) => p.sentiment === 'positive').length,
        neutral: processed.filter((p) => p.sentiment === 'neutral').length,
        negative: processed.filter((p) => p.sentiment === 'negative').length,
      },
      top_keywords: Object.entries(keywordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([word, count]) => ({ word, count })),
    }, duration),
    data: processed,
  }
}

/** 根据关键词猜测问题类型（12种） */
function guessIssueType(keywords: string[]): string {
  const tasteKeywords = ['涩', '苦', '没熟', '口感差', '苦涩', '像中药', '茶味太重']
  const colorKeywords = ['发紫', '变色', '颜色不正常', '氧化', '褐变', '发黑']
  const textureKeywords = ['絮状物', '沉淀', '分层', '结块', '颗粒', '豆腐渣']
  const cognitiveKeywords = ['像坏了', '是不是坏了', '不敢喝', '虫子', '异物', '黑色的东西']
  const foodSafetyKeywords = ['拉肚子', '肚子疼', '呕吐', '过敏', '痒', '红肿', '呼吸困难', '哈喇味']
  const toppingKeywords = ['太硬', '硬芯', '不Q弹', '粘连', '太软', '太烂', '像塑料']
  const foamKeywords = ['塌了', '融化', '消泡', '奶盖没了', '流下来了']
  const tasteBalanceKeywords = ['太甜', '不够甜', '没味道', '甜死了', '像白水', '太淡']
  const tempKeywords = ['不够冰', '不够热', '温的', '不凉', '冰化了']
  const pesticideKeywords = ['化学味', '味道不对', '头晕', '恶心']
  const microKeywords = ['变质', '酸了', '臭了', '发霉', '长毛']
  const coffeeKeywords = ['油脂', '分离', '没有咖啡味']

  if (keywords.some((kw) => foodSafetyKeywords.includes(kw))) return 'IT06'
  if (keywords.some((kw) => microKeywords.includes(kw))) return 'IT06'
  if (keywords.some((kw) => pesticideKeywords.includes(kw))) return 'IT08'
  if (keywords.some((kw) => tasteKeywords.includes(kw))) return 'IT01'
  if (keywords.some((kw) => colorKeywords.includes(kw))) return 'IT02'
  if (keywords.some((kw) => textureKeywords.includes(kw))) return 'IT03'
  if (keywords.some((kw) => foamKeywords.includes(kw))) return 'IT09'
  if (keywords.some((kw) => toppingKeywords.includes(kw))) return 'IT10'
  if (keywords.some((kw) => tasteBalanceKeywords.includes(kw))) return 'IT11'
  if (keywords.some((kw) => tempKeywords.includes(kw))) return 'IT12'
  if (keywords.some((kw) => cognitiveKeywords.includes(kw))) return 'IT05'
  if (keywords.some((kw) => coffeeKeywords.includes(kw))) return 'IT04'
  return 'IT04'
}

/** 根据关键词映射风险标签（18种） */
function mapRiskTags(keywords: string[]): string[] {
  const tags: string[] = []
  const tagMap: Record<string, string[]> = {
    RT01: ['涩', '没熟', '成熟度', '发黑', '太软'],
    RT02: ['发紫', '变色', '氧化', '颜色不正常', '油脂', '分离'],
    RT03: ['絮状物', '沉淀', '结块'],
    RT04: ['拉肚子', '变质', '酸了'],
    RT05: ['像坏了', '是不是坏了', '不敢喝', '虫子', '异物', '黑色的东西'],
    RT06: ['分层', '颗粒', '絮状物'],
    RT07: ['批次'],
    RT08: ['苦涩', '像中药', '茶味太重', '苦'],
    RT09: ['化学味', '味道不对', '头晕', '恶心'],
    RT10: ['拉肚子', '肚子疼', '呕吐', '变质', '发霉', '长毛'],
    RT11: ['过敏', '痒', '红肿', '呼吸困难', '花生'],
    RT12: ['塌了', '融化', '消泡', '奶盖没了'],
    RT13: ['太硬', '硬芯', '不Q弹', '粘连', '太软', '太烂', '像塑料'],
    RT14: ['异物', '虫子', '脏东西'],
    RT15: ['太甜', '不够甜', '没味道', '甜死了'],
    RT16: ['不够冰', '不够热', '温的', '冰化了'],
    RT17: ['哈喇味', '苦味', '油脂', '分离'],
    RT18: ['发霉', '长毛', '哈喇味'],
  }

  for (const [tagId, tagKeywords] of Object.entries(tagMap)) {
    if (keywords.some((kw) => tagKeywords.includes(kw))) {
      tags.push(tagId)
    }
  }
  return [...new Set(tags)]
}