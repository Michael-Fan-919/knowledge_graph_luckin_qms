import React from 'react'

interface MiniGraphProps {
  data?: any
  width?: number
  height?: number
}

const MiniGraph: React.FC<MiniGraphProps> = ({ width = 400, height = 300 }) => {
  return (
    <div
      className="g6-container"
      style={{ width, height, border: '1px solid #d9d9d9', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <span style={{ color: 'rgba(0,0,0,0.25)' }}>Mini Graph Placeholder</span>
    </div>
  )
}

export default MiniGraph