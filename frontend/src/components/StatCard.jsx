import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, change, compare = 'vs last month', tone = 'mint', trend = 'up', note }) {
  const isDown = trend === 'down';
  return (
    <article className="stat-card">
      <div className="stat-topline">
        <span className={`stat-icon icon-${tone}`}>{Icon && <Icon size={18} strokeWidth={1.8} />}</span>
        {change && <span className={`stat-change ${isDown ? 'change-down' : ''}`}>{isDown ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}{change}</span>}
      </div>
      <p className="stat-label">{label}</p>
      <div className="stat-value-row"><h3>{value}</h3>{note && <span className="stat-note">{note}</span>}</div>
      {compare && <p className="stat-compare">{compare}</p>}
    </article>
  );
}
