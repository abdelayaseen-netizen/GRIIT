import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('EXPO_PUBLIC_SUPABASE_URL is required for backend');
}

if (!supabaseAnonKey) {
  throw new Error('EXPO_PUBLIC_SUPABASE_ANON_KEY is required for backend');
}

if (process.env.NODE_ENV !== 'production') {
  const urlUsed = process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL ?? 'direct connection';
  console.log(
    '[Supabase] Using connection:',
    typeof urlUsed === 'string' && urlUsed.includes('pooler') ? 'POOLED ✓' : 'DIRECT (consider switching to pooler)'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
