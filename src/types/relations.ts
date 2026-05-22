/** 关系类型枚举 */
export enum RelationType {
  // 产品链路
  USES = 'USES',
  SUPPLIED_BY = 'SUPPLIED_BY',
  PROVIDES = 'PROVIDES',
  DELIVERED_TO = 'DELIVERED_TO',
  USED_BY = 'USED_BY',

  // 风险链路
  RELATED_TO = 'RELATED_TO',
  LINKED_TO = 'LINKED_TO',
  SUSPECTS = 'SUSPECTS',
  SUPPORTED_BY = 'SUPPORTED_BY',
  CONTROLLED_BY = 'CONTROLLED_BY',

  // 知识链路
  APPLIES_TO = 'APPLIES_TO',
  WARNS_ABOUT = 'WARNS_ABOUT',

  // 责任链路
  ASSIGNED_TO = 'ASSIGNED_TO',
  RESPONSIBLE_FOR = 'RESPONSIBLE_FOR',
}

/** 关系边数据结构（G6 EdgeData 兼容） */
export interface RelationEdge {
  id: string
  source: string
  target: string
  relationType: RelationType
  label: string
  style?: Record<string, any>
}

/** 关系标签映射 */
export const RELATION_LABELS: Record<RelationType, string> = {
  [RelationType.USES]: '使用原料',
  [RelationType.SUPPLIED_BY]: '供应商',
  [RelationType.PROVIDES]: '提供批次',
  [RelationType.DELIVERED_TO]: '配送至',
  [RelationType.USED_BY]: '使用门店',
  [RelationType.RELATED_TO]: '问题类型',
  [RelationType.LINKED_TO]: '关联批次',
  [RelationType.SUSPECTS]: '疑似供应商',
  [RelationType.SUPPORTED_BY]: '检测支撑',
  [RelationType.CONTROLLED_BY]: '管控措施',
  [RelationType.APPLIES_TO]: '适用原料',
  [RelationType.WARNS_ABOUT]: '预警标签',
  [RelationType.ASSIGNED_TO]: '分配给',
  [RelationType.RESPONSIBLE_FOR]: '负责事件',
}