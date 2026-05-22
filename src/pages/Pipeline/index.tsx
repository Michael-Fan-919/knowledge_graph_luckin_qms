import React, { useState, useCallback } from 'react'
import { Card, Button, Space, Steps, Typography, Row, Col, Select, Tag, Statistic, Progress, Descriptions, Table, Alert } from 'antd'
import {
  PlayCircleOutlined,
  ReloadOutlined,
  ImportOutlined,
  ClearOutlined,
  FileSearchOutlined,
  BarChartOutlined,
  ApartmentOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { useAppContext } from '../../contexts/AppContext'
import { runPipeline } from '../../core/pipeline/PipelineEngine'
import { PIPELINE_STAGES } from '../../types/pipeline'
import type { PipelineStageResult, PipelineResult } from '../../types/pipeline'
import { RISK_LEVEL_CONFIG } from '../../types/risk'
import RiskLevelTag from '../../components/Common/RiskLevelTag'
import type { RiskLevel } from '../../types/risk'

const { Title, Text } = Typography

const stageIcons = [
  <ImportOutlined />,
  <ClearOutlined />,
  <FileSearchOutlined />,
  <BarChartOutlined />,
  <ApartmentOutlined />,
]

const Pipeline: React.FC = () => {
  const { state: appState } = useAppContext()
  const [isRunning, setIsRunning] = useState(false)
  const [currentStage, setCurrentStage] = useState(-1)
  const [stageResults, setStageResults] = useState<PipelineStageResult[]>([])
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null)

  const handleRunPipeline = useCallback(async () => {
    setIsRunning(true)
    setCurrentStage(0)
    setStageResults([])
    setPipelineResult(null)

    const onStageComplete = (stageIndex: number, result: PipelineStageResult) => {
      setCurrentStage(stageIndex)
      setStageResults((prev) => [...prev, result])
    }

    try {
      const result = await runPipeline(appState.selectedCase, onStageComplete)
      setPipelineResult(result)
      setCurrentStage(4)
    } catch (error) {
      console.error('Pipeline error:', error)
    } finally {
      setIsRunning(false)
    }
  }, [appState.selectedCase])

  const handleReset = () => {
    setCurrentStage(-1)
    setStageResults([])
    setPipelineResult(null)
    setIsRunning(false)
  }

  const aggregationResult = stageResults[3]?.details?.aggregation
  const nlpDetails = stageResults[2]?.details

  const sentimentPieOption = nlpDetails?.sentiment_distribution
    ? {
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { bottom: 0 },
        series: [{
          type: 'pie',
          radius: ['30%', '60%'],
          data: [
            { value: nlpDetails.sentiment_distribution.negative, name: '负面', itemStyle: { color: '#F5222D' } },
            { value: nlpDetails.sentiment_distribution.neutral, name: '中性', itemStyle: { color: '#FADB14' } },
            { value: nlpDetails.sentiment_distribution.positive, name: '正面', itemStyle: { color: '#52C41A' } },
          ],
          emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.3)' } },
        }],
      }
    : null

  const riskMatrixOption = aggregationResult?.risk_score_breakdown
    ? {
        tooltip: {},
        xAxis: { type: 'category', data: ['负面占比', '门店数', '严重性'] },
        yAxis: { type: 'value', max: 4 },
        series: [{
          type: 'bar',
          data: [
            { value: aggregationResult.risk_score_breakdown.negative_ratio_score, itemStyle: { color: '#F5222D' } },
            { value: aggregationResult.risk_score_breakdown.store_count_score, itemStyle: { color: '#FA8C16' } },
            { value: aggregationResult.risk_score_breakdown.severity_score, itemStyle: { color: '#722ED1' } },
          ],
          label: { show: true, position: 'top' },
        }],
      }
    : null

  const caseLabel = appState.selectedCase === 'coconut' ? '椰子果肉氧化变紫' :
    appState.selectedCase === 'persimmon' ? '好柿成双涩味异常' : '苹果鲜奶絮状物'

  return (
    <div className="fade-in-up">
      <Title level={2}>数据处理流水线</Title>

      {/* Control Panel */}
      <Card size="small" style={{ marginBottom: 16 }} className="card-hover-lift">
        <Space>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleRunPipeline}
            loading={isRunning}
            disabled={isRunning}
            size="large"
          >
            一键运行 Pipeline
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset} disabled={isRunning}>
            重置
          </Button>
          <Tag color="blue" style={{ fontSize: 13, padding: '4px 12px' }}>
            案例: {caseLabel}
          </Tag>
        </Space>
      </Card>

      {/* Pipeline Flow with animation */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Steps
          current={currentStage}
          status={currentStage === 4 && pipelineResult ? 'finish' : isRunning ? 'process' : 'wait'}
          items={PIPELINE_STAGES.map((stage, index) => ({
            title: stage.label,
            description: stageResults[index]
              ? `${stageResults[index].duration_ms}ms | ${stageResults[index].input_count}→${stageResults[index].output_count}`
              : stage.description,
            icon: isRunning && currentStage === index
              ? <LoadingOutlined className="pipeline-stage-active" />
              : stageResults[index]
                ? <CheckCircleOutlined style={{ color: '#52C41A' }} />
                : stageIcons[index],
          }))}
        />
      </Card>

      {/* Stage Details with animation */}
      {stageResults.length > 0 && (
        <Card title="阶段执行结果" size="small" style={{ marginBottom: 16 }} className="fade-in-up">
          <Table
            size="small"
            pagination={false}
            dataSource={stageResults.map((r, i) => ({
              key: i,
              stage: PIPELINE_STAGES[i].label,
              status: r.status,
              input: r.input_count,
              output: r.output_count,
              duration: `${r.duration_ms}ms`,
              noise: r.noise_filtered_count || '-',
            }))}
            columns={[
              { title: '阶段', dataIndex: 'stage', key: 'stage' },
              { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'completed' ? 'green' : 'red'}>{s}</Tag> },
              { title: '输入', dataIndex: 'input', key: 'input' },
              { title: '输出', dataIndex: 'output', key: 'output' },
              { title: '耗时', dataIndex: 'duration', key: 'duration' },
              { title: '噪音过滤', dataIndex: 'noise', key: 'noise' },
            ]}
          />
        </Card>
      )}

      <Row gutter={16}>
        <Col span={12}>
          {/* Sentiment Distribution */}
          {sentimentPieOption && (
            <Card title="情感分布" size="small" style={{ marginBottom: 16 }} className="fade-in-up fade-in-up-delay-1">
              <ReactECharts option={sentimentPieOption} style={{ height: 250 }} />
            </Card>
          )}

          {/* Risk Matrix */}
          {riskMatrixOption && (
            <Card title="风险评分矩阵" size="small" className="fade-in-up fade-in-up-delay-2">
              <ReactECharts option={riskMatrixOption} style={{ height: 250 }} />
            </Card>
          )}
        </Col>

        <Col span={12}>
          {/* Keyword Cloud */}
          {nlpDetails?.top_keywords && (
            <Card title="关键词云" size="small" style={{ marginBottom: 16 }} className="fade-in-up fade-in-up-delay-1">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 16 }}>
                {nlpDetails.top_keywords.map((kw: any, idx: number) => {
                  const size = Math.min(12 + kw.count * 3, 28)
                  const colors = ['#F5222D', '#FA8C16', '#FADB14', '#52C41A', '#1890ff', '#722ED1', '#EB2F96']
                  return (
                    <Tag
                      key={kw.word}
                      color={colors[idx % colors.length]}
                      style={{ fontSize: size, padding: '4px 12px', borderRadius: 8 }}
                    >
                      {kw.word} ({kw.count})
                    </Tag>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Aggregation Result */}
          {aggregationResult && (
            <Card title="聚合分析结果" size="small" style={{ marginBottom: 16 }} className="fade-in-up fade-in-up-delay-2">
              <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label="产品">{aggregationResult.product_name}</Descriptions.Item>
                <Descriptions.Item label="总反馈">{aggregationResult.total_feedback}</Descriptions.Item>
                <Descriptions.Item label="负面率">
                  <Progress
                    percent={Math.round(aggregationResult.negative_ratio * 100)}
                    size="small"
                    status={aggregationResult.negative_ratio > 0.5 ? 'exception' : 'normal'}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="影响门店">{aggregationResult.affected_stores.length} 家</Descriptions.Item>
                <Descriptions.Item label="风险等级">
                  <RiskLevelTag level={aggregationResult.suggested_risk_level as RiskLevel} />
                </Descriptions.Item>
                <Descriptions.Item label="风险评分">
                  <Statistic
                    value={aggregationResult.risk_score}
                    suffix="/ 12"
                    valueStyle={{
                      fontSize: 18,
                      color: RISK_LEVEL_CONFIG[aggregationResult.suggested_risk_level as RiskLevel]?.color,
                    }}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="生成事件" span={2}>
                  <Tag color={aggregationResult.should_generate_event ? 'red' : 'green'}>
                    {aggregationResult.should_generate_event ? '是 - 需要生成风险事件' : '否 - 风险可控'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {/* Pipeline Summary */}
          {pipelineResult && (
            <Card title="Pipeline 运行总结" size="small" className="fade-in-up fade-in-up-delay-3">
              <Alert
                message="Pipeline 运行完成"
                description={`处理 ${pipelineResult.total_feedback_processed} 条反馈，过滤 ${pipelineResult.total_noise_filtered} 条噪音`}
                type="success"
                showIcon
                style={{ marginBottom: 12 }}
              />
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="运行ID">{pipelineResult.run_id}</Descriptions.Item>
                <Descriptions.Item label="案例">{pipelineResult.case_id}</Descriptions.Item>
                <Descriptions.Item label="总反馈处理">{pipelineResult.total_feedback_processed} 条</Descriptions.Item>
                <Descriptions.Item label="噪音过滤">{pipelineResult.total_noise_filtered} 条</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color="green" icon={<CheckCircleOutlined />}>完成</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  )
}

export default Pipeline