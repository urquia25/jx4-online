
import * as sb from './supabase';
import { Order } from '../types';

export const fetchAppData = async () => {
  try {
    const [productos, departamentos, config] = await Promise.all([
      sb.fetchProducts(),
      sb.fetchDepts(),
      sb.fetchAllConfig()
    ]);

    // Adaptamos los nombres de los campos de Supabase a los tipos de la App
    const normalizedProducts = (productos || []).map((p: any) => ({
      ...p,
      imagenurl: p.imagen_url || p.imagenurl || ''
    }));

    return {
      productos: normalizedProducts,
      departamentos: departamentos || [],
      config: config || {},
      cintillo: config.cintillo ? [{ texto: config.cintillo, tipo: 'info' }] : [],
      tasa_cambio: parseFloat(config.tasa_cambio) || 36.5
    };
  } catch (error) {
    console.error('Error fetching data from Supabase:', error);
    throw error;
  }
};

export const searchCustomer = async (phone: string) => {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    const orders = await sb.fetchOrdersFromSupabase(cleanPhone);
    if (orders && orders.length > 0) {
      // Retornamos el perfil más reciente
      return {
        nombre: orders[0].nombre_cliente,
        direccion: orders[0].direccion_entrega
      };
    }
  } catch (e) {
    console.warn('Error buscando cliente en historial:', e);
  }
  return null;
};

export const createOrderInGAS = async (order: Order) => {
  // En v11.0, esta función simplemente guarda en Supabase
  const id_pedido = `PED-${Date.now()}`;
  await sb.saveOrderToSupabase({ ...order, id_pedido });
  return { success: true, order_id: id_pedido };
};

export const updateExchangeRateInGAS = async (newTasa: number) => {
  return await sb.updateConfigValue('tasa_cambio', newTasa.toString());
};

export const updateCintilloInGAS = async (value: string) => {
  return await sb.updateConfigValue('cintillo', value);
};
