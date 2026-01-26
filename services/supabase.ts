import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from '../constants';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const saveOrderToSupabase = async (order: any) => {
  // Consolidamos la información para que coincida con el esquema esperado por el script v10.1.2
  // El error PGRST204 confirmaba que 'status' no existe, se cambia a 'estado'
  
  const payload = {
    id_pedido: order.id_pedido || `PED-${Date.now()}`,
    telefono_cliente: order.telefono, // Cambiado de 'telefono' a 'telefono_cliente'
    nombre_cliente: order.nombre,
    direccion_entrega: order.direccion,
    productos: order.productos, 
    total: order.total,
    metodo_pago: order.metodo_pago,
    notas: order.notas || '',
    estado: 'PENDIENTE', // Cambiado de 'status' a 'estado'
    fecha_pedido: new Date().toISOString(),
    departamento: order.productos[0]?.departamento || 'General'
  };

  const { data, error } = await supabase
    .from('pedidos')
    .insert([payload]);
    
  if (error) {
    console.error('Supabase Insert Error:', error);
    // Si falla por columnas específicas, intentamos un insert ultra-mínimo
    if (error.code === 'PGRST204') {
      console.warn('Re-intentando insert simplificado...');
      const simplifiedPayload: any = {
        telefono_cliente: order.telefono,
        total: order.total,
        productos: order.productos,
        estado: 'PENDIENTE'
      };
      const { data: retryData, error: retryError } = await supabase
        .from('pedidos')
        .insert([simplifiedPayload]);
      if (retryError) throw retryError;
      return retryData;
    }
    throw error;
  }
  return data;
};

export const fetchOrdersFromSupabase = async (phone?: string) => {
  try {
    // Intentamos buscar por 'telefono_cliente' que es el estándar del script v10.1.2
    let query = supabase.from('pedidos').select('*');
    
    if (phone) {
      // Limpiar el teléfono para la búsqueda
      const cleanPhone = phone.replace(/\D/g, '');
      // Buscamos tanto en 'telefono_cliente' como en 'telefono' por si acaso
      query = query.or(`telefono_cliente.eq.${cleanPhone},telefono.eq.${cleanPhone}`);
    }
    
    const { data, error } = await query.order('id_pedido', { ascending: false });
    
    if (error) {
      // Si falla el ordenamiento por created_at o id_pedido, traemos sin orden
      console.warn('Error en query avanzada, intentando básica:', error.message);
      const simpleQuery = supabase.from('pedidos').select('*');
      if (phone) {
        const cleanPhone = phone.replace(/\D/g, '');
        simpleQuery.or(`telefono_cliente.eq.${cleanPhone},telefono.eq.${cleanPhone}`);
      }
      const { data: simpleData, error: simpleError } = await simpleQuery;
      if (simpleError) throw simpleError;
      return simpleData;
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