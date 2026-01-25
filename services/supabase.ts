
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from '../constants';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const saveOrderToSupabase = async (order: any) => {
  const { data, error } = await supabase
    .from('pedidos')
    .insert([
      {
        telefono: order.telefono,
        nombre: order.nombre,
        direccion: order.direccion,
        total: order.total,
        metodo_pago: order.metodo_pago,
        productos: JSON.stringify(order.productos),
        notas: order.notas,
        status: 'Pendiente'
      }
    ]);
  if (error) throw error;
  return data;
};

export const fetchOrdersFromSupabase = async (phone?: string) => {
  let query = supabase.from('pedidos').select('*').order('created_at', { ascending: false });
  if (phone) {
    query = query.eq('telefono', phone);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const updateTasaSupabase = async (newTasa: number) => {
  const { error } = await supabase
    .from('config')
    .upsert({ key: 'tasa_cambio', value: newTasa.toString() }, { onConflict: 'key' });
  if (error) throw error;
};

export const fetchConfigFromSupabase = async (key: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('config')
      .select('value')
      .eq('key', key)
      .single();
    
    if (error) return null;
    return data?.value || null;
  } catch (e) {
    return null;
  }
};
