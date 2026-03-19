import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class ProductsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(): Promise<Product[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    return data as Product[];
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    return data as Product[];
  }

  async findOne(id: string): Promise<Product> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch product: ${error.message}`);
    }

    return data as Product;
  }
}
