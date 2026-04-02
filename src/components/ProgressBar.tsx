interface ProgressBarProps {
  progress: number
  color?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, color = '#ffffff' }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: '100%',
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.12)',
      }}
    >
      <div
        style={{
          width: `${Math.max(0, Math.min(progress, 1)) * 100}%`,
          height: '100%',
          backgroundColor: color,
        }}
      />
    </div>
  )
}
