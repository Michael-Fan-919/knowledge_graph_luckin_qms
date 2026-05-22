/**
 * Stage1: 数据采集
 * 从 CSV 文件读取原始反馈数据
 */

import type { CaseId } from '../../../types/entities'
import type { PipelineStageResult, RawFeedback } from '../../../types/pipeline'
import { createStageResult } from '../PipelineResult'
import { parseCSV } from '../../../utils/csvParser'

import coconutCsv from '../../../data/raw_feedback/case1_coconut.csv?raw'
import persimmonCsv from '../../../data/raw_feedback/case2_persimmon.csv?raw'
import appleMilkCsv from '../../../data/raw_feedback/case3_apple_milk.csv?raw'

const CSV_MAP: Record<string, string> = {
  coconut: coconutCsv,
  persimmon: persimmonCsv,
  apple_milk: appleMilkCsv,
}

export async function executeIngestion(caseId: CaseId): Promise<PipelineStageResult & { data: RawFeedback[] }> {
  const start = Date.now()
  const csvText = CSV_MAP[caseId] || ''
  const records = parseCSV(csvText)
  const duration = Date.now() - start

  return {
    ...createStageResult('ingestion', 'completed', records.length, records.length, {
      source: `case_${caseId}.csv`,
      total_rows: records.length,
      channels: {
        app_review: records.filter((r) => r.channel === 'app_review').length,
        customer_service: records.filter((r) => r.channel === 'customer_service').length,
        social_media: records.filter((r) => r.channel === 'social_media').length,
      },
    }, duration),
    data: records,
  }
}