/**
 * 图谱布局/样式/交互工具函数
 */

import { RISK_LEVEL_CONFIG } from '../types/risk'
import type { RiskLevel } from '../types/risk'

/** 节点类型对应的颜色 */
export const NODE_TYPE_COLORS: Record<string, string> = {
  Product: '#1890ff',
  Ingredient: '#52c41a',
  Supplier: '#722ed1',
  Batch: '#13c2c2',
  Store: '#fa8c16',
  Warehouse: '#8c8c8c',
  RiskEvent: '#f5222d',
  IssueType: '#eb2f96',
  Inspection: '#2f54eb',
  ControlAction: '#faad14',
  KnowledgeRule: '#eb2f96',
  Stakeholder: '#13c2c2',
  RiskTag: '#a0d911',
  SOP: '#597ef7',
}

/** 根据风险等级获取颜色 */
export function getRiskColor(level: RiskLevel): string {
  return RISK_LEVEL_CONFIG[level]?.color || '#8c8c8c'
}

/** 根据节点类型获取大小 */
export function getNodeSize(entityType: string): number {
  const sizeMap: Record<string, number> = {
    Product: 40,
    RiskEvent: 45,
    Ingredient: 30,
    Supplier: 30,
    Batch: 25,
    Store: 25,
    Warehouse: 25,
    KnowledgeRule: 30,
    IssueType: 28,
    Inspection: 22,
    ControlAction: 28,
    Stakeholder: 28,
    RiskTag: 22,
    SOP: 25,
  }
  return sizeMap[entityType] || 25
}

/** 根据节点类型获取形状 */
export function getNodeShape(entityType: string): string {
  if (entityType === 'RiskEvent') return 'diamond'
  if (entityType === 'Product') return 'hexagon'
  return 'circle'
}

/** 获取节点标签截断文本 */
export function truncateLabel(label: string, maxLen: number = 8): string {
  if (label.length <= maxLen) return label
  return label.slice(0, maxLen) + '...'
}