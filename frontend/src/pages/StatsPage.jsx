import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import { fetchStats } from '../api/ideas.js';
import { parseApiError } from '../utils/apiError.js';
import CountUp from '../components/CountUp.jsx';
import TiltCard from '../components/TiltCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import VoteButton from '../components/VoteButton.jsx';
import { STATUS_HEX, DOMAIN_HEX } from '../utils/constants.js';

const STAT_CARDS = (data) => [
  { label: 'Total ideas', value: data.totalIdeas, icon: '💡', tint: 'from-[var(--color-brand-1)]/20 to-[var(--color-brand-1)]/5' },
  { label: 'Total votes cast', value: data.totalVotes, icon: '🔥', tint: 'from-amber-400/25 to-amber-400/5' },
  { label: 'Implemented', value: data.byStatus.find((s) => s.key === 'Implemented')?.count ?? 0, icon: '🚀', tint: 'from-emerald-400/25 to-emerald-400/5' },
  { label: 'In review', value: data.byStatus.find((s) => s.key === 'Under Review')?.count ?? 0, icon: '👀', tint: 'from-sky-400/25 to-sky-400/5' },
];

const RANK_STYLE = ['bg-amber-100 text-amber-800 ring-amber-300', 'bg-slate-200 text-slate-700 ring-slate-300', 'bg-orange-100 text-orange-800 ring-orange-300'];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-[var(--color-ink)]">{label ?? payload[0].name}</p>
      <p className="text-[var(--color-ink-dim)]">{payload[0].value} idea{payload[0].value === 1 ? '' : 's'}</p>
    </div>
  );
}

export default function StatsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats()
      .then(({ data }) => setData(data))
      .catch((err) => setError(parseApiError(err).message));
  }, []);

  if (error) {
    return <div className="mx-auto max-w-2xl px-4 py-20 text-center text-rose-700">{error}</div>;
  }

  if (!data) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-brand-1)]" />
      </div>
    );
  }

  const statusData = data.byStatus.map((s) => ({ name: s.key, count: s.count }));
  const domainData = data.byDomain.filter((d) => d.count > 0).map((d) => ({ name: d.key, value: d.count }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-bold">
        Innovation <span className="text-gradient">dashboard</span>
      </motion.h1>
      <p className="mt-2 text-sm text-[var(--color-ink-dim)]">A live snapshot of every idea moving through the hub.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARDS(data).map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <TiltCard maxTilt={6}>
              <div className="glass relative overflow-hidden rounded-2xl p-5 shadow-lg shadow-[var(--color-ink)]/5">
                <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${card.tint} blur-xl`} />
                <div className="relative text-2xl">{card.icon}</div>
                <div className="font-display relative mt-2 text-3xl font-bold">
                  <CountUp value={card.value} />
                </div>
                <div className="relative mt-1 text-xs text-[var(--color-ink-dim)]">{card.label}</div>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold">By lifecycle stage</h2>
          <p className="text-xs text-[var(--color-ink-faint)]">How many ideas currently sit at each stage</p>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-ink-faint)' }} axisLine={{ stroke: 'var(--color-border)' }} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-ink-faint)' }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-surface-hi)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48} animationDuration={900}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_HEX[entry.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold">By domain</h2>
          <p className="text-xs text-[var(--color-ink-faint)]">Where student ideas are concentrated</p>
          <div className="mt-2 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={domainData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="55%"
                  outerRadius="85%"
                  paddingAngle={3}
                  animationDuration={900}
                >
                  {domainData.map((entry) => (
                    <Cell key={entry.name} fill={DOMAIN_HEX[entry.name]} stroke="var(--color-surface)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ color: 'var(--color-ink-dim)', fontSize: 12 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass mt-6 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Top-voted ideas</h2>
          <Link to="/trending" className="text-sm font-medium text-[var(--color-brand-1)] hover:underline">
            View all →
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-[var(--color-border)]">
          {data.topVoted.map((idea, i) => (
            <motion.li
              key={idea.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="flex items-center gap-3 py-3"
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ring-1 ${
                  RANK_STYLE[i] ?? 'bg-[var(--color-surface-hi)] text-[var(--color-ink-faint)] ring-[var(--color-border)]'
                }`}
              >
                {i + 1}
              </span>
              <Link to={`/ideas/${idea.id}`} className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--color-ink)] hover:text-[var(--color-brand-1)]">
                {idea.title}
              </Link>
              <StatusBadge status={idea.status} size="sm" />
              <VoteButton idea={idea} size="sm" />
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
