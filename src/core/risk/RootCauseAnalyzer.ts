/**
 * 候选根因分析器
 * 从风险事件出发，分析可能的根因
 */

import type { RiskEvent } from '../../types/entities'
import type { TraceResult } from '../../types/risk'

export function analyzeRootCause(event: RiskEvent): TraceResult['root_cause_candidates'] {
  const candidates: TraceResult['root_cause_candidates'] = []

  // 基于关联供应商分析
  for (const supplierId of event.linked_supplier) {
    candidates.push({
      entity_id: supplierId,
      entity_type: 'Supplier',
      confidence: 0.8,
      reason: `供应商 ${supplierId} 提供的原料可能存在质量问题`,
    })
  }

  // 基于关联批次分析
  for (const batchId of event.linked_batch) {
    candidates.push({
      entity_id: batchId,
      entity_type: 'Batch',
      confidence: 0.7,
      reason: `批次 ${batchId} 检测异常`,
    })
  }

  return candidates.sort((a, b) => b.confidence - a.confidence)
}