/**
 * 噪音过滤工具
 * 识别和过滤噪音反馈数据
 */

import type { RawFeedback } from '../types/pipeline'

/** 噪音类型 */
export type NoiseType = 'irrelevant' | 'too_short' | 'duplicate' | 'typo' | 'emoji' | 'mixed_lang'

/** 噪音检测结果 */
export interface NoiseResult {
  isNoise: boolean
  noiseType?: NoiseType
  reason?: string
}

/** 无关反馈关键词 */
const IRRELEVANT_KEYWORDS = ['杯子好看', '包装精美', '店员态度', '给个好评', '环境不错', '排队', '位置方便']

/** 过短内容阈值 */
const MIN_CONTENT_LENGTH = 3

/**
 * 检测单条反馈是否为噪音
 */
export function detectNoise(feedback: RawFeedback): NoiseResult {
  const content = feedback.content.trim()

  // 检查过短内容
  if (content.length <= MIN_CONTENT_LENGTH) {
    const shortNoiseWords = ['不好', '一般', '难喝', '还行']
    if (shortNoiseWords.some((w) => content.includes(w))) {
      return { isNoise: true, noiseType: 'too_short', reason: `内容过短: "${content}"` }
    }
  }

  // 检查无关反馈
  if (IRRELEVANT_KEYWORDS.some((kw) => content.includes(kw))) {
    return { isNoise: true, noiseType: 'irrelevant', reason: `无关反馈: "${content}"` }
  }

  // 检查表情/颜文字
  const emojiPattern = /^[\s:;=\-\(\)\[\]T_T>_<|\/\\.,!?，。！？]+$/
  if (emojiPattern.test(content) || content.length <= 3) {
    return { isNoise: true, noiseType: 'emoji', reason: `表情/颜文字: "${content}"` }
  }

  // 检查混合语言（简单检测：同时包含中文和英文单词）
  const hasChinese = /[\u4e00-\u9fff]/.test(content)
  const hasEnglish = /[a-zA-Z]{3,}/.test(content)
  if (hasChinese && hasEnglish) {
    return { isNoise: true, noiseType: 'mixed_lang', reason: `混合语言: "${content}"` }
  }

  return { isNoise: false }
}

/**
 * 批量过滤噪音数据
 */
export function filterNoise(feedbacks: RawFeedback[]): {
  clean: RawFeedback[]
  noise: { feedback: RawFeedback; result: NoiseResult }[]
} {
  const clean: RawFeedback[] = []
  const noise: { feedback: RawFeedback; result: NoiseResult }[] = []

  // 检测重复提交
  const seenIds = new Set<string>()

  for (const feedback of feedbacks) {
    // 重复检测
    if (seenIds.has(feedback.feedback_id)) {
      noise.push({
        feedback,
        result: { isNoise: true, noiseType: 'duplicate', reason: `重复提交: ${feedback.feedback_id}` },
      })
      continue
    }
    seenIds.add(feedback.feedback_id)

    const result = detectNoise(feedback)
    if (result.isNoise) {
      noise.push({ feedback, result })
    } else {
      clean.push(feedback)
    }
  }

  return { clean, noise }
}