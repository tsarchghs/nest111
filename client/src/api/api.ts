const API_BASE = '/api';

export interface Category {
  id: string;
  name: string;
  description: string;
  sort_order: number;
  active: boolean;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  active: boolean;
}

export interface Table {
  id: string;
  table_number: string;
  capacity: number;
  status: string;
  current_guests: number;
}

export interface Order {
  id: string;
  table_id: string;
  order_number: string;
  status: string;
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  server_name: string;
  guest_count: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string;
}

export const api = {
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    return res.json();
  },

  async getProducts(categoryId?: string): Promise<Product[]> {
    const url = categoryId
      ? `${API_BASE}/products?categoryId=${categoryId}`
      : `${API_BASE}/products`;
    const res = await fetch(url);
    return res.json();
  },

  async getTables(): Promise<Table[]> {
    const res = await fetch(`${API_BASE}/tables`);
    return res.json();
  },

  async getTable(id: string): Promise<Table> {
    const res = await fetch(`${API_BASE}/tables/${id}`);
    return res.json();
  },

  async updateTable(id: string, data: { status?: string; current_guests?: number }): Promise<Table> {
    const res = await fetch(`${API_BASE}/tables/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getOrders(tableId?: string): Promise<Order[]> {
    const url = tableId ? `${API_BASE}/orders?tableId=${tableId}` : `${API_BASE}/orders`;
    const res = await fetch(url);
    return res.json();
  },

  async getOrder(id: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}`);
    return res.json();
  },

  async createOrder(data: { table_id: string; server_name: string; guest_count: number }): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateOrder(id: string, data: { status?: string; tip?: number }): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/items`);
    return res.json();
  },

  async addOrderItem(orderId: string, data: { product_id: string; quantity: number; unit_price: number; notes?: string }): Promise<OrderItem> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateOrderItem(itemId: string, quantity: number): Promise<OrderItem> {
    const res = await fetch(`${API_BASE}/orders/items/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });
    return res.json();
  },

  async removeOrderItem(itemId: string): Promise<void> {
    await fetch(`${API_BASE}/orders/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  async createPayment(data: { order_id: string; payment_method: string; amount: number; split_info?: any }): Promise<any> {
    const res = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
