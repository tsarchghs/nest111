import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface Category {
  id: string;
  name: string;
  description: string;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class CategoriesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(): Promise<Category[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return data as Category[];
  }

  async findOne(id: string): Promise<Category> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch category: ${error.message}`);
    }

    return data as Category;
  }
}
