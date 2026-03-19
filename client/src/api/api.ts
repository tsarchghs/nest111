const API_BASE = "https://nest111-seven.vercel.app/api"
const SESSION_KEY = 'nexus-platform-session';

export type AppArea = 'erp' | 'admin' | 'pos';
export type AppRole = 'owner' | 'erp' | 'admin' | 'pos';

export interface AuthUser {
  userId: string;
  email: string;
  fullName: string;
  role: AppRole;
  allowedAreas: AppArea[];
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
  branch: {
    id: string;
    name: string;
    code: string;
  } | null;
}

export interface SessionPayload {
  accessToken: string;
  refreshToken: string;
  expiresAt: number | null;
  user: AuthUser;
}

export interface DashboardOverview {
  business: {
    trading_name: string;
    legal_name: string;
    email: string;
    tax_rate: number;
    invoice_prefix: string;
  };
  metrics: Array<{
    label: string;
    value: string;
    delta: string;
    tone: string;
  }>;
  branches: Branch[];
  recentSales: SalesInvoice[];
  topProducts: Product[];
}

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
  sku: string;
  cost_price: number;
  stock_quantity: number;
  reorder_level: number;
  status: string;
}

export interface CatalogResponse {
  categories: Category[];
  products: Product[];
}

export interface SalesInvoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  status: string;
  due_date: string;
  notes: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  created_at: string;
}

export interface SalesResponse {
  invoices: SalesInvoice[];
}

export interface ReportsResponse {
  hasRevenue: boolean;
  revenueSeries: Array<{
    month: string;
    total: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
  }>;
  inventoryAlerts: Product[];
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  manager_name: string;
  city: string;
  status: string;
  phone: string;
}

export interface BankAccount {
  id: string;
  bank_name: string;
  account_name: string;
  account_number_last4: string;
  currency_code: string;
  status: string;
  iban: string;
  swift_code: string;
}

export interface BusinessSettings {
  id: string;
  legal_name: string;
  trading_name: string;
  email: string;
  phone: string;
  tax_rate: number;
  invoice_prefix: string;
  pos_service_charge: number;
  address: string;
  locale: string;
}

export interface PosTable {
  id: string;
  table_number: string;
  capacity: number;
  status: string;
  current_guests: number;
  zone: string;
  display_order: number;
}

export interface PosFloorResponse {
  branch: AuthUser['branch'];
  tables: PosTable[];
  activeOrders: number;
  occupancyRate: number;
}

export interface PosOrder {
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
}

export interface PosOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string;
}

export interface PosTableSession {
  table: PosTable;
  order: PosOrder;
  orderItems: PosOrderItem[];
  categories: Category[];
  products: Product[];
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getStoredSession(): SessionPayload | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionPayload;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export const sessionStore = {
  load: getStoredSession,
  save(session: SessionPayload) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },
  clear() {
    localStorage.removeItem(SESSION_KEY);
  },
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = getStoredSession();
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (session?.accessToken) {
    headers.set('Authorization', `Bearer ${session.accessToken}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) {
        message = body.message;
      }
    } catch {
      // ignore JSON parse failures
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  login(email: string, password: string) {
    return request<SessionPayload>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getMe() {
    return request<AuthUser>('/auth/me');
  },

  getErpOverview() {
    return request<DashboardOverview>('/platform/erp/overview');
  },

  getCatalog() {
    return request<CatalogResponse>('/platform/catalog');
  },

  saveProduct(payload: Partial<Product> & Pick<Product, 'name' | 'category_id'>) {
    return request<Product>('/platform/erp/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getSales() {
    return request<SalesResponse>('/platform/erp/sales');
  },

  createInvoice(payload: {
    customer_name: string;
    customer_email: string;
    status: string;
    due_date: string;
    notes: string;
    items: Array<{
      product_id: string;
      description: string;
      quantity: number;
      unit_price: number;
    }>;
  }) {
    return request<SalesInvoice>('/platform/erp/sales', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getReports() {
    return request<ReportsResponse>('/platform/erp/reports');
  },

  getBranches() {
    return request<{ branches: Branch[] }>('/platform/admin/branches');
  },

  updateBranch(branchId: string, payload: { status: string; manager_name: string }) {
    return request<Branch>(`/platform/admin/branches/${branchId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  getBankAccounts() {
    return request<{ accounts: BankAccount[] }>('/platform/admin/bank-accounts');
  },

  updateBankAccount(
    accountId: string,
    payload: { status: string; account_name: string },
  ) {
    return request<BankAccount>(`/platform/admin/bank-accounts/${accountId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  getBusinessSettings() {
    return request<BusinessSettings>('/platform/admin/settings');
  },

  updateBusinessSettings(payload: Partial<BusinessSettings>) {
    return request<BusinessSettings>('/platform/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  getPosFloor() {
    return request<PosFloorResponse>('/platform/pos/floor');
  },

  getPosTableSession(tableId: string) {
    return request<PosTableSession>(`/platform/pos/tables/${tableId}/session`);
  },

  addPosItem(orderId: string, payload: { product_id: string; quantity: number; notes?: string }) {
    return request<{ order: PosOrder; orderItems: PosOrderItem[] }>(
      `/platform/pos/orders/${orderId}/items`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  },

  updatePosItem(itemId: string, quantity: number) {
    return request<{ order: PosOrder; orderItems: PosOrderItem[] }>(
      `/platform/pos/order-items/${itemId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      },
    );
  },

  removePosItem(itemId: string) {
    return request<{ order: PosOrder; orderItems: PosOrderItem[] }>(
      `/platform/pos/order-items/${itemId}`,
      {
        method: 'DELETE',
      },
    );
  },

  checkoutPosOrder(
    orderId: string,
    payload: {
      tip: number;
      payment_method: string;
      amount: number;
      split_info?: Record<string, unknown>;
    },
  ) {
    return request<{ order: PosOrder; orderItems: PosOrderItem[] }>(
      `/platform/pos/orders/${orderId}/checkout`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  },
};

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
