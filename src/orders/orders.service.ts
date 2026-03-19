import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

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
  created_at: string;
}

export interface CreateOrderDto {
  table_id: string;
  server_name: string;
  guest_count: number;
}

export interface AddOrderItemDto {
  product_id: string;
  quantity: number;
  unit_price: number;
  notes?: string;
}

export interface UpdateOrderDto {
  status?: string;
  tip?: number;
}

@Injectable()
export class OrdersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(): Promise<Order[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    return data as Order[];
  }

  async findOne(id: string): Promise<Order> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch order: ${error.message}`);
    }

    return data as Order;
  }

  async findByTable(tableId: string): Promise<Order[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('table_id', tableId)
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch table orders: ${error.message}`);
    }

    return data as Order[];
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const supabase = this.supabaseService.getClient();
    const orderNumber = `ORD-${Date.now()}`;

    const { data, error } = await supabase
      .from('orders')
      .insert({
        ...createOrderDto,
        order_number: orderNumber,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }

    return data as Order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('orders')
      .update({ ...updateOrderDto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update order: ${error.message}`);
    }

    return data as Order;
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (error) {
      throw new Error(`Failed to fetch order items: ${error.message}`);
    }

    return data as OrderItem[];
  }

  async addItem(orderId: string, addItemDto: AddOrderItemDto): Promise<OrderItem> {
    const supabase = this.supabaseService.getClient();
    const totalPrice = addItemDto.quantity * addItemDto.unit_price;

    const { data, error } = await supabase
      .from('order_items')
      .insert({
        order_id: orderId,
        ...addItemDto,
        total_price: totalPrice,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add order item: ${error.message}`);
    }

    await this.recalculateOrder(orderId);

    return data as OrderItem;
  }

  async updateItem(itemId: string, quantity: number): Promise<OrderItem> {
    const supabase = this.supabaseService.getClient();

    const { data: item, error: fetchError } = await supabase
      .from('order_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch order item: ${fetchError.message}`);
    }

    const totalPrice = quantity * item.unit_price;

    const { data, error } = await supabase
      .from('order_items')
      .update({ quantity, total_price: totalPrice })
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update order item: ${error.message}`);
    }

    await this.recalculateOrder(item.order_id);

    return data as OrderItem;
  }

  async removeItem(itemId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { data: item } = await supabase
      .from('order_items')
      .select('order_id')
      .eq('id', itemId)
      .single();

    const { error } = await supabase.from('order_items').delete().eq('id', itemId);

    if (error) {
      throw new Error(`Failed to delete order item: ${error.message}`);
    }

    if (item) {
      await this.recalculateOrder(item.order_id);
    }
  }

  private async recalculateOrder(orderId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { data: items } = await supabase
      .from('order_items')
      .select('total_price')
      .eq('order_id', orderId);

    const subtotal = items?.reduce((sum, item) => sum + Number(item.total_price), 0) || 0;
    const tax = subtotal * 0.15;
    const { data: order } = await supabase
      .from('orders')
      .select('tip')
      .eq('id', orderId)
      .single();

    const tip = order?.tip || 0;
    const total = subtotal + tax + tip;

    await supabase
      .from('orders')
      .update({
        subtotal,
        tax,
        total,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);
  }
}
