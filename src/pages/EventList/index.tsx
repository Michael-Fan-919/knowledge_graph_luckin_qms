import React from 'react'
import { Table, Tag, Typography, Space } from 'antd'
import { useNavigate } from 'react-router-dom'
import riskEventsData from '../../data/risk_events.json'
import productsData from '../../data/products.json'
import type { RiskEvent, Product } from '../../types/entities'
import type { RiskLevel } from '../../types/risk'
import RiskLevelTag from '../../components/Common/RiskLevelTag'
import { RISK_LEVEL_CONFIG } from '../../types/risk'

const { Title } = Typography

const riskEvents = riskEventsData as unknown as RiskEvent[]
const products = productsData as unknown as Product[]

const EventList: React.FC = () => {
  const navigate = useNavigate()

  const columns = [
    {
      title: '事件ID',
      dataIndex: 'event_id',
      key: 'event_id',
      render: (id: string) => (
        <a onClick={() => navigate(`/events/${id}`)}>{id}</a>
      ),
    },
    {
      title: '事件名称',
      dataIndex: 'event_name',
      key: 'event_name',
    },
    {
      title: '产品',
      dataIndex: 'product_id',
      key: 'product_id',
      render: (pid: string) => {
        const product = products.find((p) => p.product_id === pid)
        return product?.product_name || pid
      },
    },
    {
      title: '风险等级',
      dataIndex: 'risk_level',
      key: 'risk_level',
      filters: [
        { text: '高风险', value: 'high' },
        { text: '中高风险', value: 'medium_high' },
        { text: '中风险', value: 'medium' },
        { text: '低风险', value: 'low' },
      ],
      onFilter: (value: any, record: RiskEvent) => record.risk_level === value,
      sorter: (a: RiskEvent, b: RiskEvent) => a.risk_score - b.risk_score,
      render: (level: RiskLevel) => <RiskLevelTag level={level} />,
    },
    {
      title: '评分',
      dataIndex: 'risk_score',
      key: 'risk_score',
      sorter: (a: RiskEvent, b: RiskEvent) => a.risk_score - b.risk_score,
      render: (score: number, record: RiskEvent) => (
        <span style={{ color: RISK_LEVEL_CONFIG[record.risk_level as RiskLevel]?.color, fontWeight: 'bold' }}>
          {score}/12
        </span>
      ),
    },
    {
      title: '反馈数',
      dataIndex: 'raw_feedback_count',
      key: 'raw_feedback_count',
      sorter: (a: RiskEvent, b: RiskEvent) => a.raw_feedback_count - b.raw_feedback_count,
    },
    {
      title: '关键词',
      dataIndex: 'feedback_keywords',
      key: 'feedback_keywords',
      render: (keywords: string[]) => (
        <Space size={2} wrap>
          {keywords.slice(0, 3).map((kw) => (
            <Tag key={kw} color="volcano" style={{ fontSize: 11 }}>{kw}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '生命周期',
      dataIndex: 'lifecycle_stage',
      key: 'lifecycle_stage',
      filters: [
        { text: '发现', value: 'detected' },
        { text: '升级', value: 'escalated' },
        { text: '管控', value: 'controlled' },
        { text: '解决', value: 'resolved' },
      ],
      onFilter: (value: any, record: RiskEvent) => record.lifecycle_stage === value,
      render: (stage: string) => {
        const colors: Record<string, string> = {
          detected: 'red',
          escalated: 'orange',
          controlled: 'blue',
          resolved: 'green',
        }
        const labels: Record<string, string> = {
          detected: '发现',
          escalated: '升级',
          controlled: '管控',
          resolved: '解决',
        }
        return <Tag color={colors[stage]}>{labels[stage] || stage}</Tag>
      },
    },
    {
      title: '发现时间',
      dataIndex: 'detected_at',
      key: 'detected_at',
      sorter: (a: RiskEvent, b: RiskEvent) => new Date(a.detected_at).getTime() - new Date(b.detected_at).getTime(),
      render: (time: string) => time ? new Date(time).toLocaleString('zh-CN') : '-',
    },
  ]

  return (
    <div>
      <Title level={2}>风险事件列表</Title>
      <Table
        dataSource={riskEvents}
        columns={columns}
        rowKey="event_id"
        onRow={(record) => ({
          onClick: () => navigate(`/events/${record.event_id}`),
          style: { cursor: 'pointer' },
        })}
        pagination={false}
        size="middle"
      />
    </div>
  )
}

export default EventList