/**
 * Stage2: 数据清洗
 * 过滤噪音数据，标准化格式
 */

import type { CaseId } from '../../../types/entities'
import type { PipelineStageResult, RawFeedback } from '../../../types/pipeline'
import { createStageResult } from '../PipelineResult'
import { filterNoise } from '../../../utils/noiseFilter'

export async function executeCleaning(
  caseId: CaseId,
  input: RawFeedback[]
): Promise<PipelineStageResult & { data: RawFeedback[]; noiseCount: number }> {
  const start = Date.now()
  const { clean, noise } = filterNoise(input)
  const duration = Date.now() - start

  return {
    ...createStageResult(
      'cleaning',
      'completed',
      input.length,
      clean.length,
      {
        noise_types: noise.map((n) => ({ type: n.result.noiseType, reason: n.result.reason })),
      },
      duration,
      noise.length
    ),
    data: clean,
    noiseCount: noise.length,
  }
}