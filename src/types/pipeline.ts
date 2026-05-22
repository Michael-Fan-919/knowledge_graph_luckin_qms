import type { RiskEvent } from './entities'

/** 原始反馈记录 */
export interface RawFeedback {
  feedback_id: string
  timestamp: string
  channel: 'app_review' | 'customer_service' | 'social_media'
  product_name: string
  store_id: string
  city: string
  content: string
  rating: number
}

/** Pipeline 阶段标识 */
export type StageId = 'ingestion' | 'cleaning' | 'nlp' | 'aggregation' | 'graph_ingestion'

/** Pipeline 阶段状态 */
export type StageStatus = 'pending' | 'running' | 'completed' | 'error'

/** Pipeline 运行模式 */
export type PipelineRunMode = 'auto' | 'step' | 'realtime'

/** Pipeline 阶段结果 */
export interface PipelineStageResult {
  stage: StageId
  status: StageStatus
  input_count: number
  output_count: number
  details: Record<string, any>
  duration_ms: number
  noise_filtered_count?: number
}

/** Pipeline 完整结果 */
export interface PipelineResult {
  run_id: string
  case_id: string
  started_at: string
  completed_at: string
  stages: PipelineStageResult[]
  generated_events: RiskEvent[]
  total_feedback_processed: number
  total_noise_filtered: number
}

/** NLP 处理后的反馈记录 */
export interface ProcessedFeedback extends RawFeedback {
  keywords: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  sentiment_score: number
  issue_type_guess: string
  risk_tags: string[]
  is_noise: boolean
}

/** 聚合结果 */
export interface AggregationResult {
  product_id: string
  product_name: string
  total_feedback: number
  negative_ratio: number
  top_keywords: { word: string; count: number }[]
  affected_stores: string[]
  affected_batches: string[]
  suggested_risk_level: 'high' | 'medium_high' | 'medium' | 'low'
  risk_score: number
  risk_score_breakdown: {
    negative_ratio_score: number
    store_count_score: number
    severity_score: number
  }
  should_generate_event: boolean
}

/** Pipeline 阶段配置 */
export interface StageConfig {
  id: StageId
  label: string
  description: string
  icon: string
}

/** 阶段配置列表 */
export const PIPELINE_STAGES: StageConfig[] = [
  { id: 'ingestion', label: '数据采集', description: '从CSV文件读取原始反馈数据', icon: 'ImportOutlined' },
  { id: 'cleaning', label: '数据清洗', description: '过滤噪音数据，标准化格式', icon: 'ClearOutlined' },
  { id: 'nlp', label: 'NLP处理', description: '关键词提取、情感分析、问题分类', icon: 'FileSearchOutlined' },
  { id: 'aggregation', label: '聚合分析', description: '多维度聚合，风险评分计算', icon: 'BarChartOutlined' },
  { id: 'graph_ingestion', label: '图谱入库', description: '生成风险事件，构建知识图谱', icon: 'ApartmentOutlined' },
]