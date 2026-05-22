/** 产品 */
export interface Product {
  product_id: string
  product_name: string
  category: string
  launch_date: string
  key_ingredients: string[]
  storage_condition: string
  process_type: string
}

/** 原料 */
export interface Ingredient {
  ingredient_id: string
  ingredient_name: string
  ingredient_type: string
  known_risk: string[]
  risk_mechanism: string
  sensitive_condition: string[]
}

/** 供应商 */
export interface Supplier {
  supplier_id: string
  supplier_name: string
  ingredient_id: string
  supplier_level: 'A' | 'B' | 'C'
  historical_issue_count: number
}

/** 批次 */
export interface Batch {
  batch_id: string
  ingredient_id: string
  supplier_id: string
  production_date: string
  arrival_date: string
  inspection_result: 'pass' | 'fail' | 'warning'
  risk_flag: boolean
}

/** 门店 */
export interface Store {
  store_id: string
  store_name: string
  city: string
  warehouse_id: string
  batch_id: string
}

/** 仓库 */
export interface Warehouse {
  warehouse_id: string
  warehouse_name: string
  location: string
}

/** 风险事件 */
export interface RiskEvent {
  event_id: string
  event_name: string
  product_id: string
  issue_type: string
  risk_level: 'high' | 'medium_high' | 'medium' | 'low'
  risk_score: number
  suspected_cause: string
  linked_supplier: string[]
  linked_batch: string[]
  recommended_action: string[]
  raw_feedback_count: number
  feedback_keywords: string[]
  aggregated_at: string
  detected_at: string
  escalated_at: string
  controlled_at: string
  resolved_at: string
  lifecycle_stage: 'detected' | 'escalated' | 'controlled' | 'resolved'
}

/** 问题类型 */
export interface IssueType {
  issue_type_id: string
  type_name: string
  description: string
}

/** 风险标签 */
export interface RiskTag {
  risk_tag_id: string
  tag_name: string
  category: string
}

/** 检测记录 */
export interface Inspection {
  inspection_id: string
  batch_id: string
  inspection_item: string
  inspection_value: number
  inspection_result: 'pass' | 'fail' | 'warning'
  inspection_date: string
}

/** 标准作业流程 */
export interface SOP {
  sop_id: string
  product_id: string
  sop_name: string
  check_items: string[]
}

/** 管控动作 */
export interface ControlAction {
  action_id: string
  action_type: string
  action_description: string
  target_entity: string
  assigned_role: string
  action_status: 'pending' | 'in_progress' | 'completed'
  action_deadline: string
}

/** 知识规则 */
export interface KnowledgeRule {
  rule_id: string
  rule_name: string
  trigger_condition: string
  recommended_action: string
  source_event_id: string
  applies_to_ingredient: string[]
  warns_about_tags: string[]
}

/** 业务干系人 */
export interface Stakeholder {
  stakeholder_id: string
  name: string
  role: 'quality_engineer' | 'operations_manager' | 'store_manager' | 'customer_service' | 'rd_engineer'
  department: string
  responsibility: string
}

/** 案例类型 */
export type CaseId = 'coconut' | 'persimmon' | 'apple_milk'

/** 案例配置 */
export interface CaseConfig {
  caseId: CaseId
  label: string
  productId: string
  eventId: string
  description: string
}