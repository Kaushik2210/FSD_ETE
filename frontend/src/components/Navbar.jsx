import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';

const LINKS = [
  { to: '/ideas', label: 'Explore' },
  { to: '/trending', label: 'Trending' },
  { to: '/stats', label: 'Dashboard' },
];

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'text-white' : 'text-[var(--color-ink-dim)] hover:text-white'
  }`;

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="font-display flex items-center gap-2 text-lg font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[var(--color-brand-1)] to-[var(--color-brand-3)] text-sm text-white">
            💡
          </span>
          <span className="hidden sm:inline">
            Campus <span className="text-gradient">Idea Hub</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated && (
            <NavLink to="/bookmarks" className={linkClass}>
              Bookmarks
            </NavLink>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Link
                to="/submit"
                className="rounded-xl bg-gradient-to-r from-[var(--color-brand-1)] to-[var(--color-brand-2)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                + Submit Idea
              </Link>
              <div className="flex items-center gap-2 rounded-xl bg-[var(--color-surface-hi)] py-1.5 pl-1.5 pr-3 ring-1 ring-[var(--color-border)]">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-[var(--color-brand-2)] to-[var(--color-brand-1)] text-xs font-bold text-white">
                  {user?.name?.[0]?.toUpperCase() ?? '?'}
                </span>
                <span className="max-w-[8rem] truncate text-sm text-[var(--color-ink-dim)]">{user?.name}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="ml-1 text-xs font-medium text-[var(--color-ink-faint)] hover:text-rose-300"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 text-sm font-medium text-[var(--color-ink-dim)] hover:text-white">
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-gradient-to-r from-[var(--color-brand-1)] to-[var(--color-brand-2)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="grid h-10 w-10 place-items-center rounded-lg text-[var(--color-ink)] ring-1 ring-[var(--color-border)] md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[var(--color-border)] md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)} className={linkClass}>
                  {link.label}
                </NavLink>
              ))}
              {isAuthenticated && (
                <NavLink to="/bookmarks" onClick={() => setOpen(false)} className={linkClass}>
                  Bookmarks
                </NavLink>
              )}

              <div className="mt-3 flex flex-col gap-2 border-t border-[var(--color-border)] pt-3">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/submit"
                      onClick={() => setOpen(false)}
                      className="rounded-xl bg-gradient-to-r from-[var(--color-brand-1)] to-[var(--color-brand-2)] px-4 py-2.5 text-center text-sm font-semibold text-white"
                    >
                      + Submit Idea
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-xl px-4 py-2.5 text-center text-sm font-medium text-rose-300 ring-1 ring-[var(--color-border)]"
                    >
                      Logout ({user?.name})
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-center text-sm font-medium text-[var(--color-ink-dim)] ring-1 ring-[var(--color-border)]">
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setOpen(false)}
                      className="rounded-xl bg-gradient-to-r from-[var(--color-brand-1)] to-[var(--color-brand-2)] px-4 py-2.5 text-center text-sm font-semibold text-white"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
