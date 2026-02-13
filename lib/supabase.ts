import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

let supabaseUrl: string | undefined;
let supabaseAnonKey: string | undefined;

try {
  const extra = (Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {}) as Record<string, string | undefined>;
  supabaseUrl = extra.supabaseUrl;
  supabaseAnonKey = extra.supabaseAnonKey;
} catch (e) {
  console.warn('[Supabase] Could not read from Constants.extra:', e);
}

if (!supabaseUrl) {
  try {
    supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  } catch (e) {
    console.warn('[Supabase] Could not read EXPO_PUBLIC_SUPABASE_URL from env:', e);
  }
}

if (!supabaseAnonKey) {
  try {
    supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  } catch (e) {
    console.warn('[Supabase] Could not read EXPO_PUBLIC_SUPABASE_ANON_KEY from env:', e);
  }
}

console.log('[Supabase] URL:', supabaseUrl);
console.log('[Supabase] Key present:', !!supabaseAnonKey);

if (!supabaseUrl) {
  throw new Error(
    'supabaseUrl is required. Set EXPO_PUBLIC_SUPABASE_URL in your environment variables.'
  );
}
if (!supabaseAnonKey) {
  throw new Error(
    'supabaseAnonKey is required. Set EXPO_PUBLIC_SUPABASE_ANON_KEY in your environment variables.'
  );
}

const storage = Platform.OS === 'web'
  ? (typeof window !== 'undefined' ? window.localStorage : undefined)
  : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage as any,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});