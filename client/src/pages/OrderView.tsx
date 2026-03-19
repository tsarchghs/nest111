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

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-5 text-white">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1fr_360px]">
        <section className="space-y-5">
          <header className="glass-panel flex items-center justify-between rounded-[28px] border border-white/10 px-5 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/pos/floor')}
                className="rounded-2xl border border-white/10 px-3 py-3"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  POS order
                </p>
                <h1 className="mt-2 text-2xl font-black tracking-tight">
                  Table {table.table_number}
                </h1>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-right">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Guests</p>
              <p className="font-bold">{order.guest_count}</p>
            </div>
          </header>

          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white'
                    : 'border border-white/10 bg-white/5 text-slate-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

        <aside className="glass-panel rounded-[28px] border border-white/10 p-5">
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

          <div className="mt-6 space-y-4">
            {orderItems.map((item) => {
              const product = productMap[item.product_id];
              if (!product) {
                return null;
              }

              return (
                <div key={item.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{product.name}</h3>
                      <p className="text-sm text-slate-400">
                        {formatCurrency(item.unit_price)} each
                      </p>
                    </div>
                    <p className="text-lg font-black">{formatCurrency(item.total_price)}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
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
    </div>
  );
}
