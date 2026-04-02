import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Loads a value from the app_data table by key.
 * Returns { value, updatedAt } or null if not found / on error.
 */
export async function dbLoad(key) {
  try {
    const { data, error } = await supabase
      .from('app_data')
      .select('value, updated_at')
      .eq('key', key)
      .maybeSingle();
    if (error) throw error;
    return data ? { value: data.value, updatedAt: data.updated_at } : null;
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

/**
 * Subscribes to real-time changes in the app_data table.
 * Calls onChange(key, value) whenever another device saves a key.
 * Returns an unsubscribe function.
 * NOTE: requires Realtime enabled on the app_data table in Supabase dashboard.
 */
export function dbSubscribe(onChange) {
  const channel = supabase
    .channel('app_data_realtime')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'app_data' },
      (payload) => {
        if (payload.new?.key && payload.new?.value !== undefined) {
          onChange(payload.new.key, payload.new.value, payload.new.updated_at);
        }
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
