import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import IdeaFeedPage from './pages/IdeaFeedPage.jsx';
import IdeaDetailPage from './pages/IdeaDetailPage.jsx';
import SubmitIdeaPage from './pages/SubmitIdeaPage.jsx';
import EditIdeaPage from './pages/EditIdeaPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import BookmarksPage from './pages/BookmarksPage.jsx';
import TrendingPage from './pages/TrendingPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// recharts pulls in a sizeable chart engine that only the dashboard needs --
// split it into its own chunk so every other route stays light.
const StatsPage = lazy(() => import('./pages/StatsPage.jsx'));

const PageFallback = () => (
  <div className="grid min-h-[50vh] place-items-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-brand-1)]" />
  </div>
);

// Each page animates its own entrance (see the motion.div wrappers inside
// them), so routing itself stays a plain swap -- wrapping <Routes> in
// AnimatePresence looked nicer on paper but its exit choreography can hang
// when a new route's data-fetching effect fires before the old page finishes
// exiting, permanently blocking the new page from ever mounting.
export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ideas" element={<IdeaFeedPage />} />
        <Route path="/ideas/:id" element={<IdeaDetailPage />} />
        <Route path="/trending" element={<TrendingPage />} />
        <Route
          path="/stats"
          element={
            <Suspense fallback={<PageFallback />}>
              <StatsPage />
            </Suspense>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/submit" element={<SubmitIdeaPage />} />
          <Route path="/edit/:id" element={<EditIdeaPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}
