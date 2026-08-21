import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fetchStats } from '../api/ideas.js';
import { parseApiError } from '../utils/apiError.js';
import CountUp from '../components/CountUp.jsx';
import BarList from '../components/BarList.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import VoteButton from '../components/VoteButton.jsx';

const STAT_CARDS = (data) => [
  { label: 'Total ideas', value: data.totalIdeas, icon: '💡' },
  { label: 'Total votes cast', value: data.totalVotes, icon: '🔥' },
  { label: 'Implemented', value: data.byStatus.find((s) => s.key === 'Implemented')?.count ?? 0, icon: '🚀' },
  { label: 'In review', value: data.byStatus.find((s) => s.key === 'Under Review')?.count ?? 0, icon: '👀' },
];

export default function StatsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats()
      .then(({ data }) => setData(data))
      .catch((err) => setError(parseApiError(err).message));
  }, []);

  if (error) {
    return <div className="mx-auto max-w-2xl px-4 py-20 text-center text-rose-300">{error}</div>;
  }

  if (!data) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-brand-1)]" />
      </div>
    );
  }

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
            className="glass rounded-2xl p-5"
          >
            <div className="text-2xl">{card.icon}</div>
            <div className="font-display mt-2 text-3xl font-bold">
              <CountUp value={card.value} />
            </div>
            <div className="mt-1 text-xs text-[var(--color-ink-dim)]">{card.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold">By lifecycle stage</h2>
          <div className="mt-5">
            <BarList items={data.byStatus.map((s) => ({ key: s.key, count: s.count }))} colorClass="bg-gradient-to-r from-[var(--color-brand-1)] to-[var(--color-brand-3)]" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold">By domain</h2>
          <div className="mt-5">
            <BarList items={data.byDomain.map((d) => ({ key: d.key, count: d.count }))} colorClass="bg-gradient-to-r from-[var(--color-brand-2)] to-[var(--color-brand-1)]" />
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
            <li key={idea.id} className="flex items-center gap-3 py-3">
              <span className="font-display w-6 text-center text-sm font-bold text-[var(--color-ink-faint)]">{i + 1}</span>
              <Link to={`/ideas/${idea.id}`} className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--color-ink)] hover:text-white">
                {idea.title}
              </Link>
              <StatusBadge status={idea.status} size="sm" />
              <VoteButton idea={idea} size="sm" />
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
