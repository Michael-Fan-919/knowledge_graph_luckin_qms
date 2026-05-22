/**
 * 知识沉淀提取器
 * 从 RiskEvent 提取知识规则模板
 */

import type { KnowledgeRule } from '../../types/entities'
import knowledgeRulesData from '../../data/knowledge_rules.json'
import riskEventsData from '../../data/risk_events.json'
import type { RiskEvent } from '../../types/entities'

const knowledgeRules = knowledgeRulesData as unknown as KnowledgeRule[]
const riskEvents = riskEventsData as unknown as RiskEvent[]

/**
 * 从风险事件提取知识规则
 */
export function extractKnowledgeRule(eventId: string): KnowledgeRule | null {
  // 检查是否已有规则
  const existing = knowledgeRules.find((kr) => kr.source_event_id === eventId)
  if (existing) return existing

  const event = riskEvents.find((e) => e.event_id === eventId)
  if (!event) return null

  // 生成新规则模板
  return {
    rule_id: `KR-${event.event_id.replace('RE-', '')}`,
    rule_name: `${event.event_name}预警规则`,
    trigger_condition: `出现'${event.feedback_keywords.join('/')}'相关反馈 + 负面率>30%`,
    recommended_action: event.suspected_cause,
    source_event_id: eventId,
    applies_to_ingredient: [],
    warns_about_tags: [],
  }
}

/**
 * 获取所有知识规则
 */
export function getAllKnowledgeRules(): KnowledgeRule[] {
  return knowledgeRules as unknown as KnowledgeRule[]
}