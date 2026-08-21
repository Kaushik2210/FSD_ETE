import { useCallback, useEffect, useState } from 'react';
import { toggleBookmarkApi } from '../api/auth.js';
import { useAuth } from '../context/AuthContext.jsx';

const LOCAL_KEY = 'cih_bookmarks';

const readLocal = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'));
  } catch {
    return new Set();
  }
};

const writeLocal = (set) => localStorage.setItem(LOCAL_KEY, JSON.stringify([...set]));

/**
 * Bookmarks are readable for anonymous visitors (stored only in localStorage)
 * but persisted server-side for logged-in users so they survive a device
 * switch. On login, the user's server-side list is treated as the source of
 * truth and mirrored into localStorage for instant reads elsewhere in the UI.
 */
export function useBookmarks() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [bookmarks, setBookmarks] = useState(readLocal);

  useEffect(() => {
    if (isAuthenticated && user?.bookmarkedIdeas) {
      const fromServer = new Set(user.bookmarkedIdeas.map(String));
      setBookmarks(fromServer);
      writeLocal(fromServer);
    }
  }, [isAuthenticated, user]);

  const toggle = useCallback(
    async (ideaId) => {
      const next = new Set(bookmarks);
      const wasBookmarked = next.has(ideaId);
      wasBookmarked ? next.delete(ideaId) : next.add(ideaId);
      setBookmarks(next); // optimistic
      writeLocal(next);

      if (!isAuthenticated) return; // anonymous users only get localStorage

      try {
        const { data } = await toggleBookmarkApi(ideaId);
        updateUser({ ...user, bookmarkedIdeas: data.bookmarkedIdeas });
      } catch {
        // Roll back on failure so the UI never lies about server state.
        setBookmarks(bookmarks);
        writeLocal(bookmarks);
      }
    },
    [bookmarks, isAuthenticated, updateUser, user]
  );

  const isBookmarked = useCallback((ideaId) => bookmarks.has(ideaId), [bookmarks]);

  return { bookmarks, isBookmarked, toggle };
}
