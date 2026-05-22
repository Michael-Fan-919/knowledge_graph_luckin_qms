import React from 'react'
import { Space, Typography } from 'antd'
import { RISK_LEVEL_CONFIG } from '../../types/risk'

const { Text } = Typography

const entityTypes = [
  { label: '产品', color: '#1890ff', shape: 'circle' },
  { label: '原料', color: '#52c41a', shape: 'circle' },
  { label: '供应商', color: '#722ed1', shape: 'circle' },
  { label: '批次', color: '#13c2c2', shape: 'circle' },
  { label: '门店', color: '#fa8c16', shape: 'circle' },
  { label: '风险事件', color: '#f5222d', shape: 'diamond' },
  { label: '知识规则', color: '#eb2f96', shape: 'circle' },
]

const GraphLegend: React.FC = () => {
  return (
    <div style={{ padding: 8, background: '#fff', borderRadius: 6, border: '1px solid #f0f0f0' }}>
      <Text strong style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>图例</Text>
      <Space direction="vertical" size={4}>
        <Text type="secondary" style={{ fontSize: 11 }}>实体类型</Text>
        {entityTypes.map((item) => (
          <Space key={item.label} size={4}>
            <span
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: item.shape === 'circle' ? '50%' : 2,
                backgroundColor: item.color,
              }}
            />
            <Text style={{ fontSize: 12 }}>{item.label}</Text>
          </Space>
        ))}
        <Text type="secondary" style={{ fontSize: 11, marginTop: 8 }}>风险等级</Text>
        {Object.entries(RISK_LEVEL_CONFIG).map(([key, config]) => (
          <Space key={key} size={4}>
            <span
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: config.color,
              }}
            />
            <Text style={{ fontSize: 12 }}>{config.label}</Text>
          </Space>
        ))}
      </Space>
    </div>
  )
}

export default GraphLegend