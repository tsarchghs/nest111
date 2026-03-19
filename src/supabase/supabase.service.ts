import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = "https://dfqacniusunllmyglqip.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmcWFjbml1c3VubGxteWdscWlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5Mjg5MTgsImV4cCI6MjA4OTUwNDkxOH0.7XMLjlsaFMONyCG5jYlyWW3-JrGiXq-V2mNXR4vDHx4";

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Key must be provided');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }
}
