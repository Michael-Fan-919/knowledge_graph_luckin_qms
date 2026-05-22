import React, { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { CaseId } from '../types/entities'
import type { PipelineRunMode, PipelineStageResult, PipelineResult } from '../types/pipeline'

/** Pipeline 状态 */
interface PipelineState {
  runMode: PipelineRunMode
  speed: 1 | 2 | 5
  currentStage: number
  stageResults: PipelineStageResult[]
  pipelineResult: PipelineResult | null
  isRunning: boolean
  error: string | null
}

/** Pipeline 动作 */
type PipelineAction =
  | { type: 'START_PIPELINE'; payload: { caseId: CaseId; mode: PipelineRunMode } }
  | { type: 'ADVANCE_STAGE' }
  | { type: 'SET_SPEED'; payload: 1 | 2 | 5 }
  | { type: 'UPDATE_STAGE_RESULT'; payload: PipelineStageResult }
  | { type: 'COMPLETE_PIPELINE'; payload: PipelineResult }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET_PIPELINE' }

/** 初始状态 */
const initialState: PipelineState = {
  runMode: 'auto',
  speed: 1,
  currentStage: -1,
  stageResults: [],
  pipelineResult: null,
  isRunning: false,
  error: null,
}

/** Reducer */
function pipelineReducer(state: PipelineState, action: PipelineAction): PipelineState {
  switch (action.type) {
    case 'START_PIPELINE':
      return {
        ...state,
        isRunning: true,
        currentStage: 0,
        stageResults: [],
        pipelineResult: null,
        error: null,
        runMode: action.payload.mode,
      }
    case 'ADVANCE_STAGE':
      return {
        ...state,
        currentStage: state.currentStage + 1,
      }
    case 'SET_SPEED':
      return { ...state, speed: action.payload }
    case 'UPDATE_STAGE_RESULT':
      return {
        ...state,
        stageResults: [...state.stageResults, action.payload],
      }
    case 'COMPLETE_PIPELINE':
      return {
        ...state,
        isRunning: false,
        pipelineResult: action.payload,
        currentStage: 4,
      }
    case 'SET_ERROR':
      return {
        ...state,
        isRunning: false,
        error: action.payload,
      }
    case 'RESET_PIPELINE':
      return initialState
    default:
      return state
  }
}

/** Context 类型 */
interface PipelineContextType {
  state: PipelineState
  dispatch: React.Dispatch<PipelineAction>
  startPipeline: (caseId: CaseId, mode: PipelineRunMode) => void
  advanceStage: () => void
  setSpeed: (speed: 1 | 2 | 5) => void
  resetPipeline: () => void
}

const PipelineContext = createContext<PipelineContextType | undefined>(undefined)

/** Provider 组件 */
export const PipelineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(pipelineReducer, initialState)

  const startPipeline = (caseId: CaseId, mode: PipelineRunMode) => {
    dispatch({ type: 'START_PIPELINE', payload: { caseId, mode } })
  }

  const advanceStage = () => {
    dispatch({ type: 'ADVANCE_STAGE' })
  }

  const setSpeed = (speed: 1 | 2 | 5) => {
    dispatch({ type: 'SET_SPEED', payload: speed })
  }

  const resetPipeline = () => {
    dispatch({ type: 'RESET_PIPELINE' })
  }

  return (
    <PipelineContext.Provider
      value={{ state, dispatch, startPipeline, advanceStage, setSpeed, resetPipeline }}
    >
      {children}
    </PipelineContext.Provider>
  )
}

/** Hook */
export const usePipelineContext = (): PipelineContextType => {
  const context = useContext(PipelineContext)
  if (!context) {
    throw new Error('usePipelineContext must be used within a PipelineProvider')
  }
  return context
}