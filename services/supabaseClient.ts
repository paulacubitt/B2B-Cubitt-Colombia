import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  !rawUrl.includes('falta-configurar') &&
  !rawUrl.includes('your_supabase_url') &&
  (rawUrl.startsWith('https://') || rawUrl.startsWith('http://'))
);

if (!isSupabaseConfigured) {
  console.info('ℹ️ Supabase no está configurado o tiene valores por defecto. Se utilizará el catálogo de productos predefinido.');
}

// Usar placeholders seguros si faltan las variables para evitar que la app falle a nivel de módulo
export const supabase = createClient(
  isSupabaseConfigured ? rawUrl : 'https://placeholder.supabase.co', 
  isSupabaseConfigured ? rawKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);

