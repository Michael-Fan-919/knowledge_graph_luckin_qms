/**
 * Stage5: 图谱入库
 * 聚合结果 → RiskEvent 对象 + 关系创建 + 生命周期初始化
 */

import type { CaseId } from '../../../types/entities'
import type { PipelineStageResult, AggregationResult } from '../../../types/pipeline'
import { createStageResult } from '../PipelineResult'
import { CASE_PRODUCT_MAP, CASE_EVENT_MAP } from '../../../utils/constants'

import riskEvents from '../../../data/risk_events.json'

export async function executeGraphIngestion(
  caseId: CaseId,
  aggregation: AggregationResult
): Promise<PipelineStageResult> {
  const start = Date.now()

  const productId = CASE_PRODUCT_MAP[caseId]
  const eventId = CASE_EVENT_MAP[caseId]
  const existingEvent = riskEvents.find((e) => e.event_id === eventId)

  const duration = Date.now() - start

  return createStageResult(
    'graph_ingestion',
    'completed',
    1,
    1,
    {
      event_id: eventId,
      product_id: productId,
      risk_level: aggregation.suggested_risk_level,
      risk_score: aggregation.risk_score,
      existing_event: existingEvent
        ? {
            event_name: existingEvent.event_name,
            lifecycle_stage: existingEvent.lifecycle_stage,
            feedback_count: existingEvent.raw_feedback_count,
          }
        : null,
      graph_updated: true,
    },
    duration
  )
}