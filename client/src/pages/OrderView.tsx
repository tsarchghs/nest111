import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  api,
  formatCurrency,
  type Category,
  type PosOrder,
  type PosOrderItem,
  type PosTable,
  type Product,
} from '../api/api';

export default function OrderView() {
  const { tableId = '' } = useParams();
  const navigate = useNavigate();
  const [table, setTable] = useState<PosTable | null>(null);
  const [order, setOrder] = useState<PosOrder | null>(null);
  const [orderItems, setOrderItems] = useState<PosOrderItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showMobileCart, setShowMobileCart] = useState(false);

  const load = async () => {
    const response = await api.getPosTableSession(tableId);
    setTable(response.table);
    setOrder(response.order);
    setOrderItems(response.orderItems);
    setCategories(response.categories);
    setProducts(response.products);
    setSelectedCategory((current) => current || response.categories[0]?.id || '');
  };

  useEffect(() => {
    load().catch(console.error);
  }, [tableId]);

  const visibleProducts = useMemo(
    () =>
      selectedCategory
        ? products.filter((product) => product.category_id === selectedCategory)
        : products,
    [products, selectedCategory],
  );

  const productMap = useMemo(
    () =>
      products.reduce<Record<string, Product>>((accumulator, product) => {
        accumulator[product.id] = product;
        return accumulator;
      }, {}),
    [products],
  );

  if (!table || !order) {
    return <div className="p-8 text-sm text-slate-300">Loading order...</div>;
  }

  const itemCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  const renderOrderItems = () => (
    <div className="mt-6 space-y-4">
      {orderItems.length === 0 && (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">
          No items yet. Tap a product to add it to the ticket.
        </div>
      )}
      {orderItems.map((item) => {
        const product = productMap[item.product_id];
        if (!product) {
          return null;
        }

        return (
          <div key={item.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-bold">{product.name}</h3>
                <p className="text-sm text-slate-400">
                  {formatCurrency(item.unit_price)} each
                </p>
              </div>
              <p className="text-lg font-black">{formatCurrency(item.total_price)}</p>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    const response = await api.updatePosItem(item.id, item.quantity - 1);
                    setOrder(response.order);
                    setOrderItems(response.orderItems);
                  }}
                  className="rounded-2xl border border-white/10 px-3 py-2"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold">{item.quantity}</span>
                <button
                  onClick={async () => {
                    const response = await api.updatePosItem(item.id, item.quantity + 1);
                    setOrder(response.order);
                    setOrderItems(response.orderItems);
                  }}
                  className="rounded-2xl border border-white/10 px-3 py-2"
                >
                  +
                </button>
              </div>
              <button
                onClick={async () => {
                  const response = await api.removePosItem(item.id);
                  setOrder(response.order);
                  setOrderItems(response.orderItems);
                }}
                className="text-sm font-semibold text-rose-300"
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="safe-top safe-bottom min-h-screen bg-slate-950 px-4 py-5 text-white">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1fr_360px]">
        <section className="space-y-5 pb-24 xl:pb-0">
          <header className="glass-panel flex items-center justify-between rounded-[28px] border border-white/10 px-4 py-4 sm:px-5">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <button
                onClick={() => navigate('/pos/floor')}
                className="rounded-2xl border border-white/10 px-3 py-3"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  POS order
                </p>
                <h1 className="mt-2 truncate text-xl font-black tracking-tight sm:text-2xl">
                  Table {table.table_number}
                </h1>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right sm:px-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Guests</p>
              <p className="font-bold">{order.guest_count}</p>
            </div>
          </header>

          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`shrink-0 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white'
                    : 'border border-white/10 bg-white/5 text-slate-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product) => (
              <button
                key={product.id}
                onClick={async () => {
                  const response = await api.addPosItem(order.id, {
                    product_id: product.id,
                    quantity: 1,
                  });
                  setOrder(response.order);
                  setOrderItems(response.orderItems);
                }}
                className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 text-left transition hover:border-primary"
              >
                <div className="h-36 bg-slate-800">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-bold">{product.name}</h2>
                    <span className="material-symbols-outlined text-primary">add_circle</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                    {product.description}
                  </p>
                  <p className="mt-4 text-xl font-black">{formatCurrency(product.price)}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <aside className="hidden xl:block glass-panel rounded-[28px] border border-white/10 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Current order</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">{order.order_number}</h2>
            </div>
            <button
              onClick={() =>
                navigate(`/pos/checkout/${order.id}`, {
                  state: {
                    order,
                    orderItems,
                    products,
                    table,
                  },
                })
              }
              className="rounded-2xl bg-primary px-4 py-3 text-sm font-bold uppercase tracking-[0.22em] text-white"
            >
              Pay
            </button>
          </div>
          {renderOrderItems()}

          <div className="mt-6 space-y-3 rounded-[28px] border border-white/10 bg-slate-950/40 p-5">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Tax</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-4 text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-4 xl:hidden">
        <div className="glass-panel mobile-sheet-shadow flex items-center gap-3 rounded-[28px] border border-white/10 px-4 py-3">
          <button
            onClick={() => setShowMobileCart(true)}
            className="min-w-0 flex-1 text-left"
          >
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Current order</p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-bold">{itemCount} items</p>
                <p className="text-sm text-slate-400">{order.order_number}</p>
              </div>
              <p className="text-lg font-black">{formatCurrency(order.total)}</p>
            </div>
          </button>
          <button
            onClick={() =>
              navigate(`/pos/checkout/${order.id}`, {
                state: {
                  order,
                  orderItems,
                  products,
                  table,
                },
              })
            }
            className="rounded-2xl bg-primary px-4 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white"
          >
            Pay
          </button>
        </div>
      </div>

      {showMobileCart && (
        <div className="fixed inset-0 z-40 xl:hidden">
          <button
            aria-label="Close order summary"
            onClick={() => setShowMobileCart(false)}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          />
          <div className="mobile-sheet-shadow absolute inset-x-0 bottom-0 max-h-[82vh] overflow-hidden rounded-t-[32px] border border-white/10 bg-slate-900">
            <div className="safe-bottom flex max-h-[82vh] flex-col">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Current order
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight">
                    {order.order_number}
                  </h2>
                </div>
                <button
                  onClick={() => setShowMobileCart(false)}
                  className="rounded-2xl border border-white/10 px-3 py-3"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 pb-5">
                {renderOrderItems()}
                <div className="mt-6 space-y-3 rounded-[28px] border border-white/10 bg-slate-950/40 p-5">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>Tax</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-4 text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
