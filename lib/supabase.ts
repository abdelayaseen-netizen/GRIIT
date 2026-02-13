import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = 'https://iazdfbqwudlodozgoyov.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhemRmYnF3dWRsb2RvemdveW92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMDAxMzAsImV4cCI6MjA4NTg3NjEzMH0.mcPqA_jkgXg3lrFQhRY2Y_b4O0JyuyLLhbzvNPmQw0g';

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