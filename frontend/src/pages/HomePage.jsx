import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchStats, fetchIdeas } from '../api/ideas.js';
import { useAuth } from '../context/AuthContext.jsx';
import CountUp from '../components/CountUp.jsx';
import IdeaCard from '../components/IdeaCard.jsx';
import CardSkeleton from '../components/CardSkeleton.jsx';

const FEATURES = [
  {
    icon: '💡',
    title: 'Submit real ideas',
    body: 'Turn a campus frustration into a structured proposal -- problem, domain, tech stack, and expected impact.',
  },
  {
    icon: '🗳️',
    title: 'Vote what matters',
    body: 'One vote per idea keeps signal honest. The best ideas rise to the top of Trending automatically.',
  },
  {
    icon: '🚀',
    title: 'Track the journey',
    body: 'Every idea moves through a visible lifecycle from Submitted to Implemented -- no black box.',
  },
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    fetchStats().then(({ data }) => setStats(data)).catch(() => {});
    fetchIdeas({ sort: 'votes', limit: 3 }).then(({ data }) => setFeatured(data)).catch(() => {});
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden px-4 pb-20 pt-20 sm:px-6 lg:px-8">
        <motion.div
          aria-hidden
          className="animate-float pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[var(--color-brand-1)]/20 blur-3xl"
        />
        <motion.div
          aria-hidden
          className="animate-float pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-[var(--color-brand-3)]/20 blur-3xl"
          style={{ animationDelay: '2s' }}
        />

        <div className="relative mx-auto max-w-4xl text-center">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-[var(--color-ink-dim)]"
          >
            <span className="h-1.5 w-1.5 animate-pulse-slow rounded-full bg-emerald-400" />
            Live on campus right now
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display mt-6 text-4xl font-extrabold leading-tight sm:text-6xl"
          >
            Where campus ideas
            <br />
            become <span className="text-gradient">real change</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-5 max-w-xl text-base text-[var(--color-ink-dim)] sm:text-lg"
          >
            Submit solutions to real problems, rally votes behind the best ones, and watch them move from a
            rough idea to something implemented on campus.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              to="/ideas"
              className="rounded-xl bg-gradient-to-r from-[var(--color-brand-1)] to-[var(--color-brand-2)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--color-brand-1)]/20 transition-transform hover:-translate-y-0.5"
            >
              Explore ideas
            </Link>
            <Link
              to={isAuthenticated ? '/submit' : '/register'}
              className="glass rounded-xl px-6 py-3 text-sm font-semibold text-[var(--color-ink)] transition-transform hover:-translate-y-0.5"
            >
              {isAuthenticated ? 'Submit an idea' : 'Get started free'}
            </Link>
          </motion.div>

          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mx-auto mt-14 grid max-w-lg grid-cols-3 gap-4"
            >
              {[
                { label: 'Ideas submitted', value: stats.totalIdeas },
                { label: 'Votes cast', value: stats.totalVotes },
                { label: 'Implemented', value: stats.byStatus.find((s) => s.key === 'Implemented')?.count ?? 0 },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-display text-gradient text-3xl font-bold">
                    <CountUp value={s.value} />
                  </div>
                  <div className="mt-1 text-xs text-[var(--color-ink-faint)]">{s.label}</div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-6"
            >
              <div className="text-3xl">{f.icon}</div>
              <h3 className="font-display mt-3 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-dim)]">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold">
            🔥 Trending <span className="text-gradient">right now</span>
          </h2>
          <Link to="/trending" className="text-sm font-medium text-[var(--color-brand-1)] hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {featured
            ? featured.map((idea) => <IdeaCard key={idea.id} idea={idea} />)
            : Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </section>
    </div>
  );
}
