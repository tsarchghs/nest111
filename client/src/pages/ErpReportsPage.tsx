import { useEffect, useState } from 'react';
import { api, type ReportsResponse } from '../api/api';

export default function ErpReportsPage() {
  const [reports, setReports] = useState<ReportsResponse | null>(null);

  useEffect(() => {
    api.getReports().then(setReports).catch(console.error);
  }, []);

  if (!reports) {
    return <div className="text-sm text-slate-400">Loading analytics...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-primary/80">Analytics</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Detailed Reports</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6">
          <h2 className="text-2xl font-black tracking-tight">Revenue series</h2>
          {reports.hasRevenue ? (
            <div className="mt-6 space-y-4">
              {reports.revenueSeries.map((entry) => (
                <div key={entry.month}>
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
                    <span>{entry.month}</span>
                    <span>${entry.total.toFixed(2)}</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/10">
                    <div
                      className="h-3 rounded-full bg-primary"
                      style={{ width: `${Math.max(12, Math.min(100, entry.total / 8))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-white/15 bg-white/5 p-8 text-sm text-slate-400">
              No revenue history yet.
            </div>
          )}
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-black tracking-tight">Category mix</h2>
          <div className="mt-6 space-y-4">
            {reports.categoryBreakdown.map((entry) => (
              <div key={entry.category}>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
                  <span>{entry.category}</span>
                  <span>{entry.count} items</span>
                </div>
                <div className="h-3 rounded-full bg-white/10">
                  <div
                    className="h-3 rounded-full bg-emerald-400"
                    style={{ width: `${Math.max(8, entry.count * 18)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-black tracking-tight">Inventory alerts</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reports.inventoryAlerts.map((product) => (
            <div
              key={product.id}
              className="rounded-3xl border border-amber-400/20 bg-amber-500/10 p-5"
            >
              <p className="text-xs uppercase tracking-[0.25em] text-amber-200/70">
                Reorder required
              </p>
              <h3 className="mt-3 text-xl font-bold">{product.name}</h3>
              <p className="mt-2 text-sm text-amber-100/75">{product.sku}</p>
              <div className="mt-4 flex items-center justify-between text-sm text-amber-100">
                <span>Stock {product.stock_quantity}</span>
                <span>Threshold {product.reorder_level}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
