import React from 'react'
import { Layout, Menu, Select, Divider, Typography } from 'antd'
import {
  ApartmentOutlined,
  ScanOutlined,
  UnorderedListOutlined,
  FileTextOutlined,
  NodeIndexOutlined,
  BookOutlined,
  ExperimentOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppContext } from '../../contexts/AppContext'
import { CASE_CONFIGS } from '../../utils/constants'
import type { CaseId } from '../../types/entities'

const { Sider } = Layout
const { Text } = Typography

const menuItems = [
  {
    key: '/',
    icon: <ApartmentOutlined />,
    label: '知识图谱总览',
  },
  {
    key: '/risk-scan',
    icon: <ScanOutlined />,
    label: '新品风险前置扫描',
  },
  {
    key: '/events',
    icon: <UnorderedListOutlined />,
    label: '风险事件列表',
  },
  {
    key: '/events/RE-20260515-001',
    icon: <FileTextOutlined />,
    label: '风险事件详情',
  },
  {
    key: '/traceability',
    icon: <NodeIndexOutlined />,
    label: '全链路追溯',
  },
  {
    key: '/knowledge',
    icon: <BookOutlined />,
    label: '风险闭环与知识沉淀',
  },
  {
    key: '/pipeline',
    icon: <ExperimentOutlined />,
    label: '数据处理流水线',
  },
]

const Sidebar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { state, selectCase } = useAppContext()

  const handleMenuClick = (info: { key: string }) => {
    navigate(info.key)
  }

  const handleCaseChange = (value: CaseId) => {
    selectCase(value)
  }

  return (
    <Sider width={240} style={{ overflow: 'auto', height: '100vh' }}>
      <div style={{ padding: '16px' }}>
        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>选择案例</Text>
        <Select
          value={state.selectedCase}
          onChange={handleCaseChange}
          style={{ width: '100%', marginTop: 4 }}
          options={CASE_CONFIGS.map((c) => ({
            value: c.caseId,
            label: c.label,
          }))}
        />
      </div>
      <Divider style={{ margin: '0', borderColor: 'rgba(255,255,255,0.1)' }} />
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 0 }}
      />
    </Sider>
  )
}

export default Sidebar