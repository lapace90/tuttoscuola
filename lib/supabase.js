import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://nphziknnhnqaygqotpsd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5waHppa25uaG5xYXlncW90cHNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwOTU1MDMsImV4cCI6MjA4MDY3MTUwM30.mfZfmkXxaSOcMFYBnb9ed4fS6Y5651Ta_ac0sOawKL4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
