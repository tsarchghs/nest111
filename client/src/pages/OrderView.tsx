import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, Table, Order, OrderItem, Category, Product } from '../api/api';

export default function OrderView() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const [table, setTable] = useState<Table | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [productMap, setProductMap] = useState<Record<string, Product>>({});
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    if (tableId) {
      loadData();
    }
  }, [tableId]);

  useEffect(() => {
    if (selectedCategory) {
      loadProductsByCategory(selectedCategory);
    } else {
      loadAllProducts();
    }
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      const [tableData, categoriesData] = await Promise.all([
        api.getTable(tableId!),
        api.getCategories(),
      ]);

      setTable(tableData);
      setCategories(categoriesData);

      if (categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0].id);
      }

      const orders = await api.getOrders(tableId);
      if (orders.length > 0 && orders[0].status === 'open') {
        const existingOrder = orders[0];
        setOrder(existingOrder);
        const items = await api.getOrderItems(existingOrder.id);
        setOrderItems(items);
      } else {
        const newOrder = await api.createOrder({
          table_id: tableId!,
          server_name: 'Barista',
          guest_count: tableData.current_guests || 2,
        });
        setOrder(newOrder);
      }

      const allProducts = await api.getProducts();
      const prodMap: Record<string, Product> = {};
      allProducts.forEach((p) => {
        prodMap[p.id] = p;
      });
      setProductMap(prodMap);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const loadProductsByCategory = async (categoryId: string) => {
    try {
      const data = await api.getProducts(categoryId);
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const loadAllProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const handleAddProduct = async (product: Product) => {
    if (!order) return;

    try {
      const existingItem = orderItems.find((item) => item.product_id === product.id);
      if (existingItem) {
        await api.updateOrderItem(existingItem.id, existingItem.quantity + 1);
      } else {
        await api.addOrderItem(order.id, {
          product_id: product.id,
          quantity: 1,
          unit_price: product.price,
          notes: '',
        });
      }

      const updatedItems = await api.getOrderItems(order.id);
      setOrderItems(updatedItems);

      const updatedOrder = await api.getOrder(order.id);
      setOrder(updatedOrder);
    } catch (error) {
      console.error('Failed to add product:', error);
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (!order) return;

    try {
      if (newQuantity <= 0) {
        await api.removeOrderItem(itemId);
      } else {
        await api.updateOrderItem(itemId, newQuantity);
      }

      const updatedItems = await api.getOrderItems(order.id);
      setOrderItems(updatedItems);

      const updatedOrder = await api.getOrder(order.id);
      setOrder(updatedOrder);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!order) return;

    try {
      await api.removeOrderItem(itemId);
      const updatedItems = await api.getOrderItems(order.id);
      setOrderItems(updatedItems);

      const updatedOrder = await api.getOrder(order.id);
      setOrder(updatedOrder);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleCheckout = () => {
    if (order) {
      navigate(`/checkout/${order.id}`);
    }
  };

  const getItemCount = (productId: string) => {
    const item = orderItems.find((i) => i.product_id === productId);
    return item?.quantity || 0;
  };

  if (!table || !order) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-bold text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden relative">
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="bg-primary/20 p-2 rounded-lg text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">table_restaurant</span>
          </div>
          <div>
            <h1 className="text-base font-bold leading-none">Table #{table.table_number}</h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {table.current_guests} Guests
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-bold">
            BS
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col overflow-hidden relative">
        <section className="flex-1 flex flex-col bg-slate-50/50 dark:bg-background-dark/30">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-5 py-2 rounded-lg font-semibold text-xs whitespace-nowrap transition-all ${
                    selectedCategory === category.id
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => {
                const count = getItemCount(product.id);
                return (
                  <div
                    key={product.id}
                    onClick={() => handleAddProduct(product)}
                    className={`bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border cursor-pointer transition-all ${
                      count > 0
                        ? 'border-primary/50 ring-1 ring-primary'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {count > 0 && (
                      <div className="absolute top-1 right-1 z-10 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-lg">
                        {count}
                      </div>
                    )}
                    <div className="h-28 bg-slate-200 dark:bg-slate-800 relative">
                      {product.image_url && (
                        <img
                          className="w-full h-full object-cover"
                          src={product.image_url}
                          alt={product.name}
                        />
                      )}
                    </div>
                    <div className="p-2.5">
                      <h3 className="font-semibold text-xs truncate">{product.name}</h3>
                      <div className="flex justify-between items-center mt-1.5">
                        <span className="text-primary font-bold text-sm">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className={`material-symbols-outlined text-lg ${count > 0 ? 'text-primary' : 'text-slate-400'}`}>
                          {count > 0 ? 'check_circle' : 'add_circle'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setShowCart(true)}
            className="mx-4 mb-4 bg-primary text-white p-4 rounded-xl shadow-2xl flex items-center justify-between transition-transform active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="material-symbols-outlined text-2xl">shopping_bag</span>
                {orderItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-primary">
                    {orderItems.length}
                  </span>
                )}
              </div>
              <div>
                <span className="text-xs opacity-80 block leading-none">
                  {orderItems.length} items
                </span>
                <span className="font-bold">View Cart</span>
              </div>
            </div>
            <span className="text-lg font-black">${order.total.toFixed(2)}</span>
          </button>
        </section>

        {showCart && (
          <aside className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
            <div
              className="absolute inset-0"
              onClick={() => setShowCart(false)}
            ></div>
            <div className="absolute bottom-0 left-0 right-0 h-[85vh] bg-white dark:bg-slate-900 rounded-t-3xl flex flex-col shadow-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">Current Order</h2>
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Table #{table.table_number}
                  </span>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500"
                >
                  <span className="material-symbols-outlined text-lg">expand_more</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {orderItems.map((item) => {
                  const product = productMap[item.product_id];
                  if (!product) return null;

                  return (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm">
                        {product.image_url && (
                          <img
                            className="w-full h-full object-cover"
                            src={product.image_url}
                            alt={product.name}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-bold text-sm">{product.name}</span>
                          <span className="font-black text-sm text-primary">
                            ${item.total_price.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          ${item.unit_price.toFixed(2)} each
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1.5">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity - 1)
                              }
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-primary shadow-sm"
                            >
                              <span className="material-symbols-outlined text-base font-bold">
                                remove
                              </span>
                            </button>
                            <span className="text-sm font-black w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity + 1)
                              }
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-primary shadow-sm"
                            >
                              <span className="material-symbols-outlined text-base font-bold">
                                add
                              </span>
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-400"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Tax</span>
                    <span>${order.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-end pt-1">
                    <span className="text-base font-bold">Total Payable</span>
                    <span className="text-3xl font-black text-primary">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 rounded-xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-2xl">payments</span>{' '}
                  PAY NOW
                </button>
              </div>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}
