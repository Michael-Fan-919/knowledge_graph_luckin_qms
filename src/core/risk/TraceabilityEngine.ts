/**
 * 全链路追溯引擎
 * 从 RiskEvent 出发，沿关系链遍历，构建追溯路径
 */

import type { TraceResult, TraceNode, TraceEdge } from '../../types/risk'
import type { RelationType } from '../../types/relations'
import { RELATION_LABELS } from '../../types/relations'
import { buildGraph } from '../graph/GraphBuilder'
import type { CaseId } from '../../types/entities'

/**
 * 从风险事件出发进行全链路追溯
 */
export function traceEvent(caseId: CaseId, eventId: string): TraceResult {
  const graphData = buildGraph(caseId)
  const nodes: TraceNode[] = []
  const edges: TraceEdge[] = []
  const visited = new Set<string>()

  // BFS 遍历
  const queue: { id: string; depth: number }[] = [{ id: eventId, depth: 0 }]

  while (queue.length > 0) {
    const current = queue.shift()!
    if (visited.has(current.id)) continue
    visited.add(current.id)

    const graphNode = graphData.nodes.find((n) => n.id === current.id)
    if (graphNode) {
      nodes.push({
        id: graphNode.id,
        entityType: graphNode.entityType,
        label: graphNode.label,
        properties: graphNode.data || {},
        depth: current.depth,
      })

      // 找到关联边
      const relatedEdges = graphData.edges.filter(
        (e) => e.source === current.id || e.target === current.id
      )

      for (const edge of relatedEdges) {
        const neighborId = edge.source === current.id ? edge.target : edge.source
        edges.push({
          source: edge.source,
          target: edge.target,
          relationType: edge.relationType,
          label: RELATION_LABELS[edge.relationType] || edge.label,
        })

        if (!visited.has(neighborId) && current.depth < 5) {
          queue.push({ id: neighborId, depth: current.depth + 1 })
        }
      }
    }
  }

  // 分析根因候选
  const rootCauseCandidates = nodes
    .filter((n) => n.entityType === 'Supplier' || n.entityType === 'Batch')
    .map((n) => ({
      entity_id: n.id,
      entity_type: n.entityType,
      confidence: n.entityType === 'Supplier' ? 0.8 : 0.6,
      reason: n.entityType === 'Supplier'
        ? `供应商 ${n.label} 可能存在质量问题`
        : `批次 ${n.label} 检测存在异常`,
    }))

  return {
    event_id: eventId,
    nodes,
    edges,
    root_cause_candidates: rootCauseCandidates.sort((a, b) => b.confidence - a.confidence),
  }
}