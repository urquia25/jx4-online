
import * as sb from './supabase';
import { Order } from '../types';

export const fetchAppData = async () => {
  try {
    const [productos, departamentos, config] = await Promise.all([
      sb.fetchProducts(),
      sb.fetchDepts(),
      sb.fetchAllConfig()
    ]);

    return {
      productos: productos || [],
      departamentos: departamentos || [],
      config: config || {},
      cintillo: config.cintillo || "✨ ¡Bienvenidos a JX4 Paracotos! Calidad natural en cada pedido. ✨",
      tasa_cambio: parseFloat(config.tasa_cambio) || 36.5
    };
  } catch (error) {
    console.error('Error fetching app data:', error);
    throw error;
  }
};

export const searchCustomer = async (phone: string) => {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    const orders = await sb.fetchOrdersFromSupabase(cleanPhone);
    if (orders && orders.length > 0) {
      return {
        nombre: orders[0].nombre_cliente,
        direccion: orders[0].direccion_entrega
      };
    }
  } catch (e) {
    console.warn('Error fetching customer profile:', e);
  }
  return null;
};

export const createOrderInGAS = async (order: any) => {
  // Ahora es createOrderInSupabase realmente
  const id_pedido = `PED-${Date.now()}`;
  return await sb.saveOrderToSupabase({ ...order, id_pedido });
};

export const updateExchangeRateInGAS = async (newTasa: number) => {
  return await sb.updateConfigValue('tasa_cambio', newTasa.toString());
};

export const updateCintilloInGAS = async (value: string) => {
  return await sb.updateConfigValue('cintillo', value);
};
