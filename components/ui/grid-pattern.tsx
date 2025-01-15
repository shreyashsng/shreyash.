import { useId } from 'react'

interface GridPatternProps {
  width?: number
  height?: number
  strokeDasharray?: string
  className?: string
}

export function GridPattern({
  width = 40,
  height = 40,
  strokeDasharray = "4 2",
  className,
}: GridPatternProps) {
  const id = useId()

  return (
    <svg
      className={className}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id={`grid-${id}`}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
        >
          {/* Vertical lines */}
          <path
            d={`M ${width} 0 L ${width} ${height}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray={strokeDasharray}
          />
          {/* Horizontal lines */}
          <path
            d={`M 0 ${height} L ${width} ${height}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill={`url(#grid-${id})`} />
    </svg>
  )
} 