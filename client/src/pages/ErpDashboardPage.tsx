import { useEffect, useState } from 'react';
import { api, formatCurrency, type DashboardOverview } from '../api/api';

export default function ErpDashboardPage() {
  const [data, setData] = useState<DashboardOverview | null>(null);

  useEffect(() => {
    api.getErpOverview().then(setData).catch(console.error);
  }, []);

  if (!data) {
    return <div className="text-sm text-slate-400">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-primary/80">Overview</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Dashboard Overview</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => (
          <div
            key={metric.label}
            className="metric-tile rounded-[28px] border border-white/10 bg-white/5 p-6"
          >
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
              {metric.label}
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight">{metric.value}</h2>
            <p className="mt-3 text-sm text-slate-400">{metric.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Sales</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight">Recent invoices</h2>
          <div className="mt-5 space-y-3">
            {data.recentSales.map((invoice) => (
              <div
                key={invoice.id}
                className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {invoice.invoice_number}
                  </p>
                  <h3 className="mt-1 text-lg font-bold">{invoice.customer_name}</h3>
                  <p className="text-sm text-slate-400">{invoice.customer_email}</p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                    {invoice.status}
                  </span>
                  <p className="mt-3 text-2xl font-black">
                    {formatCurrency(invoice.total_amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Inventory</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight">Top stocked items</h2>
            <div className="mt-5 space-y-3">
              {data.topProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{product.name}</h3>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        {product.sku}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-emerald-300">
                      {product.stock_quantity} units
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Branches</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight">Live branches</h2>
            <div className="mt-5 space-y-3">
              {data.branches.map((branch) => (
                <div
                  key={branch.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{branch.name}</h3>
                      <p className="text-sm text-slate-400">{branch.city}</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                      {branch.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
