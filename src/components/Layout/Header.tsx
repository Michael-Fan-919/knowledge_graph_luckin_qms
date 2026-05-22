import React from 'react'
import { Layout, Typography, Space, Button, Tag } from 'antd'
import {
  ExperimentOutlined,
  NodeIndexOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../contexts/AppContext'
import { CASE_CONFIGS } from '../../utils/constants'

const { Header: AntHeader } = Layout
const { Title } = Typography

const Header: React.FC = () => {
  const navigate = useNavigate()
  const { state } = useAppContext()
  const currentCase = CASE_CONFIGS.find((c) => c.caseId === state.selectedCase)

  return (
    <AntHeader
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: '#001529',
      }}
    >
      <Space align="center">
        <NodeIndexOutlined style={{ color: '#1890ff', fontSize: 24 }} />
        <Title level={4} style={{ color: '#fff', margin: 0, lineHeight: '64px' }}>
          质量风险知识图谱
        </Title>
        {currentCase && (
          <Tag color="blue" style={{ marginLeft: 8 }}>
            {currentCase.label}
          </Tag>
        )}
      </Space>
      <Space>
        <Button
          type="primary"
          icon={<ExperimentOutlined />}
          onClick={() => navigate('/pipeline')}
        >
          运行 Pipeline
        </Button>
      </Space>
    </AntHeader>
  )
}

export default Header