export default function StatCard({ label, value, Icon, colorClass, bgClass, className = '' }) {
  return (
    <div className={`bg-surface rounded-base shadow-sm p-4 flex flex-col gap-3 ${className}`}>
      <div className={`${bgClass} ${colorClass} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="font-heading text-3xl font-bold text-text leading-none">{value}</p>
        <p className="font-body text-xs text-text-muted mt-1.5 leading-snug">{label}</p>
      </div>
    </div>
  )
}
