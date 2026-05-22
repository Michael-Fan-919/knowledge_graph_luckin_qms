import React from 'react'
import { Card, Row, Col, Typography, Descriptions, Tag, Timeline, List, Space, Divider } from 'antd'
import {
  AlertOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  SafetyOutlined,
  NodeIndexOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import riskEventsData from '../../data/risk_events.json'
import controlActionsData from '../../data/control_actions.json'
import stakeholdersData from '../../data/stakeholders.json'
import productsData from '../../data/products.json'
import batchesData from '../../data/batches.json'
import suppliersData from '../../data/suppliers.json'
import inspectionsData from '../../data/inspections.json'
import knowledgeRulesData from '../../data/knowledge_rules.json'
import type { RiskEvent, ControlAction, Stakeholder, Product, KnowledgeRule } from '../../types/entities'
import type { RiskLevel } from '../../types/risk'
import RiskLevelTag from '../../components/Common/RiskLevelTag'
import StakeholderCard from '../../components/Common/StakeholderCard'

const { Title, Text, Paragraph } = Typography

const riskEvents = riskEventsData as unknown as RiskEvent[]
const controlActions = controlActionsData as unknown as ControlAction[]
const stakeholders = stakeholdersData as unknown as Stakeholder[]
const products = productsData as unknown as Product[]
const batches = batchesData as any[]
const suppliers = suppliersData as any[]
const inspections = inspectionsData as any[]
const knowledgeRules = knowledgeRulesData as unknown as KnowledgeRule[]

const EventDetail: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()

  const event = riskEvents.find((e) => e.event_id === eventId) || riskEvents[0]
  if (!event) return <div>事件未找到</div>

  const product = products.find((p) => p.product_id === event.product_id)
  const linkedBatches = batches.filter((b) => event.linked_batch.includes(b.batch_id))
  const linkedSuppliers = suppliers.filter((s) => event.linked_supplier.includes(s.supplier_id))
  const linkedInspections = inspections.filter((ins) => event.linked_batch.includes(ins.batch_id))
  const linkedActions = controlActions.filter((ca) => event.recommended_action.includes(ca.action_id))
  const relatedRules = knowledgeRules.filter((kr) => kr.source_event_id === event.event_id)

  // Lifecycle timeline
  const lifecycleStages = [
    { stage: 'detected' as const, time: event.detected_at, label: '发现' },
    { stage: 'escalated' as const, time: event.escalated_at, label: '升级' },
    { stage: 'controlled' as const, time: event.controlled_at, label: '管控' },
    { stage: 'resolved' as const, time: event.resolved_at, label: '解决' },
  ]

  const stageColors = { detected: '#f5222d', escalated: '#fa8c16', controlled: '#1890ff', resolved: '#52c41a' }
  const stageIcons = {
    detected: <AlertOutlined />,
    escalated: <ExclamationCircleOutlined />,
    controlled: <CheckCircleOutlined />,
    resolved: <SafetyOutlined />,
  }

  const actionStatusColor: Record<string, string> = {
    completed: 'green',
    in_progress: 'blue',
    pending: 'orange',
  }
  const actionStatusLabel: Record<string, string> = {
    completed: '已完成',
    in_progress: '进行中',
    pending: '待执行',
  }

  return (
    <div>
      <Title level={2}>风险事件详情</Title>

      <Row gutter={[16, 16]}>
        {/* Event Summary */}
        <Col span={16}>
          <Card size="small" style={{ marginBottom: 16 }}>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="事件ID">{event.event_id}</Descriptions.Item>
              <Descriptions.Item label="事件名称">{event.event_name}</Descriptions.Item>
              <Descriptions.Item label="产品">{product?.product_name || event.product_id}</Descriptions.Item>
              <Descriptions.Item label="风险等级">
                <RiskLevelTag level={event.risk_level as RiskLevel} />
                <Text style={{ marginLeft: 8 }}>评分: {event.risk_score}/12</Text>
              </Descriptions.Item>
              <Descriptions.Item label="疑似原因" span={2}>
                {event.suspected_cause}
              </Descriptions.Item>
              <Descriptions.Item label="反馈数量">{event.raw_feedback_count} 条</Descriptions.Item>
              <Descriptions.Item label="生命周期阶段">
                <Tag color={stageColors[event.lifecycle_stage]}>{event.lifecycle_stage}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="反馈关键词" span={2}>
                {event.feedback_keywords.map((kw) => (
                  <Tag key={kw} color="volcano" style={{ marginBottom: 4 }}>{kw}</Tag>
                ))}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Evidence Chain */}
          <Card title="证据链" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Card title="关联批次" size="small" type="inner">
                  {linkedBatches.map((batch) => (
                    <div key={batch.batch_id} style={{ marginBottom: 8 }}>
                      <Tag>{batch.batch_id}</Tag>
                      <Tag color={batch.inspection_result === 'warning' ? 'orange' : 'green'}>
                        {batch.inspection_result}
                      </Tag>
                      <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
                        供应商: {batch.supplier_id} | 生产: {batch.production_date}
                      </div>
                    </div>
                  ))}
                </Card>
              </Col>
              <Col span={8}>
                <Card title="检测记录" size="small" type="inner">
                  {linkedInspections.map((ins) => (
                    <div key={ins.inspection_id} style={{ marginBottom: 8 }}>
                      <Tag>{ins.inspection_item}</Tag>
                      <Text strong style={{ color: ins.inspection_result === 'warning' ? '#fa8c16' : '#52c41a' }}>
                        {ins.inspection_value}
                      </Text>
                      <Tag color={ins.inspection_result === 'warning' ? 'orange' : 'green'} style={{ marginLeft: 4 }}>
                        {ins.inspection_result}
                      </Tag>
                    </div>
                  ))}
                </Card>
              </Col>
              <Col span={8}>
                <Card title="关联供应商" size="small" type="inner">
                  {linkedSuppliers.map((sup) => (
                    <div key={sup.supplier_id} style={{ marginBottom: 8 }}>
                      <Tag color="purple">{sup.supplier_name}</Tag>
                      <Tag color={sup.supplier_level === 'B' ? 'orange' : 'green'}>
                        等级: {sup.supplier_level}
                      </Tag>
                      <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
                        历史问题: {sup.historical_issue_count} 次
                      </div>
                    </div>
                  ))}
                </Card>
              </Col>
            </Row>
          </Card>

          {/* Control Actions */}
          <Card title="管控动作" size="small" style={{ marginBottom: 16 }}>
            <List
              dataSource={linkedActions}
              renderItem={(action) => {
                const person = stakeholders.find((sh) => sh.stakeholder_id === action.assigned_role)
                return (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Tag color={actionStatusColor[action.action_status]}>
                            {actionStatusLabel[action.action_status]}
                          </Tag>
                          <Tag color="blue">{action.action_type}</Tag>
                          <Text>{action.action_description}</Text>
                        </Space>
                      }
                      description={
                        <Space>
                          {person && <StakeholderCard stakeholder={person} compact />}
                          <Text type="secondary">截止: {action.action_deadline}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )
              }}
            />
          </Card>

          {/* Action Buttons */}
          <Space>
            <a onClick={() => navigate(`/traceability/${event.event_id}`)}>
              <NodeIndexOutlined /> 全链路追溯
            </a>
            <Divider type="vertical" />
            <a onClick={() => navigate('/knowledge')}>
              <ArrowRightOutlined /> 生成知识规则
            </a>
          </Space>
        </Col>

        {/* Right: Lifecycle Timeline + Root Cause */}
        <Col span={8}>
          {/* Lifecycle Timeline */}
          <Card title="生命周期时间线" size="small" style={{ marginBottom: 16 }}>
            <Timeline
              items={lifecycleStages.map((ls) => ({
                color: ls.time ? stageColors[ls.stage] : '#d9d9d9',
                dot: ls.time ? stageIcons[ls.stage] : undefined,
                children: (
                  <div>
                    <Text strong>{ls.label}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {ls.time ? new Date(ls.time).toLocaleString('zh-CN') : '未发生'}
                    </Text>
                  </div>
                ),
              }))}
            />
          </Card>

          {/* Root Cause Candidates */}
          <Card title="候选根因" size="small" style={{ marginBottom: 16 }}>
            {linkedSuppliers.map((sup) => (
              <Card key={sup.supplier_id} size="small" type="inner" style={{ marginBottom: 8 }}>
                <Text strong>{sup.supplier_name}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  置信度: {sup.supplier_level === 'B' ? '80%' : '60%'}
                </Text>
                <br />
                <Text style={{ fontSize: 12 }}>
                  供应商等级 {sup.supplier_level}，历史问题 {sup.historical_issue_count} 次
                </Text>
              </Card>
            ))}
            {linkedBatches.filter((b) => b.risk_flag).map((batch) => (
              <Card key={batch.batch_id} size="small" type="inner" style={{ marginBottom: 8 }}>
                <Text strong>{batch.batch_id}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>置信度: 70%</Text>
                <br />
                <Text style={{ fontSize: 12 }}>
                  检测结果: {batch.inspection_result}，标记为风险批次
                </Text>
              </Card>
            ))}
          </Card>

          {/* Related Knowledge Rules */}
          {relatedRules.length > 0 && (
            <Card title="关联知识规则" size="small">
              {relatedRules.map((rule) => (
                <div key={rule.rule_id} style={{ marginBottom: 8 }}>
                  <Tag color="magenta">{rule.rule_name}</Tag>
                  <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginTop: 4 }}>
                    触发: {rule.trigger_condition}
                  </div>
                </div>
              ))}
            </Card>
          )}
        </Col>
      </Row>
    </div>
  )
}

export default EventDetail