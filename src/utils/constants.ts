import type { CaseId, CaseConfig } from '../types/entities'

/** 案例配置 */
export const CASE_CONFIGS: CaseConfig[] = [
  {
    caseId: 'coconut',
    label: '椰子果肉氧化变紫',
    productId: 'P02',
    eventId: 'RE-20260420-001',
    description: '椰子果肉中多酚类物质接触空气后氧化变紫，消费者误认为变质',
  },
  {
    caseId: 'persimmon',
    label: '好柿成双涩味异常',
    productId: 'P01',
    eventId: 'RE-20260515-001',
    description: '供应商B提供的柿子成熟度不足，单宁含量偏高导致明显涩味',
  },
  {
    caseId: 'apple_milk',
    label: 'hello苹果茉莉（新品预警）',
    productId: 'P03',
    eventId: 'RE-20260601-001',
    description: '新品上线前风险预警：苹果汁中果酸在特定温度下可能导致牛奶蛋白质变性产生絮状物；茉莉茶底过萃风险',
  },
]

/** 案例到产品 ID 映射 */
export const CASE_PRODUCT_MAP: Record<CaseId, string> = {
  coconut: 'P02',
  persimmon: 'P01',
  apple_milk: 'P03',
}

/** 案例到事件 ID 映射 */
export const CASE_EVENT_MAP: Record<CaseId, string> = {
  coconut: 'RE-20260420-001',
  persimmon: 'RE-20260515-001',
  apple_milk: 'RE-20260601-001',
}

/** 案例到 CSV 文件名映射 */
export const CASE_CSV_MAP: Record<CaseId, string> = {
  coconut: 'case1_coconut',
  persimmon: 'case2_persimmon',
  apple_milk: 'case3_apple_milk',
}

/** 风险等级排序权重 */
export const RISK_LEVEL_ORDER: Record<string, number> = {
  high: 0,
  medium_high: 1,
  medium: 2,
  low: 3,
}

/** 干系人角色中文映射 */
export const ROLE_LABELS: Record<string, string> = {
  quality_engineer: '质量工程师',
  operations_manager: '运营经理',
  store_manager: '门店经理',
  customer_service: '客服专员',
  rd_engineer: '研发工程师',
}