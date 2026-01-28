
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from '../constants';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- PRODUCTOS ---
export const fetchProducts = async () => {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('nombre', { ascending: true });
  if (error) throw error;
  return data;
};

export const upsertProduct = async (product: any) => {
  const { data, error } = await supabase
    .from('productos')
    .upsert([product]);
  if (error) throw error;
  return data;
};

export const deleteProduct = async (id: string) => {
  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

// --- CONFIGURACIÓN ---
export const fetchAllConfig = async () => {
  const { data, error } = await supabase.from('config').select('*');
  if (error) throw error;
  const configMap: any = {};
  data.forEach(item => { configMap[item.llave] = item.valor; });
  return configMap;
};

export const updateConfigValue = async (key: string, value: string) => {
  const { error } = await supabase
    .from('config')
    .upsert({ llave: key, valor: value }, { onConflict: 'llave' });
  if (error) throw error;
};

// --- DEPARTAMENTOS ---
export const fetchDepts = async () => {
  const { data, error } = await supabase.from('departamentos').select('*');
  if (error) throw error;
  return data;
};

// --- PEDIDOS ---
export const saveOrderToSupabase = async (order: any) => {
  const { data, error } = await supabase
    .from('pedidos')
    .insert([{
      id_pedido: order.id_pedido,
      telefono_cliente: order.telefono,
      nombre_cliente: order.nombre,
      direccion_entrega: order.direccion,
      productos: order.productos,
      total: order.total,
      metodo_pago: order.metodo_pago,
      notas: order.notas,
      estado: 'Pendiente',
      fecha_pedido: new Date().toISOString(),
      departamento: order.departamento
    }])
    .select();
  if (error) throw error;
  return data;
};

export const fetchOrdersFromSupabase = async (phone?: string) => {
  let query = supabase.from('pedidos').select('*').order('fecha_pedido', { ascending: false });
  if (phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    query = query.eq('telefono_cliente', cleanPhone);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// --- STORAGE ---
export const uploadProductImage = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `catalog/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('producto-imagenes')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('producto-imagenes')
    .getPublicUrl(filePath);

  return data.publicUrl;
};
