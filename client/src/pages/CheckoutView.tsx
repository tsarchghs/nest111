import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, Order, OrderItem, Product } from '../api/api';

type PaymentMethod = 'cash' | 'card' | 'digital_wallet';
type SplitMode = 'none' | 'person' | 'item' | 'custom';

export default function CheckoutView() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [productMap, setProductMap] = useState<Record<string, Product>>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [showTipModal, setShowTipModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitMode, setSplitMode] = useState<SplitMode>('none');
  const [tipAmount, setTipAmount] = useState(0);
  const [tipInput, setTipInput] = useState('0');
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [customAmount, setCustomAmount] = useState('0');
  const [amountReceived, setAmountReceived] = useState('0');

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const [orderData, items, products] = await Promise.all([
        api.getOrder(orderId!),
        api.getOrderItems(orderId!),
        api.getProducts(),
      ]);

      setOrder(orderData);
      setOrderItems(items);

      const prodMap: Record<string, Product> = {};
      products.forEach((p) => {
        prodMap[p.id] = p;
      });
      setProductMap(prodMap);
    } catch (error) {
      console.error('Failed to load order:', error);
    }
  };

  const handleTipSelect = (percentage: number) => {
    if (order) {
      const tip = (order.subtotal * percentage) / 100;
      setTipAmount(tip);
      setTipInput(tip.toFixed(2));
    }
  };

  const handleTipInputChange = (value: string) => {
    setTipInput(value);
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      setTipAmount(parsed);
    }
  };

  const handleApplyTip = async () => {
    if (!order) return;

    try {
      await api.updateOrder(order.id, { tip: tipAmount });
      const updatedOrder = await api.getOrder(order.id);
      setOrder(updatedOrder);
      setShowTipModal(false);
    } catch (error) {
      console.error('Failed to apply tip:', error);
    }
  };

  const calculateSplitAmount = () => {
    if (!order) return 0;

    switch (splitMode) {
      case 'person':
        return order.total / numberOfPeople;
      case 'item':
        const selectedTotal = orderItems
          .filter((item) => selectedItems.has(item.id))
          .reduce((sum, item) => sum + item.total_price, 0);
        const taxForItems = selectedTotal * 0.15;
        return selectedTotal + taxForItems;
      case 'custom':
        return parseFloat(customAmount) || 0;
      default:
        return order.total;
    }
  };

  const handleCompletePayment = async () => {
    if (!order) return;

    try {
      const paymentAmount = splitMode !== 'none' ? calculateSplitAmount() : order.total;

      await api.createPayment({
        order_id: order.id,
        payment_method: paymentMethod,
        amount: paymentAmount,
        split_info:
          splitMode !== 'none'
            ? {
                mode: splitMode,
                amount: paymentAmount,
                numberOfPeople: splitMode === 'person' ? numberOfPeople : undefined,
                selectedItems:
                  splitMode === 'item' ? Array.from(selectedItems) : undefined,
              }
            : {},
      });

      await api.updateTable(order.table_id, { status: 'available', current_guests: 0 });

      navigate('/');
    } catch (error) {
      console.error('Failed to complete payment:', error);
    }
  };

  const appendToAmountReceived = (value: string) => {
    if (value === '.' && amountReceived.includes('.')) return;
    if (amountReceived === '0' && value !== '.') {
      setAmountReceived(value);
    } else {
      setAmountReceived(amountReceived + value);
    }
  };

  const backspaceAmountReceived = () => {
    if (amountReceived.length > 1) {
      setAmountReceived(amountReceived.slice(0, -1));
    } else {
      setAmountReceived('0');
    }
  };

  if (!order) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-bold text-slate-500">Loading...</div>
      </div>
    );
  }

  const finalTotal = splitMode !== 'none' ? calculateSplitAmount() : order.total;
  const changeAmount = parseFloat(amountReceived) - finalTotal;

  return (
    <div className="flex h-screen w-full flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined">restaurant</span>
          </div>
          <div>
            <h2 className="text-base font-bold leading-none">Checkout</h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-tight">
              Order #{order.order_number}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSplitModal(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
          >
            <span className="material-symbols-outlined text-xl">call_split</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-background-dark">
        <div className="flex flex-col w-full pb-32">
          <section className="bg-white dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Order Summary
                </h3>
                {splitMode !== 'none' && (
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded">
                    {splitMode === 'person' && `Split ${numberOfPeople} ways`}
                    {splitMode === 'item' && `Split by items`}
                    {splitMode === 'custom' && `Custom split`}
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {orderItems.slice(0, 3).map((item) => {
                  const product = productMap[item.product_id];
                  if (!product) return null;

                  return (
                    <div key={item.id} className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">
                          {item.quantity}x {product.name}
                        </p>
                      </div>
                      <p className="text-sm font-medium">${item.total_price.toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Total Due</span>
                <span className="text-lg font-black text-primary">
                  ${finalTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </section>

          <section className="p-4 space-y-4">
            <h2 className="text-lg font-bold">Select Payment</h2>
            <div className="grid grid-cols-1 gap-3">
              <label className="group relative flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-has-[:checked]:bg-primary group-has-[:checked]:text-white">
                    <span className="material-symbols-outlined text-2xl">payments</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold leading-tight">Cash</p>
                    <p className="text-[11px] text-slate-500">Physical currency</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment-method"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                  className="h-5 w-5 border-slate-300 text-primary focus:ring-primary"
                />
              </label>

              <label className="group relative flex cursor-pointer items-center justify-between rounded-xl border-2 border-slate-200 dark:border-slate-800 p-4 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-has-[:checked]:bg-primary group-has-[:checked]:text-white">
                    <span className="material-symbols-outlined text-2xl">credit_card</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold leading-tight">Credit / Debit Card</p>
                    <p className="text-[11px] text-slate-500">Visa, Mastercard, Amex</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment-method"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="h-5 w-5 border-slate-300 text-primary focus:ring-primary"
                />
              </label>

              <label className="group relative flex cursor-pointer items-center justify-between rounded-xl border-2 border-slate-200 dark:border-slate-800 p-4 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-has-[:checked]:bg-primary group-has-[:checked]:text-white">
                    <span className="material-symbols-outlined text-2xl">
                      account_balance_wallet
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold leading-tight">Digital Wallet</p>
                    <p className="text-[11px] text-slate-500">Apple Pay, Google Pay</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment-method"
                  value="digital_wallet"
                  checked={paymentMethod === 'digital_wallet'}
                  onChange={() => setPaymentMethod('digital_wallet')}
                  className="h-5 w-5 border-slate-300 text-primary focus:ring-primary"
                />
              </label>
            </div>
          </section>

          {paymentMethod === 'cash' && (
            <section className="p-4 bg-slate-100/50 dark:bg-slate-900/50">
              <div className="mb-4 space-y-3">
                <div className="rounded-xl bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">
                    Amount Received
                  </p>
                  <p className="text-3xl font-black text-primary">
                    ${parseFloat(amountReceived).toFixed(2)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">
                      Total Due
                    </p>
                    <p className="text-base font-bold">${finalTotal.toFixed(2)}</p>
                  </div>
                  <div
                    className={`rounded-xl p-3 border ${
                      changeAmount >= 0
                        ? 'bg-green-500/10 dark:bg-green-500/20 border-green-500/30'
                        : 'bg-red-500/10 dark:bg-red-500/20 border-red-500/30'
                    }`}
                  >
                    <p
                      className={`text-[10px] font-bold uppercase ${
                        changeAmount >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      Change Due
                    </p>
                    <p
                      className={`text-base font-bold ${
                        changeAmount >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      ${Math.abs(changeAmount).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((num) => (
                  <button
                    key={num}
                    onClick={() => appendToAmountReceived(num)}
                    className="h-16 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-xl font-bold shadow-sm border border-slate-200 dark:border-slate-700 active:bg-slate-100"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={backspaceAmountReceived}
                  className="h-16 flex items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-sm active:bg-slate-300"
                >
                  <span className="material-symbols-outlined">backspace</span>
                </button>
                <button
                  onClick={() => setAmountReceived(finalTotal.toFixed(2))}
                  className="col-span-3 mt-2 flex items-center justify-center rounded-xl bg-primary/10 text-primary font-bold py-4 border border-primary/20"
                >
                  Exact Amount (${finalTotal.toFixed(2)})
                </button>
              </div>
            </section>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 px-4 pt-4 pb-4 z-10">
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => setShowSplitModal(true)}
            className="py-2.5 rounded-lg text-[11px] font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 uppercase tracking-tighter"
          >
            Split
          </button>
          <button
            onClick={() => setShowTipModal(true)}
            className="py-2.5 rounded-lg text-[11px] font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 uppercase tracking-tighter"
          >
            Tip
          </button>
          <button className="py-2.5 rounded-lg text-[11px] font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 uppercase tracking-tighter">
            Disc.
          </button>
        </div>
        <button
          onClick={handleCompletePayment}
          disabled={paymentMethod === 'cash' && changeAmount < 0}
          className="w-full rounded-xl bg-primary px-4 py-5 text-lg font-black text-white shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          COMPLETE PAYMENT
        </button>
      </div>

      {showTipModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setShowTipModal(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-h-[96vh] md:max-w-md md:rounded-2xl rounded-t-3xl shadow-2xl border-t md:border border-slate-200 dark:border-slate-800 overflow-y-auto flex flex-col">
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
            </div>

            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex flex-col">
                <h2 className="text-xl font-bold tracking-tight">Add Tip</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Subtotal: ${order.subtotal.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => setShowTipModal(false)}
                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto pb-32">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { percent: 5, amount: (order.subtotal * 0.05).toFixed(2) },
                  { percent: 10, amount: (order.subtotal * 0.1).toFixed(2) },
                  { percent: 15, amount: (order.subtotal * 0.15).toFixed(2) },
                  { percent: 20, amount: (order.subtotal * 0.2).toFixed(2) },
                ].map((tip) => (
                  <button
                    key={tip.percent}
                    onClick={() => handleTipSelect(tip.percent)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      Math.abs(tipAmount - parseFloat(tip.amount)) < 0.01
                        ? 'border-primary bg-primary/10'
                        : 'border-slate-200 dark:border-slate-800 hover:border-primary'
                    }`}
                  >
                    <span className={`text-lg font-bold ${Math.abs(tipAmount - parseFloat(tip.amount)) < 0.01 ? 'text-primary' : ''}`}>
                      {tip.percent}%
                    </span>
                    <span className={`text-[10px] ${Math.abs(tipAmount - parseFloat(tip.amount)) < 0.01 ? 'text-primary/80 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                      ${tip.amount}
                    </span>
                  </button>
                ))}
              </div>

              <div className="relative">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 ml-1">
                  Custom Tip Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                    $
                  </span>
                  <input
                    type="text"
                    value={tipInput}
                    onChange={(e) => handleTipInputChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-5 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-3xl font-bold focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                    New Total
                  </span>
                  <span className="text-3xl font-black text-primary">
                    ${(order.subtotal + order.tax + tipAmount).toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                onClick={handleApplyTip}
                className="w-full py-5 rounded-2xl bg-primary text-white text-lg font-bold hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/30"
              >
                Apply Tip
                <span className="material-symbols-outlined text-2xl">check_circle</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showSplitModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setShowSplitModal(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-h-[96vh] md:max-w-5xl md:rounded-2xl rounded-t-3xl shadow-2xl border-t md:border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">
                  call_split
                </span>
                Split Bill
              </h2>
              <button
                onClick={() => setShowSplitModal(false)}
                className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6">
                <button
                  onClick={() => setSplitMode('person')}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                    splitMode === 'person'
                      ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  Split by Person
                </button>
                <button
                  onClick={() => setSplitMode('item')}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                    splitMode === 'item'
                      ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  Split by Item
                </button>
                <button
                  onClick={() => setSplitMode('custom')}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                    splitMode === 'custom'
                      ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  Custom Amount
                </button>
              </div>

              {splitMode === 'person' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Number of People
                  </h3>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
                    {[2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setNumberOfPeople(num)}
                        className={`flex-1 py-3 text-center rounded-lg font-bold transition-all ${
                          numberOfPeople === num
                            ? 'bg-white dark:bg-background-dark text-slate-900 dark:text-white shadow-lg'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <div className="bg-primary/10 p-4 rounded-xl border border-primary/30">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-primary">Per Person</span>
                      <span className="text-2xl font-black text-primary">
                        ${(order.total / numberOfPeople).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {splitMode === 'item' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-base font-bold">Select items</h3>
                    <button
                      onClick={() => {
                        if (selectedItems.size === orderItems.length) {
                          setSelectedItems(new Set());
                        } else {
                          setSelectedItems(new Set(orderItems.map((i) => i.id)));
                        }
                      }}
                      className="text-sm font-bold text-primary"
                    >
                      {selectedItems.size === orderItems.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  {orderItems.map((item) => {
                    const product = productMap[item.product_id];
                    if (!product) return null;
                    const isSelected = selectedItems.has(item.id);

                    return (
                      <label
                        key={item.id}
                        className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border-2 ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-6 w-6 rounded-lg flex items-center justify-center ${
                              isSelected
                                ? 'bg-primary text-white'
                                : 'border-2 border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {isSelected && (
                              <span className="material-symbols-outlined text-lg">check</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold">
                              {item.quantity}x {product.name}
                            </p>
                          </div>
                        </div>
                        <span className="text-base font-black">
                          ${item.total_price.toFixed(2)}
                        </span>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const newSet = new Set(selectedItems);
                            if (e.target.checked) {
                              newSet.add(item.id);
                            } else {
                              newSet.delete(item.id);
                            }
                            setSelectedItems(newSet);
                          }}
                          className="hidden"
                        />
                      </label>
                    );
                  })}
                  {selectedItems.size > 0 && (
                    <div className="bg-primary/10 p-4 rounded-xl border border-primary/30">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-primary">
                          Selected Items Total
                        </span>
                        <span className="text-2xl font-black text-primary">
                          ${calculateSplitAmount().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {splitMode === 'custom' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Enter Custom Amount
                  </h3>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                      $
                    </span>
                    <input
                      type="text"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-5 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-3xl font-bold focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setCustomAmount((order.total / 2).toFixed(2))}
                      className="flex items-center justify-center bg-primary/10 text-primary border border-primary/20 rounded-lg py-3 font-bold text-sm"
                    >
                      Exact Half
                    </button>
                    <button
                      onClick={() => setCustomAmount(order.total.toFixed(2))}
                      className="flex items-center justify-center bg-primary/10 text-primary border border-primary/20 rounded-lg py-3 font-bold text-sm"
                    >
                      Full Amount
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex gap-4">
              <button
                onClick={() => {
                  setSplitMode('none');
                  setShowSplitModal(false);
                }}
                className="px-8 py-4 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSplitModal(false)}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">check_circle</span>
                Apply Split
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
