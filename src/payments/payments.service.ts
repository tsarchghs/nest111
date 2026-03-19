import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface Payment {
  id: string;
  order_id: string;
  payment_method: string;
  amount: number;
  status: string;
  split_info: any;
  created_at: string;
}

export interface CreatePaymentDto {
  order_id: string;
  payment_method: string;
  amount: number;
  split_info?: any;
}

@Injectable()
export class PaymentsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('payments')
      .insert({
        ...createPaymentDto,
        status: 'completed',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create payment: ${error.message}`);
    }

    await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', createPaymentDto.order_id);

    return data as Payment;
  }

  async findByOrder(orderId: string): Promise<Payment[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch payments: ${error.message}`);
    }

    return data as Payment[];
  }
}
