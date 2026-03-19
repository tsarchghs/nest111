import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme/ThemeContext';

const demoUsers = [
  { label: 'Owner', email: 'owner@nexus.local', role: 'All areas' },
  { label: 'ERP', email: 'erp@nexus.local', role: 'ERP only' },
  { label: 'Admin', email: 'admin@nexus.local', role: 'Administration only' },
  { label: 'POS', email: 'pos@nexus.local', role: 'POS only' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, login, defaultRoute } = useAuth();
  const { theme } = useTheme();
  const [email, setEmail] = useState('owner@nexus.local');
  const [password, setPassword] = useState('Passw0rd!');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to={defaultRoute} replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className={`video-background login-stage login-stage--${theme.heroPattern}`} />
      <div className="login-overlay" />

      <div className="container relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-6 px-4 py-8 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
        <section className="login-form w-full max-w-none p-8 text-white md:p-10">
          <div className="mb-10 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
              <span className="text-2xl font-black tracking-[0.22em] text-slate-950">G</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Gambit</p>
              <h1 className="text-2xl font-black tracking-tight">Gambit LLC</h1>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/90">
              SaaS commerce operating system
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
              {theme.loginTitle}
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
              {theme.loginMessage}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
              Tenant: {theme.brandName}
            </div>
            <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
              {theme.brandTagline}
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {demoUsers.map((demo) => (
              <button
                key={demo.email}
                type="button"
                onClick={() => {
                  setEmail(demo.email);
                  setPassword('Passw0rd!');
                }}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-primary/50 hover:bg-primary/10"
              >
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  {demo.role}
                </p>
                <h3 className="mt-2 text-lg font-bold">{demo.label}</h3>
                <p className="mt-2 text-sm text-slate-300">{demo.email}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-slate-50/95 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl md:p-10">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
              Sign in
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
              Access your Gambit workspace
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Use one of the seeded demo accounts or your assigned Supabase email and
              password. Owners can reach the tenant SaaS studio in addition to ERP, admin,
              and POS.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                type="email"
                placeholder="name@company.com"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                type="password"
              />
            </label>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-sm font-bold uppercase tracking-[0.24em] text-white shadow-lg shadow-primary/25 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="material-symbols-outlined text-xl">login</span>
              {submitting ? 'Signing in' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
              Default password
            </p>
            <p className="mt-2 text-lg font-bold text-slate-900">Passw0rd!</p>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Guarded routing is enforced after sign-in. POS users stay in POS, ERP users
              stay in ERP, admins stay in administration, and owners get the SaaS studio.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
