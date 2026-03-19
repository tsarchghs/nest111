import { useEffect, useState } from 'react';
import { api, type BusinessSettings } from '../api/api';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getBusinessSettings().then(setSettings).catch(console.error);
  }, []);

  if (!settings) {
    return <div className="text-sm text-slate-400">Loading settings...</div>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
      <section className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6">
        <p className="text-sm uppercase tracking-[0.28em] text-primary/80">Settings</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Business Settings</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
          Keep this page focused on commercial and operational defaults. Tenant branding
          and the SaaS look-and-feel now live in the owner studio.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-300">Legal name</span>
            <input
              value={settings.legal_name}
              onChange={(event) => setSettings({ ...settings, legal_name: event.target.value })}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-300">Trading name</span>
            <input
              value={settings.trading_name}
              onChange={(event) =>
                setSettings({ ...settings, trading_name: event.target.value })
              }
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-300">Email</span>
            <input
              value={settings.email}
              onChange={(event) => setSettings({ ...settings, email: event.target.value })}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-300">Phone</span>
            <input
              value={settings.phone}
              onChange={(event) => setSettings({ ...settings, phone: event.target.value })}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-300">Tax rate</span>
            <input
              type="number"
              step="0.01"
              value={settings.tax_rate}
              onChange={(event) =>
                setSettings({ ...settings, tax_rate: Number(event.target.value) })
              }
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-300">Invoice prefix</span>
            <input
              value={settings.invoice_prefix}
              onChange={(event) =>
                setSettings({ ...settings, invoice_prefix: event.target.value })
              }
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>

        <label className="mt-4 grid gap-2">
          <span className="text-sm font-semibold text-slate-300">Address</span>
          <textarea
            value={settings.address}
            onChange={(event) => setSettings({ ...settings, address: event.target.value })}
            className="min-h-24 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </label>

        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            const next = await api.updateBusinessSettings(settings);
            setSettings(next);
            setSaving(false);
          }}
          className="mt-6 rounded-2xl bg-primary px-5 py-4 text-sm font-bold uppercase tracking-[0.24em] text-white shadow-lg shadow-primary/25"
        >
          {saving ? 'Saving...' : 'Save settings'}
        </button>
      </section>

      <section className="space-y-4">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Billing</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight">Commercial profile</h2>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            These settings drive invoice defaults, ERP behavior, and POS checkout
            calculations across the workspace.
          </p>
        </div>
        <div className="rounded-[28px] border border-primary/20 bg-primary/10 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-primary/80">SaaS boundary</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
            Branding belongs to owners
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-200/80">
            Admins manage invoicing, tax, and contact defaults. Owners manage tenant
            identity, theme colors, and the branded login experience.
          </p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Locale</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight">{settings.locale}</h2>
          <p className="mt-4 text-sm text-slate-400">
            POS service charge: {(settings.pos_service_charge * 100).toFixed(0)}%
          </p>
        </div>
      </section>
    </div>
  );
}
