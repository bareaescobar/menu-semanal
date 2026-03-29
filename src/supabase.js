import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Loads a value from the app_data table by key.
 * Returns null if not found or on error.
 */
export async function dbLoad(key) {
  try {
    const { data, error } = await supabase
      .from('app_data')
      .select('value')
      .eq('key', key)
      .maybeSingle();
    if (error) throw error;
    return data ? data.value : null;
  } catch (e) {
    console.error(`[supabase] dbLoad(${key}) failed:`, e.message);
    return null;
  }
}

/**
 * Saves a value to the app_data table by key (upsert).
 */
export async function dbSave(key, value) {
  try {
    const { error } = await supabase
      .from('app_data')
      .upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) throw error;
  } catch (e) {
    console.error(`[supabase] dbSave(${key}) failed:`, e.message);
  }
}
