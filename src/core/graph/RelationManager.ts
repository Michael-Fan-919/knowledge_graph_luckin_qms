/**
 * 关系边工厂 + 关系查询工具
 */

import type { RelationType } from '../../types/relations'
import { RELATION_LABELS } from '../../types/relations'
import type { GraphEdge } from './GraphBuilder'

/**
 * 创建关系边
 */
export function createRelationEdge(
  source: string,
  target: string,
  relationType: RelationType,
  style?: Record<string, any>
): GraphEdge {
  const id = `${source}-${relationType}-${target}`
  return {
    id,
    source,
    target,
    label: RELATION_LABELS[relationType] || relationType,
    relationType,
    style,
  }
}

/**
 * 根据实体 ID 查找关联边
 */
export function findRelatedEdges(edges: GraphEdge[], entityId: string): GraphEdge[] {
  return edges.filter((e) => e.source === entityId || e.target === entityId)
}

/**
 * 根据实体 ID 查找关联实体 ID
 */
export function findRelatedEntityIds(edges: GraphEdge[], entityId: string): string[] {
  const related: string[] = []
  for (const edge of edges) {
    if (edge.source === entityId) related.push(edge.target)
    if (edge.target === entityId) related.push(edge.source)
  }
  return [...new Set(related)]
}