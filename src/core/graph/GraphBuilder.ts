/**
 * JSON → G6 GraphData 转换器
 * 将各类实体和关系数据转换为 G6 可渲染的节点和边
 */

import type { CaseId } from '../../types/entities'
import type { RelationEdge, RelationType } from '../../types/relations'
import { RELATION_LABELS } from '../../types/relations'
import { NODE_TYPE_COLORS, getNodeSize } from '../../utils/graphUtils'
import { CASE_PRODUCT_MAP, CASE_EVENT_MAP } from '../../utils/constants'

// Import JSON data
import products from '../../data/products.json'
import ingredients from '../../data/ingredients.json'
import suppliers from '../../data/suppliers.json'
import batches from '../../data/batches.json'
import stores from '../../data/stores.json'
import warehouses from '../../data/warehouses.json'
import inspections from '../../data/inspections.json'
import riskEvents from '../../data/risk_events.json'
import issueTypes from '../../data/issue_types.json'
import riskTags from '../../data/risk_tags.json'
import controlActions from '../../data/control_actions.json'
import knowledgeRules from '../../data/knowledge_rules.json'
import sops from '../../data/sops.json'
import stakeholders from '../../data/stakeholders.json'

/** G6 节点数据 */
export interface GraphNode {
  id: string
  label: string
  entityType: string
  style?: Record<string, any>
  data?: Record<string, any>
}

/** G6 边数据 */
export interface GraphEdge {
  id: string
  source: string
  target: string
  label: string
  relationType: RelationType
  style?: Record<string, any>
}

/** G6 GraphData */
export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

/**
 * 构建指定案例的知识图谱数据
 */
