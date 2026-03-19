import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserDto {
  email: string;
  name: string;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(): Promise<User[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.from('users').select('*');

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return data as User[];
  }

  async findOne(id: string): Promise<User> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return data as User;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('users')
      .insert(createUserDto)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data as User;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('users')
      .update({ ...updateUserDto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data as User;
  }

  async remove(id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase.from('users').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}
