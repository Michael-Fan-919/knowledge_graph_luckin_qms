/**
 * 流水线编排器
 * 串行执行 5 个 Stage，管理状态流转，支持 3 种运行模式
 */

import type { CaseId } from '../../types/entities'
import type { PipelineRunMode, PipelineStageResult, PipelineResult, StageId, ProcessedFeedback, AggregationResult } from '../../types/pipeline'
import { PIPELINE_STAGES } from '../../types/pipeline'
import { executeIngestion } from './stages/IngestionStage'
import { executeCleaning } from './stages/CleaningStage'
import { executeNLP } from './stages/NLPStage'
import { executeAggregation } from './stages/AggregationStage'
import { executeGraphIngestion } from './stages/GraphIngestionStage'

/** 串行执行所有 Stage */
export async function runPipeline(
  caseId: CaseId,
  onStageComplete?: (stageIndex: number, result: PipelineStageResult) => void
): Promise<PipelineResult> {
  const startTime = new Date()
  const stages: PipelineStageResult[] = []

  // Stage 1: 数据采集
  const ingestionResult = await executeIngestion(caseId)
  stages.push(ingestionResult)
  onStageComplete?.(0, ingestionResult)
  const rawData = ingestionResult.data

  // Stage 2: 数据清洗
  const cleaningResult = await executeCleaning(caseId, rawData)
  stages.push(cleaningResult)
  onStageComplete?.(1, cleaningResult)
  const cleanData = cleaningResult.data

  // Stage 3: NLP 处理
  const nlpResult = await executeNLP(caseId, cleanData)
  stages.push(nlpResult)
  onStageComplete?.(2, nlpResult)
  const processedData = nlpResult.data

  // Stage 4: 聚合分析
  const aggregationResult = await executeAggregation(caseId, processedData)
  stages.push(aggregationResult)
  onStageComplete?.(3, aggregationResult)

  // Stage 5: 图谱入库
  const graphResult = await executeGraphIngestion(caseId, aggregationResult.aggregation)
  stages.push(graphResult)
  onStageComplete?.(4, graphResult)

  const endTime = new Date()

  return {
    run_id: `RUN-${startTime.toISOString().replace(/[-:T]/g, '').slice(0, 14)}`,
    case_id: caseId,
    started_at: startTime.toISOString(),
    completed_at: endTime.toISOString(),
    stages,
    generated_events: [],
    total_feedback_processed: rawData.length,
    total_noise_filtered: cleaningResult.noiseCount || 0,
  }
}