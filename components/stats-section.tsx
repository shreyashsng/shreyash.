interface StatItemProps {
  label: string
  value: string
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <div>
      <h3 className="text-blue-400">{label}</h3>
      <p className="text-gray-400">{value}</p>
    </div>
  )
}

export function StatsSection() {
  const stats = [
    { label: 'Work', value: '12 projects' },
    { label: 'Timeline', value: '24 entries' },
    { label: 'Videos', value: '88 entries' },
    { label: 'About', value: '3 years' },
  ]

  return (
    <div className="mt-16 border-t border-gray-800 pt-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatItem key={stat.label} {...stat} />
        ))}
      </div>
    </div>
  )
} 