import React from 'react'
import { Tag } from 'antd'
import { RISK_LEVEL_CONFIG } from '../../types/risk'
import type { RiskLevel } from '../../types/risk'

interface RiskLevelTagProps {
  level: RiskLevel
}

const RiskLevelTag: React.FC<RiskLevelTagProps> = ({ level }) => {
  const config = RISK_LEVEL_CONFIG[level]
  return <Tag color={config.color}>{config.label}</Tag>
}

export default RiskLevelTag