import { Injectable } from '@nestjs/common';
import type { AuthSessionUser } from '../auth/access.types';
import { SupabaseService } from '../supabase/supabase.service';

type ProductPayload = {
  id?: string;
  category_id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  cost_price: number;
  stock_quantity: number;
  reorder_level: number;
  status: string;
  image_url: string;
  active: boolean;
};

type InvoiceItemPayload = {
  product_id: string;
  description: string;
  quantity: number;
  unit_price: number;
};

type InvoicePayload = {
  customer_name: string;
  customer_email: string;
  status: string;
  due_date: string;
  notes: string;
  items: InvoiceItemPayload[];
};

@Injectable()
export class PlatformService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get admin() {
    return this.supabaseService.getAdminClient();
  }

  async getErpOverview(user: AuthSessionUser) {
    const [products, invoices, branches, tables, businessSettings] = await Promise.all([
      this.fetchProducts(user.workspace.id),
      this.fetchInvoices(user.workspace.id),
      this.fetchBranches(user.workspace.id),
      this.fetchTables(user.workspace.id),
      this.fetchBusinessSettings(user.workspace.id),
    ]);

    const totalRevenue = invoices.reduce(
      (sum, invoice) => sum + Number(invoice.total_amount ?? 0),
      0,
    );
    const pendingInvoices = invoices.filter((invoice) => invoice.status !== 'paid');
    const lowStock = products.filter(
      (product) => Number(product.stock_quantity) <= Number(product.reorder_level),
    );
    const occupiedTables = tables.filter((table) => table.status === 'occupied').length;

    return {
      business: businessSettings,
      metrics: [
        {
          label: 'Gross Revenue',
          value: `$${totalRevenue.toFixed(2)}`,
          delta: `${invoices.length} invoices`,
          tone: 'primary',
        },
        {
          label: 'Pending Sales',
          value: pendingInvoices.length.toString(),
          delta: 'Requires collection',
          tone: 'amber',
        },
        {
          label: 'Inventory Alerts',
          value: lowStock.length.toString(),
          delta: 'Below reorder point',
          tone: 'rose',
        },
        {
          label: 'Active Tables',
          value: occupiedTables.toString(),
          delta: `${tables.length} floor positions`,
          tone: 'emerald',
        },
      ],
      branches: branches.slice(0, 4),
      recentSales: invoices.slice(0, 6),
      topProducts: [...products]
        .sort((a, b) => Number(b.stock_quantity) - Number(a.stock_quantity))
        .slice(0, 5),
    };
  }

  async getCatalog(user: AuthSessionUser) {
    const [categories, products] = await Promise.all([
      this.fetchCategories(user.workspace.id),
      this.fetchProducts(user.workspace.id),
    ]);

    return { categories, products };
  }

  async saveProduct(user: AuthSessionUser, payload: ProductPayload) {
    const data = {
      workspace_id: user.workspace.id,
      category_id: payload.category_id,
      name: payload.name,
      sku: payload.sku,
      description: payload.description,
      price: payload.price,
      cost_price: payload.cost_price,
      stock_quantity: payload.stock_quantity,
      reorder_level: payload.reorder_level,
      status: payload.status,
      image_url: payload.image_url,
      active: payload.active,
      updated_at: new Date().toISOString(),
    };

    if (payload.id) {
      const { data: updated, error } = await this.admin
        .from('products')
        .update(data)
        .eq('id', payload.id)
        .eq('workspace_id', user.workspace.id)
        .select('*')
        .single();

      if (error) {
        throw new Error(`Failed to update product: ${error.message}`);
      }

      return updated;
    }

    const { data: created, error } = await this.admin
      .from('products')
      .insert(data)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }

    return created;
  }

  async getSales(user: AuthSessionUser) {
    return { invoices: await this.fetchInvoices(user.workspace.id) };
  }

  async createInvoice(user: AuthSessionUser, payload: InvoicePayload) {
    const subtotal = payload.items.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.unit_price),
      0,
    );
    const settings = await this.fetchBusinessSettings(user.workspace.id);
    const taxRate = Number(settings.tax_rate ?? 0.08);
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;
    const invoiceNumber = `INV-${Date.now()}`;

    const { data: invoice, error } = await this.admin
      .from('sales_invoices')
      .insert({
        workspace_id: user.workspace.id,
        branch_id: user.branch?.id ?? null,
        invoice_number: invoiceNumber,
        customer_name: payload.customer_name,
        customer_email: payload.customer_email,
        status: payload.status,
        due_date: payload.due_date,
        notes: payload.notes,
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
      })
      .select('*')
      .single();

    if (error || !invoice) {
      throw new Error(`Failed to create invoice: ${error?.message ?? 'unknown error'}`);
    }

    const items = payload.items.map((item) => ({
      invoice_id: invoice.id,
      product_id: item.product_id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: Number(item.quantity) * Number(item.unit_price),
    }));

    const { error: itemsError } = await this.admin
      .from('sales_invoice_items')
      .insert(items);

    if (itemsError) {
      throw new Error(`Failed to create invoice items: ${itemsError.message}`);
    }

    return invoice;
  }

  async getReports(user: AuthSessionUser) {
    const [invoices, products, categories] = await Promise.all([
      this.fetchInvoices(user.workspace.id),
      this.fetchProducts(user.workspace.id),
      this.fetchCategories(user.workspace.id),
    ]);

    const monthMap = new Map<string, number>();
    for (const invoice of invoices) {
      const createdAt = new Date(invoice.created_at);
      const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(key, (monthMap.get(key) ?? 0) + Number(invoice.total_amount ?? 0));
    }

    const revenueSeries = [...monthMap.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .slice(-6)
      .map(([month, total]) => ({ month, total }));

    return {
      hasRevenue: revenueSeries.length > 0,
      revenueSeries,
      categoryBreakdown: categories.map((category) => ({
        category: category.name,
        count: products.filter((product) => product.category_id === category.id).length,
      })),
      inventoryAlerts: products
        .filter((product) => Number(product.stock_quantity) <= Number(product.reorder_level))
        .slice(0, 6),
    };
  }

  async getBranches(user: AuthSessionUser) {
    return { branches: await this.fetchBranches(user.workspace.id) };
  }

  async updateBranch(
    user: AuthSessionUser,
    branchId: string,
    payload: { status: string; manager_name: string },
  ) {
    const { data, error } = await this.admin
      .from('branches')
      .update({
        status: payload.status,
        manager_name: payload.manager_name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', branchId)
      .eq('workspace_id', user.workspace.id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update branch: ${error.message}`);
    }

    return data;
  }

  async getBankAccounts(user: AuthSessionUser) {
    const { data, error } = await this.admin
      .from('bank_accounts')
      .select('*')
      .eq('workspace_id', user.workspace.id)
      .order('bank_name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch bank accounts: ${error.message}`);
    }

    return { accounts: data ?? [] };
  }

  async updateBankAccount(
    user: AuthSessionUser,
    accountId: string,
    payload: { status: string; account_name: string },
  ) {
    const { data, error } = await this.admin
      .from('bank_accounts')
      .update({
        status: payload.status,
        account_name: payload.account_name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', accountId)
      .eq('workspace_id', user.workspace.id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update bank account: ${error.message}`);
    }

    return data;
  }

  async getBusinessSettings(user: AuthSessionUser) {
    return this.fetchBusinessSettings(user.workspace.id);
  }

  async updateBusinessSettings(
    user: AuthSessionUser,
    payload: Record<string, unknown>,
  ) {
    const { data, error } = await this.admin
      .from('business_settings')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('workspace_id', user.workspace.id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update business settings: ${error.message}`);
    }

    return data;
  }

  async getPosFloor(user: AuthSessionUser) {
    const [tables, openOrders] = await Promise.all([
      this.fetchTables(user.workspace.id),
      this.fetchOpenOrders(user.workspace.id),
    ]);

    return {
      branch: user.branch,
      tables,
      activeOrders: openOrders.length,
      occupancyRate:
        tables.length === 0
          ? 0
          : Math.round(
              (tables.filter((table) => table.status === 'occupied').length / tables.length) *
                100,
            ),
    };
  }

  async getPosTableSession(user: AuthSessionUser, tableId: string) {
    const [table, categories, products] = await Promise.all([
      this.fetchTable(user.workspace.id, tableId),
      this.fetchCategories(user.workspace.id),
      this.fetchProducts(user.workspace.id),
    ]);

    let order = await this.fetchOpenOrderForTable(user.workspace.id, tableId);

    if (!order) {
      const { data, error } = await this.admin
        .from('orders')
        .insert({
          workspace_id: user.workspace.id,
          branch_id: user.branch?.id ?? table.branch_id ?? null,
          table_id: tableId,
          order_number: `POS-${Date.now()}`,
          status: 'open',
          server_name: user.fullName,
          guest_count: table.current_guests || 2,
        })
        .select('*')
        .single();

      if (error || !data) {
        throw new Error(`Failed to open order: ${error?.message ?? 'unknown error'}`);
      }

      order = data;

      await this.admin
        .from('tables')
        .update({
          status: 'occupied',
          current_guests: table.current_guests || 2,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tableId);
    }

    return {
      table,
      order,
      orderItems: await this.fetchOrderItems(order.id),
      categories,
      products,
    };
  }

  async addPosItem(
    user: AuthSessionUser,
    orderId: string,
    payload: { product_id: string; quantity: number; notes?: string },
  ) {
    const product = await this.fetchProductById(user.workspace.id, payload.product_id);
    const existingItem = await this.fetchOrderItemByProduct(orderId, payload.product_id);

    if (existingItem) {
      return this.updatePosItem(user, existingItem.id, {
        quantity: Number(existingItem.quantity) + Number(payload.quantity),
      });
    }

    const { error } = await this.admin.from('order_items').insert({
      order_id: orderId,
      product_id: product.id,
      quantity: payload.quantity,
      unit_price: product.price,
      total_price: Number(product.price) * Number(payload.quantity),
      notes: payload.notes ?? '',
    });

    if (error) {
      throw new Error(`Failed to add order item: ${error.message}`);
    }

    await this.recalculateOrder(orderId, user.workspace.id);
    return this.fetchOrderSummary(orderId);
  }

  async updatePosItem(
    user: AuthSessionUser,
    itemId: string,
    payload: { quantity: number },
  ) {
    const item = await this.fetchOrderItem(itemId);

    if (payload.quantity <= 0) {
      return this.removePosItem(user, itemId);
    }

    const { error } = await this.admin
      .from('order_items')
      .update({
        quantity: payload.quantity,
        total_price: Number(item.unit_price) * Number(payload.quantity),
      })
      .eq('id', itemId);

    if (error) {
      throw new Error(`Failed to update order item: ${error.message}`);
    }

    await this.recalculateOrder(item.order_id, user.workspace.id);
    return this.fetchOrderSummary(item.order_id);
  }

  async removePosItem(user: AuthSessionUser, itemId: string) {
    const item = await this.fetchOrderItem(itemId);
    const { error } = await this.admin.from('order_items').delete().eq('id', itemId);

    if (error) {
      throw new Error(`Failed to delete order item: ${error.message}`);
    }

    await this.recalculateOrder(item.order_id, user.workspace.id);
    return this.fetchOrderSummary(item.order_id);
  }

  async checkoutPosOrder(
    user: AuthSessionUser,
    orderId: string,
    payload: {
      tip: number;
      payment_method: string;
      amount: number;
      split_info?: Record<string, unknown>;
    },
  ) {
    await this.recalculateOrder(orderId, user.workspace.id, payload.tip);
    const order = await this.fetchOrder(orderId);

    const { error: paymentError } = await this.admin.from('payments').insert({
      workspace_id: user.workspace.id,
      branch_id: user.branch?.id ?? order.branch_id ?? null,
      order_id: orderId,
      payment_method: payload.payment_method,
      amount: payload.amount,
      status: 'completed',
      split_info: payload.split_info ?? {},
    });

    if (paymentError) {
      throw new Error(`Failed to record payment: ${paymentError.message}`);
    }

    const { error: orderError } = await this.admin
      .from('orders')
      .update({
        status: 'paid',
        tip: payload.tip,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (orderError) {
      throw new Error(`Failed to complete order: ${orderError.message}`);
    }

    await this.admin
      .from('tables')
      .update({
        status: 'available',
        current_guests: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.table_id);

    return this.fetchOrderSummary(orderId);
  }

  private async fetchCategories(workspaceId: string) {
    const { data, error } = await this.admin
      .from('categories')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return data ?? [];
  }

  private async fetchProducts(workspaceId: string) {
    const { data, error } = await this.admin
      .from('products')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    return data ?? [];
  }

  private async fetchProductById(workspaceId: string, productId: string) {
    const { data, error } = await this.admin
      .from('products')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('id', productId)
      .maybeSingle();

    if (error || !data) {
      throw new Error(`Failed to fetch product: ${error?.message ?? 'not found'}`);
    }

    return data;
  }

  private async fetchInvoices(workspaceId: string) {
    const { data, error } = await this.admin
      .from('sales_invoices')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch invoices: ${error.message}`);
    }

    return data ?? [];
  }

  private async fetchBranches(workspaceId: string) {
    const { data, error } = await this.admin
      .from('branches')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch branches: ${error.message}`);
    }

    return data ?? [];
  }

  private async fetchTables(workspaceId: string) {
    const { data, error } = await this.admin
      .from('tables')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('display_order', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch tables: ${error.message}`);
    }

    return data ?? [];
  }

  private async fetchTable(workspaceId: string, tableId: string) {
    const { data, error } = await this.admin
      .from('tables')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('id', tableId)
      .maybeSingle();

    if (error || !data) {
      throw new Error(`Failed to fetch table: ${error?.message ?? 'not found'}`);
    }

    return data;
  }

  private async fetchBusinessSettings(workspaceId: string) {
    const { data, error } = await this.admin
      .from('business_settings')
      .select('*')
      .eq('workspace_id', workspaceId)
      .maybeSingle();

    if (error || !data) {
      throw new Error(`Failed to fetch business settings: ${error?.message ?? 'not found'}`);
    }

    return data;
  }

  private async fetchOpenOrders(workspaceId: string) {
    const { data, error } = await this.admin
      .from('orders')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch open orders: ${error.message}`);
    }

    return data ?? [];
  }

  private async fetchOpenOrderForTable(workspaceId: string, tableId: string) {
    const { data, error } = await this.admin
      .from('orders')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('table_id', tableId)
      .eq('status', 'open')
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch open table order: ${error.message}`);
    }

    return data;
  }

  private async fetchOrder(orderId: string) {
    const { data, error } = await this.admin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (error || !data) {
      throw new Error(`Failed to fetch order: ${error?.message ?? 'not found'}`);
    }

    return data;
  }

  private async fetchOrderItems(orderId: string) {
    const { data, error } = await this.admin
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch order items: ${error.message}`);
    }

    return data ?? [];
  }

  private async fetchOrderItem(itemId: string) {
    const { data, error } = await this.admin
      .from('order_items')
      .select('*')
      .eq('id', itemId)
      .maybeSingle();

    if (error || !data) {
      throw new Error(`Failed to fetch order item: ${error?.message ?? 'not found'}`);
    }

    return data;
  }

  private async fetchOrderItemByProduct(orderId: string, productId: string) {
    const { data, error } = await this.admin
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
      .eq('product_id', productId)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch order item: ${error.message}`);
    }

    return data;
  }

  private async recalculateOrder(
    orderId: string,
    workspaceId: string,
    overrideTip?: number,
  ) {
    const [items, settings, order] = await Promise.all([
      this.fetchOrderItems(orderId),
      this.fetchBusinessSettings(workspaceId),
      this.fetchOrder(orderId),
    ]);

    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.total_price ?? 0),
      0,
    );
    const tax = subtotal * Number(settings.tax_rate ?? 0.08);
    const tip = overrideTip ?? Number(order.tip ?? 0);
    const total = subtotal + tax + tip;

    const { error } = await this.admin
      .from('orders')
      .update({
        subtotal,
        tax,
        tip,
        total,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) {
      throw new Error(`Failed to recalculate order: ${error.message}`);
    }
  }

  private async fetchOrderSummary(orderId: string) {
    const [order, orderItems] = await Promise.all([
      this.fetchOrder(orderId),
      this.fetchOrderItems(orderId),
    ]);

    return { order, orderItems };
  }
}
