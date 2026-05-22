import React, { Suspense, lazy } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { ConfigProvider, Spin } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { AppProvider } from './contexts/AppContext'
import { PipelineProvider } from './contexts/PipelineContext'
import AppLayout from './components/Layout/AppLayout'
import theme from './assets/styles/theme'

// Lazy load pages
const Overview = lazy(() => import('./pages/Overview'))
const RiskScan = lazy(() => import('./pages/RiskScan'))
const EventList = lazy(() => import('./pages/EventList'))
const EventDetail = lazy(() => import('./pages/EventDetail'))
const Traceability = lazy(() => import('./pages/Traceability'))
const Knowledge = lazy(() => import('./pages/Knowledge'))
const Pipeline = lazy(() => import('./pages/Pipeline'))

const Loading: React.FC = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
    <Spin size="large" tip="加载中..." />
  </div>
)

const App: React.FC = () => {
  return (
    <ConfigProvider theme={theme} locale={zhCN}>
      <AppProvider>
        <PipelineProvider>
          <HashRouter>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Overview />} />
                  <Route path="/risk-scan" element={<RiskScan />} />
                  <Route path="/events" element={<EventList />} />
                  <Route path="/events/:eventId" element={<EventDetail />} />
                  <Route path="/traceability" element={<Traceability />} />
                  <Route path="/traceability/:eventId" element={<Traceability />} />
                  <Route path="/knowledge" element={<Knowledge />} />
                  <Route path="/pipeline" element={<Pipeline />} />
                </Route>
              </Routes>
            </Suspense>
          </HashRouter>
        </PipelineProvider>
      </AppProvider>
    </ConfigProvider>
  )
}

export default App