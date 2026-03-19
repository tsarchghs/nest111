import { useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  api,
  formatCurrency,
  type PosOrder,
  type PosOrderItem,
  type PosTable,
  type Product,
} from '../api/api';

type PaymentMethod = 'cash' | 'card' | 'digital_wallet';
type SplitMode = 'none' | 'person' | 'custom';

type CheckoutState = {
  order: PosOrder;
  orderItems: PosOrderItem[];
  products: Product[];
  table: PosTable;
};

export default function CheckoutView() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as CheckoutState | undefined;
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [splitMode, setSplitMode] = useState<SplitMode>('none');
  const [people, setPeople] = useState(2);
  const [customAmount, setCustomAmount] = useState('0');
  const [tipAmount, setTipAmount] = useState(0);
  const [processing, setProcessing] = useState(false);

  if (!state) {
    return <Navigate to="/pos/floor" replace />;
  }

  const { order, orderItems, products, table } = state;

  const productMap = useMemo(
    () =>
      products.reduce<Record<string, string>>((accumulator, product) => {
        accumulator[product.id] = product.name;
        return accumulator;
      }, {}),
    [products],
  );

  const payableAmount =
    splitMode === 'person'
      ? (order.total + tipAmount) / people
      : splitMode === 'custom'
        ? Number(customAmount || 0)
        : order.total + tipAmount;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-5 text-white">
      <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          <header className="glass-panel flex items-center justify-between rounded-[28px] border border-white/10 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Checkout</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight">
                Table {table.table_number}
              </h1>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300"
            >
              Back
            </button>
          </header>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-black tracking-tight">Payment method</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {(['cash', 'card', 'digital_wallet'] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`rounded-3xl border px-4 py-5 text-left ${
                    paymentMethod === method
                      ? 'border-primary bg-primary/10'
                      : 'border-white/10 bg-slate-950/40'
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{method}</p>
                  <p className="mt-2 text-lg font-bold">{method.replace('_', ' ')}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-black tracking-tight">Split bill</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {(['none', 'person', 'custom'] as SplitMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSplitMode(mode)}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] ${
                    splitMode === mode
                      ? 'bg-primary text-white'
                      : 'border border-white/10 bg-slate-950/40 text-slate-300'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {splitMode === 'person' && (
              <div className="mt-5 flex flex-wrap gap-3">
                {[2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => setPeople(value)}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                      people === value
                        ? 'bg-white text-slate-950'
                        : 'border border-white/10 bg-slate-950/40 text-slate-300'
                    }`}
                  >
                    {value} people
                  </button>
                ))}
              </div>
            )}

            {splitMode === 'custom' && (
              <input
                value={customAmount}
                onChange={(event) => setCustomAmount(event.target.value)}
                className="mt-5 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            )}
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-black tracking-tight">Tip</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {[0, 5, 10, 15].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setTipAmount((order.subtotal * rate) / 100)}
                  className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm font-semibold text-slate-300"
                >
                  {rate === 0 ? 'No tip' : `${rate}%`}
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="glass-panel rounded-[28px] border border-white/10 p-5">
          <h2 className="text-2xl font-black tracking-tight">Order summary</h2>
          <div className="mt-6 space-y-3">
            {orderItems.map((item) => (
              <div key={item.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">{productMap[item.product_id] ?? 'Product'}</p>
                    <p className="text-sm text-slate-400">
                      {item.quantity} x {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <p className="font-bold">{formatCurrency(item.total_price)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3 rounded-[28px] border border-white/10 bg-slate-950/40 p-5">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Order total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Tip</span>
              <span>{formatCurrency(tipAmount)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-4 text-lg font-bold">
              <span>Payable now</span>
              <span>{formatCurrency(payableAmount)}</span>
            </div>
          </div>

          <button
            disabled={processing}
            onClick={async () => {
              setProcessing(true);
              await api.checkoutPosOrder(order.id, {
                tip: tipAmount,
                payment_method: paymentMethod,
                amount: payableAmount,
                split_info:
                  splitMode === 'none'
                    ? {}
                    : splitMode === 'person'
                      ? { mode: 'person', people }
                      : { mode: 'custom', amount: payableAmount },
              });
              navigate('/pos/floor');
            }}
            className="mt-6 w-full rounded-2xl bg-primary px-5 py-4 text-sm font-bold uppercase tracking-[0.24em] text-white shadow-lg shadow-primary/25 disabled:opacity-70"
          >
            {processing ? 'Processing...' : 'Complete payment'}
          </button>
        </aside>
      </div>
    </div>
  );
}
