import React from 'react'
import { Card, Avatar, Tag, Typography } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { ROLE_LABELS } from '../../utils/constants'
import type { Stakeholder } from '../../types/entities'

const { Text } = Typography

interface StakeholderCardProps {
  stakeholder: Stakeholder
  compact?: boolean
}

const roleColors: Record<string, string> = {
  quality_engineer: 'blue',
  operations_manager: 'green',
  store_manager: 'orange',
  customer_service: 'purple',
  rd_engineer: 'cyan',
}

const StakeholderCard: React.FC<StakeholderCardProps> = ({ stakeholder, compact = false }) => {
  if (compact) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
        <Text>{stakeholder.name}</Text>
        <Tag color={roleColors[stakeholder.role]} style={{ marginLeft: 4 }}>
          {ROLE_LABELS[stakeholder.role] || stakeholder.role}
        </Tag>
      </span>
    )
  }

  return (
    <Card size="small" style={{ width: 280 }}>
      <Card.Meta
        avatar={
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
        }
        title={
          <span>
            {stakeholder.name}
            <Tag color={roleColors[stakeholder.role]} style={{ marginLeft: 8 }}>
              {ROLE_LABELS[stakeholder.role] || stakeholder.role}
            </Tag>
          </span>
        }
        description={
          <div>
            <div>{stakeholder.department}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {stakeholder.responsibility}
            </Text>
          </div>
        }
      />
    </Card>
  )
}

export default StakeholderCard