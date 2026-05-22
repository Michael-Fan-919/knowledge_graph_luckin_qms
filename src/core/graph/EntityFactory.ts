/**
 * 实体节点工厂
 * 统一 ID 生成、默认值填充
 */

import type { GraphNode } from './GraphBuilder'
import { NODE_TYPE_COLORS, getNodeSize } from '../../utils/graphUtils'

/**
 * 创建实体节点
 */
export function createEntityNode(
  id: string,
  label: string,
  entityType: string,
  data?: Record<string, any>,
  colorOverride?: string
): GraphNode {
  const color = colorOverride || NODE_TYPE_COLORS[entityType] || '#8c8c8c'
  const size = getNodeSize(entityType)

  return {
    id,
    label,
    entityType,
    style: {
      fill: color,
      stroke: '#fff',
      lineWidth: 2,
      size,
    },
    data,
  }
}

/**
 * 生成标准化实体 ID
 */
export function generateEntityId(prefix: string, ...parts: string[]): string {
  return [prefix, ...parts].join('-')
}