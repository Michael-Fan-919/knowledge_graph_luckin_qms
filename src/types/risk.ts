import type { RiskEvent, KnowledgeRule } from './entities'
import type { RelationType } from './relations'

/** 风险等级定义 */
export type RiskLevel = 'high' | 'medium_high' | 'medium' | 'low'

/** 风险等级配置 */
export const RISK_LEVEL_CONFIG: Record<
  RiskLevel,
  { label: string; color: string; scoreRange: [number, number] }
> = {
  high: { label: '高风险', color: '#F5222D', scoreRange: [9, 12] },
  medium_high: { label: '中高风险', color: '#FA8C16', scoreRange: [7, 8] },
  medium: { label: '中风险', color: '#FADB14', scoreRange: [4, 6] },
  low: { label: '低风险', color: '#52C41A', scoreRange: [1, 3] },
}

/** 风险扫描结果 */
export interface RiskScanResult {
  product_id: string
  product_name: string
  ingredient_risks: {
    ingredient_id: string
    ingredient_name: string
    known_risks: string[]
    historical_events: RiskEvent[]
    risk_score: number
  }[]
  overall_risk_level: RiskLevel
  suggested_actions: string[]
  related_knowledge_rules: KnowledgeRule[]
}

/** 追溯路径节点 */
export interface TraceNode {
  id: string
  entityType: string
  label: string
  properties: Record<string, any>
  depth: number
}

/** 追溯路径边 */
export interface TraceEdge {
  source: string
  target: string
  relationType: RelationType
  label: string
}

/** 追溯结果 */
export interface TraceResult {
  event_id: string
  nodes: TraceNode[]
  edges: TraceEdge[]
  root_cause_candidates: {
    entity_id: string
    entity_type: string
    confidence: number
    reason: string
  }[]
}