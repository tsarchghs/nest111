import { useEffect, useState } from 'react';
import { api, formatCurrency, type CatalogResponse, type Product } from '../api/api';

type ProductForm = Omit<Product, 'id'> & { id?: string };

const emptyProduct: ProductForm = {
  category_id: '',
  name: '',
  description: '',
  price: 0,
  image_url: '',
  active: true,
  sku: '',
  cost_price: 0,
  stock_quantity: 0,
  reorder_level: 8,
  status: 'active',
};

export default function ErpProductsPage() {
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyProduct);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const response = await api.getCatalog();
    setCatalog(response);
    if (!form.category_id && response.categories[0]) {
      setForm((current) => ({ ...current, category_id: response.categories[0].id }));
    }
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  if (!catalog) {
    return <div className="text-sm text-slate-400">Loading products...</div>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-primary/80">Catalog</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">Product Catalog</h1>
          </div>
          <button
            type="button"
            onClick={() =>
              setForm({
                ...emptyProduct,
                category_id: catalog.categories[0]?.id ?? '',
              })
            }
            className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold uppercase tracking-[0.24em] text-white shadow-lg shadow-primary/25"
          >
            New product
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Products</p>
            <p className="mt-3 text-4xl font-black">{catalog.products.length}</p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Categories</p>
            <p className="mt-3 text-4xl font-black">{catalog.categories.length}</p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Low inventory
            </p>
            <p className="mt-3 text-4xl font-black text-amber-300">
              {
                catalog.products.filter(
                  (product) => product.stock_quantity <= product.reorder_level,
                ).length
              }
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-[28px] border border-white/10 bg-slate-950/40 p-4">
          {catalog.products.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => setForm(product)}
              className={`grid gap-3 rounded-3xl border p-4 text-left transition md:grid-cols-[1fr_auto] ${
                form.id === product.id
                  ? 'border-primary bg-primary/10'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div>
                <h2 className="text-lg font-bold">{product.name}</h2>
                <p className="mt-2 text-sm text-slate-400">{product.description}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                  <span>SKU {product.sku}</span>
                  <span>Stock {product.stock_quantity}</span>
                  <span>Reorder {product.reorder_level}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black">{formatCurrency(product.price)}</p>
                <p className="mt-1 text-sm text-slate-500">
                  Cost {formatCurrency(product.cost_price)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <p className="text-sm uppercase tracking-[0.28em] text-primary/80">
          {form.id ? 'Edit product' : 'Create product'}
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight">
          {form.name || 'New inventory item'}
        </h2>

        <div className="mt-6 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-300">Name</span>
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-300">Category</span>
              <select
                value={form.category_id}
                onChange={(event) => setForm({ ...form, category_id: event.target.value })}
                className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm outline-none focus:border-primary"
              >
                {catalog.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-300">SKU</span>
              <input
                value={form.sku}
                onChange={(event) => setForm({ ...form, sku: event.target.value })}
                className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-300">Description</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              className="min-h-24 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-300">Price</span>
              <input
                type="number"
                value={form.price}
                onChange={(event) => setForm({ ...form, price: Number(event.target.value) })}
                className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-300">Cost price</span>
              <input
                type="number"
                value={form.cost_price}
                onChange={(event) =>
                  setForm({ ...form, cost_price: Number(event.target.value) })
                }
                className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-300">Stock</span>
              <input
                type="number"
                value={form.stock_quantity}
                onChange={(event) =>
                  setForm({ ...form, stock_quantity: Number(event.target.value) })
                }
                className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-300">Reorder</span>
              <input
                type="number"
                value={form.reorder_level}
                onChange={(event) =>
                  setForm({ ...form, reorder_level: Number(event.target.value) })
                }
                className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-300">Status</span>
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value })}
                className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm outline-none focus:border-primary"
              >
                <option value="active">Active</option>
                <option value="seasonal">Seasonal</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </div>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            await api.saveProduct(form);
            await load();
            setSaving(false);
          }}
          className="mt-6 w-full rounded-2xl bg-primary px-5 py-4 text-sm font-bold uppercase tracking-[0.24em] text-white shadow-lg shadow-primary/25"
        >
          {saving ? 'Saving...' : 'Save product'}
        </button>
      </section>
    </div>
  );
}
