import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from '../constants';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const saveOrderToSupabase = async (order: any) => {
  // Consolidamos toda la metadata en 'notas' para evitar errores de esquema (columnas faltantes)
  const consolidatedNotes = `👤 CLIENTE: ${order.nombre || 'N/A'} | 📍 UBICACIÓN: ${order.direccion || 'N/A'} | 📝 NOTAS: ${order.notas || 'Sin notas'}`;
  
  const { data, error } = await supabase
    .from('pedidos')
    .insert([
      {
        telefono: order.telefono,
        // No enviamos 'nombre' ni 'direccion' porque disparan error PGRST204
        total: order.total,
        metodo_pago: order.metodo_pago,
        productos: order.productos, 
        notas: consolidatedNotes,
        status: 'Pendiente'
      }
    ]);
    
  if (error) {
    console.error('Supabase Insert Error:', error);
    throw error;
  }
  return data;
};

export const fetchOrdersFromSupabase = async (phone?: string) => {
  try {
    let query = supabase.from('pedidos').select('*');
    
    if (phone) {
      query = query.eq('telefono', phone);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      if (error.code === 'PGRST204' || error.message.includes('created_at')) {
        const simpleQuery = supabase.from('pedidos').select('*');
        if (phone) simpleQuery.eq('telefono', phone);
        const { data: simpleData, error: simpleError } = await simpleQuery;
        if (simpleError) throw simpleError;
        return simpleData;
      }
      throw error;
    }
    return data;
  } catch (err) {
    console.error('Supabase Fetch Error:', err);
    throw err;
  }
};

export const updateTasaSupabase = async (newTasa: number) => {
  const { error } = await supabase
    .from('config')
    .upsert({ llave: 'tasa_cambio', valor: newTasa.toString() }, { onConflict: 'llave' });
  if (error) throw error;
};

export const fetchConfigFromSupabase = async (key: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('config')
      .select('valor')
      .eq('llave', key)
      .single();
    
    if (error) return null;
    return data?.valor || null;
  } catch (e) {
    return null;
  }
};