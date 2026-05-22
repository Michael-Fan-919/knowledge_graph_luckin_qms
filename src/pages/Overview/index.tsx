import React, { useEffect, useRef, useState } from 'react'
import { Card, Row, Col, Statistic, List, Tag, Typography, Spin } from 'antd'
import {
  AlertOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  NodeIndexOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../contexts/AppContext'
import { buildGraph } from '../../core/graph/GraphBuilder'
import { RISK_LEVEL_CONFIG } from '../../types/risk'
import type { RiskLevel } from '../../types/risk'
import riskEventsData from '../../data/risk_events.json'
import type { RiskEvent } from '../../types/entities'
import GraphLegend from '../../components/Graph/GraphLegend'
import RiskLevelTag from '../../components/Common/RiskLevelTag'

const { Title, Text } = Typography
const riskEvents = riskEventsData as unknown as RiskEvent[]

const Overview: React.FC = () => {
  const { state } = useAppContext()
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [graphData, setGraphData] = useState<ReturnType<typeof buildGraph> | null>(null)

  useEffect(() => {
    setLoading(true)
    const data = buildGraph(state.selectedCase)
    setGraphData(data)
    setLoading(false)
  }, [state.selectedCase])

  useEffect(() => {
    if (!graphData || !containerRef.current) return

    let graph: any = null

    const initGraph = async () => {
      const G6 = await import('@antv/g6')

      if (graphRef.current) {
        graphRef.current.destroy()
        graphRef.current = null
      }

      const container = containerRef.current!
      const width = container.offsetWidth
      const height = container.offsetHeight || 500

      graph = new G6.Graph({
        container: container,
        width,
        height,
        layout: {
          type: 'force',
          preventOverlap: true,
          nodeStrength: -350,
          edgeStrength: 0.1,
          collideStrength: 0.8,
          nodeSpacing: 25,
        },
        defaultNode: {
          type: 'circle',
          size: 30,
          style: {
            fill: '#1890ff',
            stroke: '#fff',
            lineWidth: 2,
          },
          labelCfg: {
            style: { fill: '#333', fontSize: 10, fontWeight: 'normal' },
            position: 'bottom',
            offset: 5,
          },
        },
        defaultEdge: {
          type: 'line',
          style: {
            stroke: '#C0C0C0',
            lineWidth: 1,
            endArrow: {
              path: G6.Arrow.triangle(6, 8, 0),
              fill: '#C0C0C0',
            },
          },
          labelCfg: {
            style: { fill: '#999', fontSize: 8 },
            autoRotate: true,
          },
        },
        modes: {
          default: ['drag-canvas', 'zoom-canvas', 'drag-node'],
        },
        fitView: true,
        animate: true,
      })

      const nodes = graphData.nodes.map((n) => {
        const isRiskEvent = n.entityType === 'RiskEvent'
        const isHighRisk = isRiskEvent && n.data?.risk_level === 'high'
        return {
          id: n.id,
          label: n.label.length > 8 ? n.label.slice(0, 8) + '...' : n.label,
          size: isRiskEvent ? 45 : n.style?.size || 30,
          type: isRiskEvent ? 'diamond' : 'circle',
          style: {
            fill: n.style?.fill || '#1890ff',
            stroke: isHighRisk ? '#F5222D' : '#fff',
            lineWidth: isHighRisk ? 3 : 2,
            shadowColor: isHighRisk ? 'rgba(245,34,45,0.3)' : undefined,
            shadowBlur: isHighRisk ? 10 : 0,
          },
        }
      })

      const edges = graphData.edges.map((e) => ({
        source: e.source,
        target: e.target,
        label: e.label,
      }))

      graph.data({ nodes, edges })
      graph.render()

      // Hover highlight with animated transition
      graph.on('node:mouseenter', (evt: any) => {
        const node = evt.item
        const model = node.getModel()
        // Highlight connected edges
        graph.getEdges().forEach((edge: any) => {
          const source = edge.getSource().getModel()
          const target = edge.getTarget().getModel()
          if (source.id === model.id || target.id === model.id) {
            graph.updateItem(edge, {
              style: { stroke: '#1890ff', lineWidth: 2.5 },
            })
          } else {
            graph.updateItem(edge, {
              style: { stroke: '#f0f0f0', lineWidth: 0.5 },
            })
          }
        })
        // Dim unconnected nodes
        graph.getNodes().forEach((n: any) => {
          const nModel = n.getModel()
          const isConnected = nModel.id === model.id ||
            graph.getEdges().some((e: any) => {
              const s = e.getSource().getModel()
              const t = e.getTarget().getModel()
              return (s.id === model.id && t.id === nModel.id) || (t.id === model.id && s.id === nModel.id)
            })
          if (!isConnected) {
            graph.updateItem(n, { style: { opacity: 0.2 } })
          }
        })
      })

      graph.on('node:mouseleave', () => {
        graph.getEdges().forEach((edge: any) => {
          graph.updateItem(edge, { style: { stroke: '#C0C0C0', lineWidth: 1 } })
        })
        graph.getNodes().forEach((n: any) => {
          graph.updateItem(n, { style: { opacity: 1 } })
        })
      })

      // Click to navigate
      graph.on('node:click', (evt: any) => {
        const model = evt.item.getModel()
        if (model.type === 'diamond') {
          navigate(`/events/${model.id}`)
        }
      })

      graphRef.current = graph
    }

    initGraph()

    return () => {
      if (graphRef.current) {
        graphRef.current.destroy()
        graphRef.current = null
      }
    }
  }, [graphData, navigate])

  const eventMap: Record<string, string> = { coconut: 'P02', persimmon: 'P01', apple_milk: 'P03' }
  const currentProductId = eventMap[state.selectedCase]
  const caseEvents = riskEvents.filter((e) => e.product_id === currentProductId)
  const allEvents = [...riskEvents].sort((a, b) => b.risk_score - a.risk_score)

  const highCount = riskEvents.filter((e) => e.risk_level === 'high').length
  const resolvedCount = riskEvents.filter((e) => e.lifecycle_stage === 'resolved').length

  return (
    <div className="fade-in-up">
      <Title level={2}>知识图谱总览</Title>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <div className="fade-in-up fade-in-up-delay-1">
            <Card size="small" className="card-hover-lift">
              <Statistic title="风险事件" value={caseEvents.length} prefix={<AlertOutlined style={{ color: '#f5222d' }} />} />
            </Card>
            <Card size="small" style={{ marginTop: 16 }} className="card-hover-lift">
              <Statistic title="高风险" value={highCount} prefix={<WarningOutlined style={{ color: '#F5222D' }} />} />
            </Card>
            <Card size="small" style={{ marginTop: 16 }} className="card-hover-lift">
              <Statistic title="已解决" value={resolvedCount} prefix={<CheckCircleOutlined style={{ color: '#52C41A' }} />} />
            </Card>
            <Card size="small" style={{ marginTop: 16 }} className="card-hover-lift">
              <Statistic title="图谱节点" value={graphData?.nodes.length || 0} prefix={<NodeIndexOutlined style={{ color: '#1890ff' }} />} />
            </Card>
            <div style={{ marginTop: 16 }}>
              <GraphLegend />
            </div>
          </div>
        </Col>

        <Col span={12}>
          <div className="fade-in-up fade-in-up-delay-2">
            <Card title="知识图谱" size="small" bodyStyle={{ padding: 0, minHeight: 500 }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 500 }}>
                  <Spin size="large" />
                </div>
              ) : (
                <div ref={containerRef} style={{ width: '100%', height: 500 }} />
              )}
            </Card>
          </div>
        </Col>

        <Col span={6}>
          <div className="fade-in-up fade-in-up-delay-3">
            <Card title={`风险事件 (${allEvents.length})`} size="small" bodyStyle={{ maxHeight: 600, overflow: 'auto' }}>
              <List
                dataSource={allEvents}
                renderItem={(event) => {
                  const isCurrent = event.product_id === currentProductId
                  return (
                    <List.Item
                      className="card-hover-lift"
                      style={{
                        cursor: 'pointer',
                        padding: '8px 12px',
                        borderRadius: 6,
                        background: isCurrent ? 'rgba(24,144,255,0.06)' : undefined,
                        borderLeft: isCurrent ? '3px solid #1890ff' : '3px solid transparent',
                      }}
                      onClick={() => navigate(`/events/${event.event_id}`)}
                    >
                      <List.Item.Meta
                        title={
                          <span>
                            <RiskLevelTag level={event.risk_level as RiskLevel} />
                            <Text style={{ marginLeft: 4, fontSize: 13 }}>{event.event_name}</Text>
                            {isCurrent && <Tag color="blue" style={{ marginLeft: 4, fontSize: 10 }}>当前案例</Tag>}
                          </span>
                        }
                        description={
                          <div>
                            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
                              评分: {event.risk_score}/12 | 反馈: {event.raw_feedback_count}条
                            </div>
                            <div style={{ fontSize: 12 }}>
                              {event.feedback_keywords.slice(0, 3).map((kw) => (
                                <Tag key={kw} color="volcano" style={{ fontSize: 11 }}>{kw}</Tag>
                              ))}
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )
                }}
              />
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default Overview