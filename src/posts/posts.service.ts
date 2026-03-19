import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePostDto {
  user_id: string;
  title: string;
  content: string;
  published?: boolean;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  published?: boolean;
}

@Injectable()
export class PostsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(): Promise<Post[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch posts: ${error.message}`);
    }

    return data as Post[];
  }

  async findOne(id: string): Promise<Post> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch post: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return data as Post;
  }

  async findByUser(userId: string): Promise<Post[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user posts: ${error.message}`);
    }

    return data as Post[];
  }

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('posts')
      .insert(createPostDto)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create post: ${error.message}`);
    }

    return data as Post;
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('posts')
      .update({ ...updatePostDto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update post: ${error.message}`);
    }

    return data as Post;
  }

  async remove(id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase.from('posts').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete post: ${error.message}`);
    }
  }
}
