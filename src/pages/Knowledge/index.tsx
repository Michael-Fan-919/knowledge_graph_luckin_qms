import React, { useState } from 'react'
import { Card, Row, Col, Typography, Collapse, Tag, List, Select, Space, Descriptions, Button, Divider } from 'antd'
import { BookOutlined, ExperimentOutlined, CheckCircleOutlined } from '@ant-design/icons'
import knowledgeRulesData from '../../data/knowledge_rules.json'
import riskEventsData from '../../data/risk_events.json'
import ingredientsData from '../../data/ingredients.json'
import riskTagsData from '../../data/risk_tags.json'
import productsData from '../../data/products.json'
import type { KnowledgeRule, RiskEvent, Ingredient, RiskTag, Product } from '../../types/entities'
import RiskLevelTag from '../../components/Common/RiskLevelTag'
import type { RiskLevel } from '../../types/risk'

const { Title, Text, Paragraph } = Typography

const knowledgeRules = knowledgeRulesData as unknown as KnowledgeRule[]
const riskEvents = riskEventsData as unknown as RiskEvent[]
const ingredients = ingredientsData as unknown as Ingredient[]
const riskTags = riskTagsData as unknown as RiskTag[]
const products = productsData as unknown as Product[]

const Knowledge: React.FC = () => {
  const [testIngredients, setTestIngredients] = useState<string[]>([])
  const [matchedRules, setMatchedRules] = useState<KnowledgeRule[]>([])
  const [showResult, setShowResult] = useState(false)

  const handleTest = () => {
    const matched = knowledgeRules.filter((rule) =>
      rule.applies_to_ingredient.some((ingId) => testIngredients.includes(ingId))
    )
    setMatchedRules(matched)
    setShowResult(true)
  }

  return (
    <div>
      <Title level={2}>风险闭环与知识沉淀</Title>

      <Row gutter={[16, 16]}>
        <Col span={16}>
          {/* Event → Rule Transformation */}
          <Card title="事件→知识规则转化" size="small" style={{ marginBottom: 16 }}>
            {knowledgeRules.map((rule) => {
              const sourceEvent = riskEvents.find((e) => e.event_id === rule.source_event_id)
              return (
                <Card key={rule.rule_id} type="inner" size="small" style={{ marginBottom: 12 }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Text type="secondary" style={{ fontSize: 12 }}>来源事件</Text>
                      <div style={{ marginTop: 4 }}>
                        {sourceEvent && (
                          <>
                            <RiskLevelTag level={sourceEvent.risk_level as RiskLevel} />
                            <Text strong style={{ marginLeft: 4 }}>{sourceEvent.event_name}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              评分: {sourceEvent.risk_score}/12 | 反馈: {sourceEvent.raw_feedback_count}条
                            </Text>
                          </>
                        )}
                      </div>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary" style={{ fontSize: 12 }}>沉淀为知识规则</Text>
                      <div style={{ marginTop: 4 }}>
                        <Tag color="magenta">{rule.rule_name}</Tag>
                        <div style={{ fontSize: 12, marginTop: 4 }}>
                          <Text type="secondary">触发:</Text> {rule.trigger_condition}
                        </div>
                        <div style={{ fontSize: 12, marginTop: 2 }}>
                          <Text type="secondary">动作:</Text> {rule.recommended_action}
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <Divider style={{ margin: '8px 0' }} />
                  <Space size={4}>
                    <Text type="secondary" style={{ fontSize: 11 }}>适用原料:</Text>
                    {rule.applies_to_ingredient.map((ingId) => {
                      const ing = ingredients.find((i) => i.ingredient_id === ingId)
                      return <Tag key={ingId} color="blue">{ing?.ingredient_name || ingId}</Tag>
                    })}
                    <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>预警标签:</Text>
                    {rule.warns_about_tags.map((tagId) => {
                      const tag = riskTags.find((t) => t.risk_tag_id === tagId)
                      return <Tag key={tagId} color="volcano">{tag?.tag_name || tagId}</Tag>
                    })}
                  </Space>
                </Card>
              )
            })}
          </Card>

          {/* Rule List */}
          <Card title="知识规则列表" size="small">
            <List
              dataSource={knowledgeRules}
              renderItem={(rule) => (
                <List.Item>
                  <List.Item.Meta
                    title={<Tag color="magenta">{rule.rule_name}</Tag>}
                    description={
                      <div>
                        <div style={{ fontSize: 12 }}>
                          <Text type="secondary">触发条件:</Text> {rule.trigger_condition}
                        </div>
                        <div style={{ fontSize: 12 }}>
                          <Text type="secondary">建议动作:</Text> {rule.recommended_action}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={8}>
          {/* Interactive Reuse Demo */}
          <Card title="交互式复用演示" size="small" style={{ marginBottom: 16 }}>
            <Paragraph style={{ fontSize: 12 }}>
              选择原料组合，自动匹配知识规则并生成建议：
            </Paragraph>
            <Select
              mode="multiple"
              value={testIngredients}
              onChange={setTestIngredients}
              placeholder="选择原料..."
              style={{ width: '100%', marginBottom: 16 }}
              options={ingredients.map((ing) => ({
                value: ing.ingredient_id,
                label: `${ing.ingredient_name} (${ing.ingredient_type})`,
              }))}
            />
            <Button
              type="primary"
              icon={<ExperimentOutlined />}
              onClick={handleTest}
              disabled={testIngredients.length === 0}
              block
            >
              匹配规则
            </Button>

            {showResult && (
              <div style={{ marginTop: 16 }}>
                <Divider />
                {matchedRules.length > 0 ? (
                  <>
                    <Tag color="red" style={{ marginBottom: 8 }}>
                      匹配到 {matchedRules.length} 条规则
                    </Tag>
                    {matchedRules.map((rule) => (
                      <Card key={rule.rule_id} size="small" type="inner" style={{ marginBottom: 8 }}>
                        <Tag color="magenta">{rule.rule_name}</Tag>
                        <div style={{ fontSize: 12, marginTop: 4 }}>
                          <Text type="secondary">触发:</Text> {rule.trigger_condition}
                        </div>
                        <div style={{ fontSize: 12, marginTop: 4 }}>
                          <Text type="secondary">建议:</Text> {rule.recommended_action}
                        </div>
                      </Card>
                    ))}
                  </>
                ) : (
                  <Tag color="green">
                    <CheckCircleOutlined /> 未匹配到风险规则，原料组合相对安全
                  </Tag>
                )}
              </div>
            )}
          </Card>

          {/* Stats */}
          <Card title="知识库统计" size="small">
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="知识规则总数">{knowledgeRules.length}</Descriptions.Item>
              <Descriptions.Item label="覆盖原料">
                {[...new Set(knowledgeRules.flatMap((r) => r.applies_to_ingredient))].length} 种
              </Descriptions.Item>
              <Descriptions.Item label="预警标签">
                {[...new Set(knowledgeRules.flatMap((r) => r.warns_about_tags))].length} 个
              </Descriptions.Item>
              <Descriptions.Item label="来源事件">{knowledgeRules.length} 个</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Knowledge