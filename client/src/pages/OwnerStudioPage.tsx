import { useEffect, useState } from 'react';
import { api, type OwnerStudioResponse } from '../api/api';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme/ThemeContext';

const heroPatterns = [
  { value: 'nordic', label: 'Nordic Glass' },
  { value: 'aurora', label: 'Aurora Flow' },
  { value: 'grid', label: 'Grid Pulse' },
  { value: 'monolith', label: 'Monolith' },
];

export default function OwnerStudioPage() {
  const [studio, setStudio] = useState<OwnerStudioResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const { setTheme } = useTheme();
  const { user, replaceUser } = useAuth();

  useEffect(() => {
    api.getOwnerStudio().then(setStudio).catch(console.error);
  }, []);

  if (!studio) {
    return <div className="text-sm text-slate-400">Loading owner studio...</div>;
  }

  const workspace = studio.workspace;
  const branding = workspace.branding;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6">
        <p className="text-sm uppercase tracking-[0.28em] text-primary/80">Owner controls</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Workspace Branding Studio</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
          This is the SaaS layer. Owners shape the tenant identity here without mixing
          branding concerns into admin business operations.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-300">Workspace name</span>
            <input
              value={workspace.name}
              onChange={(event) =>
                setStudio({
                  ...studio,
                  workspace: { ...workspace, name: event.target.value },
                })
              }
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-300">Tenant slug</span>
            <input
              value={workspace.slug}
              onChange={(event) =>
                setStudio({
                  ...studio,
                  workspace: { ...workspace, slug: event.target.value },
                })
              }
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-300">Brand name</span>
            <input
              value={branding.brandName}
              onChange={(event) =>
                setStudio({
                  ...studio,
                  workspace: {
                    ...workspace,
                    branding: { ...branding, brandName: event.target.value },
                  },
                })
              }
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-300">Industry</span>
            <input
              value={workspace.industry}
              onChange={(event) =>
                setStudio({
                  ...studio,
                  workspace: { ...workspace, industry: event.target.value },
                })
              }
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-300">Currency</span>
            <input
              value={workspace.currencyCode}
              onChange={(event) =>
                setStudio({
                  ...studio,
                  workspace: { ...workspace, currencyCode: event.target.value.toUpperCase() },
                })
              }
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm uppercase outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-300">Timezone</span>
            <input
              value={workspace.timezone}
              onChange={(event) =>
                setStudio({
                  ...studio,
                  workspace: { ...workspace, timezone: event.target.value },
                })
              }
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-300">Primary color</span>
            <input
              type="color"
              value={branding.primaryColor}
              onChange={(event) =>
                setStudio({
                  ...studio,
                  workspace: {
                    ...workspace,
                    branding: { ...branding, primaryColor: event.target.value },
                  },
                })
              }
              className="h-14 rounded-2xl border border-white/10 bg-white/5 p-2 outline-none"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-300">Accent color</span>
            <input
              type="color"
              value={branding.accentColor}
              onChange={(event) =>
                setStudio({
                  ...studio,
                  workspace: {
                    ...workspace,
                    branding: { ...branding, accentColor: event.target.value },
                  },
                })
              }
              className="h-14 rounded-2xl border border-white/10 bg-white/5 p-2 outline-none"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-300">Surface color</span>
            <input
              type="color"
              value={branding.surfaceColor}
              onChange={(event) =>
                setStudio({
                  ...studio,
                  workspace: {
                    ...workspace,
                    branding: { ...branding, surfaceColor: event.target.value },
                  },
                })
              }
              className="h-14 rounded-2xl border border-white/10 bg-white/5 p-2 outline-none"
            />
          </label>
        </div>

        <label className="mt-4 grid gap-2">
          <span className="text-sm font-semibold text-slate-300">Brand tagline</span>
          <input
            value={branding.brandTagline}
            onChange={(event) =>
              setStudio({
                ...studio,
                workspace: {
                  ...workspace,
                  branding: { ...branding, brandTagline: event.target.value },
                },
              })
            }
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </label>

        <label className="mt-4 grid gap-2">
          <span className="text-sm font-semibold text-slate-300">Login headline</span>
          <input
            value={branding.loginTitle}
            onChange={(event) =>
              setStudio({
                ...studio,
                workspace: {
                  ...workspace,
                  branding: { ...branding, loginTitle: event.target.value },
                },
              })
            }
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </label>

        <label className="mt-4 grid gap-2">
          <span className="text-sm font-semibold text-slate-300">Login narrative</span>
          <textarea
            value={branding.loginMessage}
            onChange={(event) =>
              setStudio({
                ...studio,
                workspace: {
                  ...workspace,
                  branding: { ...branding, loginMessage: event.target.value },
                },
              })
            }
            className="min-h-24 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </label>

        <label className="mt-4 grid gap-2">
          <span className="text-sm font-semibold text-slate-300">Hero pattern</span>
          <select
            value={branding.heroPattern}
            onChange={(event) =>
              setStudio({
                ...studio,
                workspace: {
                  ...workspace,
                  branding: { ...branding, heroPattern: event.target.value },
                },
              })
            }
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary"
          >
            {heroPatterns.map((pattern) => (
              <option key={pattern.value} value={pattern.value}>
                {pattern.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              const next = await api.updateOwnerStudio({
                name: workspace.name,
                slug: workspace.slug,
                industry: workspace.industry,
                currencyCode: workspace.currencyCode,
                timezone: workspace.timezone,
                branding,
              });
              setStudio(next);
              setTheme(next.workspace.branding);
              if (user) {
                replaceUser({ ...user, workspace: next.workspace });
              }
            } finally {
              setSaving(false);
            }
          }}
          className="mt-6 rounded-2xl bg-primary px-5 py-4 text-sm font-bold uppercase tracking-[0.24em] text-white shadow-lg shadow-primary/25"
        >
          {saving ? 'Saving studio...' : 'Publish tenant theme'}
        </button>
      </section>

      <section className="space-y-4">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Tenant health</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Branches</p>
              <p className="mt-2 text-3xl font-black">{studio.stats.branches}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Members</p>
              <p className="mt-2 text-3xl font-black">{studio.stats.activeMembers}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Accounts</p>
              <p className="mt-2 text-3xl font-black">{studio.stats.bankAccounts}</p>
            </div>
          </div>
        </div>

        <div
          className={`login-stage login-stage--${branding.heroPattern} overflow-hidden rounded-[28px] border border-white/10 p-6`}
          style={{
            backgroundColor: `${branding.surfaceColor}cc`,
            boxShadow: `0 20px 80px ${branding.primaryColor}22`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/55" />
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.25em] text-white/60">Live preview</p>
            <div className="mt-4 flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-black tracking-[0.2em] text-slate-950"
                style={{ backgroundColor: branding.primaryColor }}
              >
                G
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/50">Gambit</p>
                <h2 className="text-2xl font-black text-white">{branding.brandName}</h2>
              </div>
            </div>
            <h3 className="mt-8 max-w-md text-3xl font-black leading-tight text-white">
              {branding.loginTitle}
            </h3>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/75">
              {branding.loginMessage}
            </p>
            <div className="mt-6 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
              {studio.business.trading_name} • {workspace.slug}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
