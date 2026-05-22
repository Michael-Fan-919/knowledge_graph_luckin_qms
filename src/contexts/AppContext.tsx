import React, { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { CaseId } from '../types/entities'
import type { RiskEvent } from '../types/entities'

/** 应用级状态 */
interface AppState {
  selectedCase: CaseId
  riskEvents: RiskEvent[]
  isLoading: boolean
}

/** 应用级动作 */
type AppAction =
  | { type: 'SELECT_CASE'; payload: CaseId }
  | { type: 'SET_RISK_EVENTS'; payload: RiskEvent[] }
  | { type: 'SET_LOADING'; payload: boolean }

/** 初始状态 */
const initialState: AppState = {
  selectedCase: 'persimmon',
  riskEvents: [],
  isLoading: false,
}

/** Reducer */
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SELECT_CASE':
      return { ...state, selectedCase: action.payload }
    case 'SET_RISK_EVENTS':
      return { ...state, riskEvents: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    default:
      return state
  }
}

/** Context 类型 */
interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  selectCase: (caseId: CaseId) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

/** Provider 组件 */
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const selectCase = (caseId: CaseId) => {
    dispatch({ type: 'SELECT_CASE', payload: caseId })
    // 案例切换时重置加载态
    dispatch({ type: 'SET_LOADING', payload: true })
    setTimeout(() => {
      dispatch({ type: 'SET_LOADING', payload: false })
    }, 300)
  }

  return (
    <AppContext.Provider value={{ state, dispatch, selectCase }}>
      {children}
    </AppContext.Provider>
  )
}

/** Hook */
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}