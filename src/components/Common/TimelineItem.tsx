import React from 'react'
import { Tag } from 'antd'
import {
  AlertOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  SafetyOutlined,
} from '@ant-design/icons'

interface TimelineItemProps {
  stage: 'detected' | 'escalated' | 'controlled' | 'resolved'
  label: string
  time: string
}

const stageConfig = {
  detected: { color: '#f5222d', icon: <AlertOutlined />, tag: '发现' },
  escalated: { color: '#fa8c16', icon: <ExclamationCircleOutlined />, tag: '升级' },
  controlled: { color: '#1890ff', icon: <CheckCircleOutlined />, tag: '管控' },
  resolved: { color: '#52c41a', icon: <SafetyOutlined />, tag: '解决' },
}

const TimelineItem: React.FC<TimelineItemProps> = ({ stage, label, time }) => {
  const config = stageConfig[stage]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color: config.color, fontSize: 16 }}>{config.icon}</span>
      <Tag color={config.color}>{config.tag}</Tag>
      <span>{label}</span>
      {time && (
        <span style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12, marginLeft: 'auto' }}>
          {time}
        </span>
      )}
    </div>
  )
}

export default TimelineItem