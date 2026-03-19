import { useEffect, useMemo, useState } from 'react';
import {
  api,
  formatCurrency,
  type CatalogResponse,
  type SalesResponse,
} from '../api/api';

type DraftLine = {
  product_id: string;
  description: string;
  quantity: number;
  unit_price: number;
};

export default function ErpSalesPage() {
  const [sales, setSales] = useState<SalesResponse | null>(null);
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [customerName, setCustomerName] = useState('Acme Hospitality');
  const [customerEmail, setCustomerEmail] = useState('ops@acme.local');
  const [status, setStatus] = useState('draft');
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('Prepared from ERP sales form.');
  const [lines, setLines] = useState<DraftLine[]>([]);

  const load = async () => {
    const [salesResponse, catalogResponse] = await Promise.all([
      api.getSales(),
      api.getCatalog(),
    ]);
    setSales(salesResponse);
    setCatalog(catalogResponse);
    if (catalogResponse.products[0] && lines.length === 0) {
      const first = catalogResponse.products[0];
      setLines([
        {
          product_id: first.id,
          description: first.name,
          quantity: 4,
          unit_price: first.price,
        },
      ]);
    }
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity * line.unit_price, 0),
    [lines],
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  if (!sales || !catalog) {
    return <div className="text-sm text-slate-400">Loading sales...</div>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
      <section className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6">
        <p className="text-sm uppercase tracking-[0.28em] text-primary/80">Invoicing</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">New Sale Invoice</h1>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-300">Customer name</span>
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-300">Customer email</span>
            <input
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-300">Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-300">Due date</span>
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>

        <label className="mt-4 grid gap-2">
          <span className="text-sm font-semibold text-slate-300">Notes</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="min-h-24 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </label>

        <div className="mt-6 space-y-3">
          {lines.map((line, index) => (
            <div
              key={`${line.product_id}-${index}`}
              className="grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_120px_120px_auto]"
            >
              <select
                value={line.product_id}
                onChange={(event) => {
                  const product = catalog.products.find(
                    (entry) => entry.id === event.target.value,
                  );
                  if (!product) {
                    return;
                  }
                  const next = [...lines];
                  next[index] = {
                    product_id: product.id,
                    description: product.name,
                    quantity: line.quantity,
                    unit_price: product.price,
                  };
                  setLines(next);
                }}
                className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm outline-none"
              >
                {catalog.products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={line.quantity}
                onChange={(event) => {
                  const next = [...lines];
                  next[index] = { ...line, quantity: Number(event.target.value) };
                  setLines(next);
                }}
                className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm outline-none"
              />
              <input
                type="number"
                value={line.unit_price}
                onChange={(event) => {
                  const next = [...lines];
                  next[index] = { ...line, unit_price: Number(event.target.value) };
                  setLines(next);
                }}
                className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => setLines(lines.filter((_, lineIndex) => lineIndex !== index))}
                className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              const first = catalog.products[0];
              if (!first) {
                return;
              }
              setLines([
                ...lines,
                {
                  product_id: first.id,
                  description: first.name,
                  quantity: 1,
                  unit_price: first.price,
                },
              ]);
            }}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200"
          >
            Add line item
          </button>
          <button
            type="button"
            onClick={async () => {
              await api.createInvoice({
                customer_name: customerName,
                customer_email: customerEmail,
                status,
                due_date: dueDate,
                notes,
                items: lines,
              });
              await load();
            }}
            className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold uppercase tracking-[0.24em] text-white shadow-lg shadow-primary/25"
          >
            Create invoice
          </button>
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Totals</p>
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Tax</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-4 text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">History</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight">Sales ledger</h2>
          <div className="mt-5 space-y-3">
            {sales.invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      {invoice.invoice_number}
                    </p>
                    <h3 className="mt-1 font-bold">{invoice.customer_name}</h3>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                    {invoice.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
                  <span>{invoice.customer_email}</span>
                  <span className="text-base font-bold text-white">
                    {formatCurrency(invoice.total_amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
