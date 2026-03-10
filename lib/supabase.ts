import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

const storage = Platform.OS === 'web'
  ? (typeof window !== 'undefined' ? window.localStorage : undefined)
  : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // RN/Expo: AsyncStorage or localStorage adapter; Supabase types expect browser storage interface
    storage: storage as import('@supabase/supabase-js').SupabaseClient['auth']['storage'],
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});