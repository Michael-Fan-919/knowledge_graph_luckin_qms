import React, { useState } from 'react'
import { Card, Row, Col, Typography, Select, Button, Descriptions, Tag, List, Space, Divider } from 'antd'
import { ScanOutlined, AlertOutlined, BookOutlined, SafetyOutlined } from '@ant-design/icons'
import { scanProductRisk } from '../../core/risk/RiskScanner'
import type { RiskScanResult } from '../../types/risk'
import type { RiskLevel } from '../../types/risk'
import productsData from '../../data/products.json'
import ingredientsData from '../../data/ingredients.json'
import type { Product, Ingredient } from '../../types/entities'
import RiskLevelTag from '../../components/Common/RiskLevelTag'
import { RISK_LEVEL_CONFIG } from '../../types/risk'

const { Title, Text, Paragraph } = Typography

const products = productsData as unknown as Product[]
const ingredients = ingredientsData as unknown as Ingredient[]

const RiskScan: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<string>('P01')
  const [scanResult, setScanResult] = useState<RiskScanResult | null>(null)
  const [scanning, setScanning] = useState(false)

  const handleScan = () => {
    setScanning(true)
    // Simulate async scan
    setTimeout(() => {
      const result = scanProductRisk(selectedProduct)
      setScanResult(result)
      setScanning(false)
    }, 500)
  }

  return (
    <div>
      <Title level={2}>新品风险前置扫描</Title>

      {/* Input Form */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space>
          <Text strong>选择产品:</Text>
          <Select
            value={selectedProduct}
            onChange={setSelectedProduct}
            style={{ width: 250 }}
            options={products.map((p) => ({
              value: p.product_id,
              label: `${p.product_name} (${p.category})`,
            }))}
          />
          <Button
            type="primary"
            icon={<ScanOutlined />}
            onClick={handleScan}
            loading={scanning}
          >
            扫描风险
          </Button>
        </Space>
      </Card>

      {scanResult && (
        <Row gutter={[16, 16]}>
          <Col span={16}>
            {/* Overall Result */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={3} bordered size="small">
                <Descriptions.Item label="产品">{scanResult.product_name}</Descriptions.Item>
                <Descriptions.Item label="整体风险等级">
                  <RiskLevelTag level={scanResult.overall_risk_level} />
                </Descriptions.Item>
                <Descriptions.Item label="原料风险项">{scanResult.ingredient_risks.length}</Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Ingredient Risks */}
            <Card title="原料风险分析" size="small" style={{ marginBottom: 16 }}>
              {scanResult.ingredient_risks.map((ir) => {
                const ingredient = ingredients.find((i) => i.ingredient_id === ir.ingredient_id)
                return (
                  <Card key={ir.ingredient_id} type="inner" size="small" style={{ marginBottom: 8 }}>
                    <Row gutter={16}>
                      <Col span={6}>
                        <Text strong>{ir.ingredient_name}</Text>
                        <br />
                        <Tag color="blue">{ingredient?.ingredient_type || '未知'}</Tag>
                      </Col>
                      <Col span={10}>
                        <Text type="secondary" style={{ fontSize: 12 }}>已知风险:</Text>
                        <br />
                        {ir.known_risks.map((risk) => (
                          <Tag key={risk} color="volcano" style={{ marginBottom: 4 }}>{risk}</Tag>
                        ))}
                        {ingredient?.sensitive_condition && (
                          <>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>敏感条件:</Text>
                            <br />
                            {ingredient.sensitive_condition.map((cond) => (
                              <Tag key={cond} color="orange" style={{ marginBottom: 4 }}>{cond}</Tag>
                            ))}
                          </>
                        )}
                      </Col>
                      <Col span={8}>
                        <Text type="secondary" style={{ fontSize: 12 }}>风险机理:</Text>
                        <br />
                        <Text style={{ fontSize: 12 }}>{ingredient?.risk_mechanism || '暂无'}</Text>
                      </Col>
                    </Row>
                  </Card>
                )
              })}
            </Card>

            {/* Suggested Actions */}
            <Card title="建议动作" size="small">
              <List
                dataSource={scanResult.suggested_actions}
                renderItem={(action, idx) => (
                  <List.Item>
                    <Space>
                      <Tag color="blue">{idx + 1}</Tag>
                      <Text>{action}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          <Col span={8}>
            {/* Historical Cases */}
            <Card title="关联历史案例" size="small" style={{ marginBottom: 16 }}>
              {scanResult.ingredient_risks.some((ir) => ir.historical_events.length > 0) ? (
                scanResult.ingredient_risks
                  .filter((ir) => ir.historical_events.length > 0)
                  .flatMap((ir) => ir.historical_events)
                  .map((event) => (
                    <Card key={event.event_id} size="small" type="inner" style={{ marginBottom: 8 }}>
                      <Space direction="vertical" size={2}>
                        <RiskLevelTag level={event.risk_level as RiskLevel} />
                        <Text strong>{event.event_name}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          评分: {event.risk_score}/12 | 反馈: {event.raw_feedback_count}条
                        </Text>
                        <div>
                          {event.feedback_keywords.slice(0, 3).map((kw) => (
                            <Tag key={kw} color="volcano" style={{ fontSize: 11 }}>{kw}</Tag>
                          ))}
                        </div>
                      </Space>
                    </Card>
                  ))
              ) : (
                <Text type="secondary">暂无相关历史案例</Text>
              )}
            </Card>

            {/* Related Knowledge Rules */}
            <Card title="关联知识规则" size="small">
              {scanResult.related_knowledge_rules.length > 0 ? (
                scanResult.related_knowledge_rules.map((rule) => (
                  <Card key={rule.rule_id} size="small" type="inner" style={{ marginBottom: 8 }}>
                    <Tag color="magenta">{rule.rule_name}</Tag>
                    <div style={{ fontSize: 12, marginTop: 4 }}>
                      <Text type="secondary">触发条件:</Text> {rule.trigger_condition}
                    </div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>
                      <Text type="secondary">建议:</Text> {rule.recommended_action}
                    </div>
                  </Card>
                ))
              ) : (
                <Text type="secondary">暂无关联知识规则</Text>
              )}
            </Card>
          </Col>
        </Row>
      )}
    </div>
  )
}

export default RiskScan