export function buildGraph(caseId: CaseId): GraphData {
  const productId = CASE_PRODUCT_MAP[caseId]
  const eventId = CASE_EVENT_MAP[caseId]
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  const nodeIds = new Set<string>()

  // Helper: 添加节点（去重）
  const addNode = (id: string, label: string, entityType: string, data?: Record<string, any>) => {
    if (nodeIds.has(id)) return
    nodeIds.add(id)
    const color = NODE_TYPE_COLORS[entityType] || '#8c8c8c'
    const size = getNodeSize(entityType)
    nodes.push({
      id,
      label,
      entityType,
      style: {
        fill: entityType === 'RiskEvent' ? (data?.risk_level === 'high' ? '#F5222D' : data?.risk_level === 'medium_high' ? '#FA8C16' : data?.risk_level === 'medium' ? '#FADB14' : '#52C41A') : color,
        stroke: '#fff',
        lineWidth: 2,
        size,
      },
      data,
    })
  }

  // Helper: 添加边
  const addEdge = (source: string, target: string, relationType: RelationType) => {
    const edgeId = `${source}-${relationType}-${target}`
    if (edges.some((e) => e.id === edgeId)) return
    edges.push({
      id: edgeId,
      source,
      target,
      label: RELATION_LABELS[relationType] || relationType,
      relationType,
    })
  }

  // --- 产品节点 ---
  const product = products.find((p) => p.product_id === productId)
  if (product) {
    addNode(product.product_id, product.product_name, 'Product', product as any)

    // --- 原料节点 ---
    for (const ingId of product.key_ingredients) {
      const ingredient = ingredients.find((i) => i.ingredient_id === ingId)
      if (ingredient) {
        addNode(ingredient.ingredient_id, ingredient.ingredient_name, 'Ingredient', ingredient as any)
        addEdge(product.product_id, ingredient.ingredient_id, 'USES' as RelationType)

        // --- 供应商节点 ---
        const relatedSuppliers = suppliers.filter((s) => s.ingredient_id === ingId)
        for (const supplier of relatedSuppliers) {
          addNode(supplier.supplier_id, supplier.supplier_name, 'Supplier', supplier as any)
          addEdge(ingredient.ingredient_id, supplier.supplier_id, 'SUPPLIED_BY' as RelationType)

          // --- 批次节点 ---
          const relatedBatches = batches.filter((b) => b.supplier_id === supplier.supplier_id && b.ingredient_id === ingId)
          for (const batch of relatedBatches) {
            addNode(batch.batch_id, batch.batch_id, 'Batch', batch as any)
            addEdge(supplier.supplier_id, batch.batch_id, 'PROVIDES' as RelationType)

            // --- 门店节点 ---
            const relatedStores = stores.filter((s) => s.batch_id === batch.batch_id)
            for (const store of relatedStores) {
              addNode(store.store_id, store.store_name, 'Store', store as any)
              addEdge(batch.batch_id, store.store_id, 'USED_BY' as RelationType)

              // --- 仓库节点 ---
              const warehouse = warehouses.find((w) => w.warehouse_id === store.warehouse_id)
              if (warehouse) {
                addNode(warehouse.warehouse_id, warehouse.warehouse_name, 'Warehouse', warehouse as any)
                addEdge(batch.batch_id, warehouse.warehouse_id, 'DELIVERED_TO' as RelationType)
              }
            }

            // --- 检测记录 ---
            const relatedInspections = inspections.filter((ins) => ins.batch_id === batch.batch_id)
            for (const ins of relatedInspections) {
              addNode(ins.inspection_id, ins.inspection_item, 'Inspection', ins as any)
              addEdge(batch.batch_id, ins.inspection_id, 'SUPPORTED_BY' as RelationType)
            }
          }
        }
      }
    }
  }

  // --- 风险事件节点（该产品所有事件） ---
  const productEvents = riskEvents.filter((e) => e.product_id === productId)
  const eventIds = new Set<string>()

  for (const event of productEvents) {
    eventIds.add(event.event_id)
    addNode(event.event_id, event.event_name, 'RiskEvent', event as any)
    addEdge(event.event_id, event.product_id, 'RELATED_TO' as RelationType)

    // 关联问题类型
    const issue = issueTypes.find((it) => it.issue_type_id === event.issue_type)
    if (issue) {
      addNode(issue.issue_type_id, issue.type_name, 'IssueType', issue as any)
      addEdge(event.event_id, issue.issue_type_id, 'RELATED_TO' as RelationType)
    }

    // 关联批次
    for (const batchId of event.linked_batch) {
      if (nodeIds.has(batchId)) {
        addEdge(event.event_id, batchId, 'LINKED_TO' as RelationType)
      }
    }

    // 关联供应商
    for (const supId of event.linked_supplier) {
      if (nodeIds.has(supId)) {
        addEdge(event.event_id, supId, 'SUSPECTS' as RelationType)
      }
    }

    // 关联管控动作
    for (const actionId of event.recommended_action) {
      const action = controlActions.find((ca) => ca.action_id === actionId)
      if (action) {
        addNode(action.action_id, action.action_type, 'ControlAction', action as any)
        addEdge(event.event_id, action.action_id, 'CONTROLLED_BY' as RelationType)

        // 关联干系人
        const person = stakeholders.find((sh) => sh.stakeholder_id === action.assigned_role)
        if (person) {
          addNode(person.stakeholder_id, person.name, 'Stakeholder', person as any)
          addEdge(action.action_id, person.stakeholder_id, 'ASSIGNED_TO' as RelationType)
        }
      }
    }
  }

  // --- 知识规则节点（关联到产品所有事件） ---
  const relatedRules = knowledgeRules.filter((kr) => eventIds.has(kr.source_event_id))
  for (const rule of relatedRules) {
    addNode(rule.rule_id, rule.rule_name, 'KnowledgeRule', rule as any)
    if (eventIds.has(rule.source_event_id)) {
      addEdge(rule.source_event_id, rule.rule_id, 'RELATED_TO' as RelationType)
    }

    // 适用原料
    for (const ingId of rule.applies_to_ingredient) {
      if (nodeIds.has(ingId)) {
        addEdge(rule.rule_id, ingId, 'APPLIES_TO' as RelationType)
      }
    }

    // 预警标签
    for (const tagId of rule.warns_about_tags) {
      const tag = riskTags.find((rt) => rt.risk_tag_id === tagId)
      if (tag) {
        addNode(tag.risk_tag_id, tag.tag_name, 'RiskTag', tag as any)
        addEdge(rule.rule_id, tag.risk_tag_id, 'WARNS_ABOUT' as RelationType)
      }
    }
  }

  return { nodes, edges }
}