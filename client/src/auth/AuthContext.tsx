import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, sessionStore, type AppArea, type AuthUser } from '../api/api';

type AuthContextValue = {
  loading: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  canAccess: (area: AppArea) => boolean;
  defaultRoute: string;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getDefaultRoute(user: AuthUser | null) {
  if (!user) {
    return '/login';
  }

  if (user.allowedAreas.includes('erp')) {
    return '/erp/dashboard';
  }

  if (user.allowedAreas.includes('admin')) {
    return '/admin/branches';
  }

  return '/pos/floor';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = sessionStore.load();
    if (!stored) {
      setLoading(false);
      return;
    }

    api
      .getMe()
      .then((currentUser) => {
        sessionStore.save({ ...stored, user: currentUser });
        setUser(currentUser);
      })
      .catch(() => {
        sessionStore.clear();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      user,
      async login(email, password) {
        const session = await api.login(email, password);
        sessionStore.save(session);
        setUser(session.user);
      },
      logout() {
        sessionStore.clear();
        setUser(null);
      },
      canAccess(area) {
        return user?.allowedAreas.includes(area) ?? false;
      },
      defaultRoute: getDefaultRoute(user),
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
