/**
 * 流水线结果类型 + 工厂函数
 */

import type { PipelineResult, PipelineStageResult, StageId, StageStatus } from '../../types/pipeline'

/** 创建阶段结果 */
export function createStageResult(
  stage: StageId,
  status: StageStatus,
  inputCount: number,
  outputCount: number,
  details: Record<string, any> = {},
  durationMs: number = 0,
  noiseFilteredCount?: number
): PipelineStageResult {
  return {
    stage,
    status,
    input_count: inputCount,
    output_count: outputCount,
    details,
    duration_ms: durationMs,
    noise_filtered_count: noiseFilteredCount,
  }
}

/** 创建完整 Pipeline 结果 */
export function createPipelineResult(
  caseId: string,
  stages: PipelineStageResult[],
  startedAt: string,
  completedAt: string
): PipelineResult {
  const totalFeedback = stages[0]?.output_count || 0
  const totalNoise = stages[1]?.noise_filtered_count || 0

  return {
    run_id: `RUN-${startedAt.replace(/[-:T]/g, '').slice(0, 14)}`,
    case_id: caseId,
    started_at: startedAt,
    completed_at: completedAt,
    stages,
    generated_events: [],
    total_feedback_processed: totalFeedback,
    total_noise_filtered: totalNoise,
  }
}