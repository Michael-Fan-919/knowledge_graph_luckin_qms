import React from 'react'
import { Select, Space, Typography } from 'antd'
import { useAppContext } from '../../contexts/AppContext'
import { CASE_CONFIGS } from '../../utils/constants'
import type { CaseId } from '../../types/entities'

const { Text } = Typography

interface CaseSelectorProps {
  style?: React.CSSProperties
}

const CaseSelector: React.FC<CaseSelectorProps> = ({ style }) => {
  const { state, selectCase } = useAppContext()

  return (
    <Space direction="vertical" size={4} style={style}>
      <Text type="secondary" style={{ fontSize: 12 }}>选择案例</Text>
      <Select
        value={state.selectedCase}
        onChange={(value: CaseId) => selectCase(value)}
        style={{ width: 200 }}
        options={CASE_CONFIGS.map((c) => ({
          value: c.caseId,
          label: c.label,
        }))}
      />
    </Space>
  )
}

export default CaseSelector