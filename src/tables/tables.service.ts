import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface Table {
  id: string;
  table_number: string;
  capacity: number;
  status: string;
  current_guests: number;
  created_at: string;
  updated_at: string;
}

export interface UpdateTableDto {
  status?: string;
  current_guests?: number;
}

@Injectable()
export class TablesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(): Promise<Table[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .order('table_number', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch tables: ${error.message}`);
    }

    return data as Table[];
  }

  async findOne(id: string): Promise<Table> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch table: ${error.message}`);
    }

    return data as Table;
  }

  async update(id: string, updateTableDto: UpdateTableDto): Promise<Table> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('tables')
      .update({ ...updateTableDto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update table: ${error.message}`);
    }

    return data as Table;
  }
}
