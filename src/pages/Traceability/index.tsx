import React, { useEffect, useRef, useState } from 'react'
import { Card, Row, Col, Typography, Spin, List, Tag, Descriptions } from 'antd'
import { useParams } from 'react-router-dom'
import { useAppContext } from '../../contexts/AppContext'
import { traceEvent } from '../../core/risk/TraceabilityEngine'
import { CASE_EVENT_MAP } from '../../utils/constants'
import type { TraceResult, TraceNode } from '../../types/risk'
import { NODE_TYPE_COLORS } from '../../utils/graphUtils'
import RiskLevelTag from '../../components/Common/RiskLevelTag'
import type { RiskLevel } from '../../types/risk'

const { Title, Text } = Typography

const Traceability: React.FC = () => {
  const { eventId } = useParams<{ eventId?: string }>()
  const { state } = useAppContext()
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [traceResult, setTraceResult] = useState<TraceResult | null>(null)
  const [selectedNode, setSelectedNode] = useState<TraceNode | null>(null)

  const targetEventId = eventId || CASE_EVENT_MAP[state.selectedCase]

  useEffect(() => {
    const result = traceEvent(state.selectedCase, targetEventId)
    setTraceResult(result)
    setLoading(false)
  }, [state.selectedCase, targetEventId])

  // Render G6 graph
  useEffect(() => {
    if (!traceResult || !containerRef.current) return

    let graph: any = null

    const initGraph = async () => {
      const G6 = await import('@antv/g6')

      if (graphRef.current) {
        graphRef.current.destroy()
        graphRef.current = null
      }

      const container = containerRef.current!
      const width = container.offsetWidth
      const height = container.offsetHeight || 450

      graph = new G6.Graph({
        container: container,
        width,
        height,
        layout: {
          type: 'dagre',
          rankdir: 'LR',
          nodesep: 30,
          ranksep: 60,
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
            style: { fill: '#333', fontSize: 10 },
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

      const nodes = traceResult.nodes.map((n) => ({
        id: n.id,
        label: n.label.length > 10 ? n.label.slice(0, 10) + '...' : n.label,
        size: n.entityType === 'RiskEvent' ? 40 : 30,
        type: n.entityType === 'RiskEvent' ? 'diamond' : 'circle',
        style: {
          fill: NODE_TYPE_COLORS[n.entityType] || '#8c8c8c',
          stroke: '#fff',
          lineWidth: 2,
        },
      }))

      const edges = traceResult.edges.map((e) => ({
        source: e.source,
        target: e.target,
        label: e.label,
      }))

      graph.data({ nodes, edges })
      graph.render()

      // Click node to show details
      graph.on('node:click', (evt: any) => {
        const model = evt.item.getModel()
        const node = traceResult.nodes.find((n) => n.id === model.id)
        if (node) setSelectedNode(node)
      })

      // Hover highlight
      graph.on('node:mouseenter', (evt: any) => {
        const node = evt.item
        const model = node.getModel()
        graph.getEdges().forEach((edge: any) => {
          const source = edge.getSource().getModel()
          const target = edge.getTarget().getModel()
          if (source.id === model.id || target.id === model.id) {
            graph.updateItem(edge, { style: { stroke: '#1890ff', lineWidth: 2 } })
          }
        })
      })

      graph.on('node:mouseleave', () => {
        graph.getEdges().forEach((edge: any) => {
          graph.updateItem(edge, { style: { stroke: '#C0C0C0', lineWidth: 1 } })
        })
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
  }, [traceResult])

  return (
    <div>
      <Title level={2}>全链路追溯</Title>

      <Row gutter={[16, 16]}>
        {/* Graph Canvas */}
        <Col span={16}>
          <Card title={`追溯路径: ${targetEventId}`} size="small" bodyStyle={{ padding: 0 }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 450 }}>
                <Spin size="large" />
              </div>
            ) : (
              <div ref={containerRef} style={{ width: '100%', height: 450 }} />
            )}
          </Card>
        </Col>

        {/* Right Panel */}
        <Col span={8}>
          {/* Selected Node Detail */}
          {selectedNode && (
            <Card title="节点详情" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="ID">{selectedNode.id}</Descriptions.Item>
                <Descriptions.Item label="类型">
                  <Tag color={NODE_TYPE_COLORS[selectedNode.entityType]}>
                    {selectedNode.entityType}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="名称">{selectedNode.label}</Descriptions.Item>
                <Descriptions.Item label="层级">{selectedNode.depth}</Descriptions.Item>
                {selectedNode.properties && Object.entries(selectedNode.properties).slice(0, 5).map(([key, value]) => (
                  <Descriptions.Item key={key} label={key}>
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </Card>
          )}

          {/* Root Cause Candidates */}
          {traceResult && traceResult.root_cause_candidates.length > 0 && (
            <Card title="根因候选" size="small" style={{ marginBottom: 16 }}>
              {traceResult.root_cause_candidates.map((candidate, idx) => (
                <Card key={idx} size="small" type="inner" style={{ marginBottom: 8 }}>
                  <Text strong>{candidate.entity_id}</Text>
                  <Tag color="red" style={{ marginLeft: 8 }}>
                    置信度: {Math.round(candidate.confidence * 100)}%
                  </Tag>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {candidate.reason}
                  </Text>
                </Card>
              ))}
            </Card>
          )}

          {/* Trace Stats */}
          {traceResult && (
            <Card title="追溯统计" size="small">
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="追溯节点数">{traceResult.nodes.length}</Descriptions.Item>
                <Descriptions.Item label="关系边数">{traceResult.edges.length}</Descriptions.Item>
                <Descriptions.Item label="根因候选">{traceResult.root_cause_candidates.length}</Descriptions.Item>
                <Descriptions.Item label="最大深度">
                  {Math.max(...traceResult.nodes.map((n) => n.depth))}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  )
}

export default Traceability