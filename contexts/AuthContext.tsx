import { createContext, useContext, ReactNode, useEffect, useState, useMemo } from 'react';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** True when there is no session (user can browse as guest). */
  isGuest: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 5000);

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        clearTimeout(timeout);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch(() => {
        clearTimeout(timeout);
        setLoading(false);
        // error swallowed — handle in UI
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' || !user?.id) return;
    let cancelled = false;
    void (async () => {
      const { registerForPushNotificationsAsync } = await import('@/lib/notifications');
      const { trpcMutate } = await import('@/lib/trpc');
      const { TRPC } = await import('@/lib/trpc-paths');
      const token = await registerForPushNotificationsAsync();
      if (cancelled || !token) return;
      try {
        await trpcMutate(TRPC.profiles.updatePushToken, { pushToken: token });
        await trpcMutate(TRPC.notifications.registerToken, { token });
      } catch {
        /* non-fatal */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const isGuest = !user;
  const contextValue = useMemo(
    () => ({ user, session, loading, isGuest }),
    [user, session, loading, isGuest]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
