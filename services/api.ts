
import { GAS_URL } from '../constants';
import { Product, Category, AppData, Order, Config } from '../types';

export const fetchAppData = async (): Promise<AppData> => {
  try {
    const response = await fetch(`${GAS_URL}?action=all_data`);
    if (!response.ok) throw new Error('Error al conectar con el servidor');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const searchCustomer = async (phone: string) => {
  try {
    const response = await fetch(`${GAS_URL}?action=buscar_cliente&telefono=${phone}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.success ? data.cliente : null;
  } catch (error) {
    return null;
  }
};

export const createOrderInGAS = async (order: Order) => {
  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors', // GAS post usually works with no-cors or specialized handling
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'crear_pedido', ...order })
    });
    return { success: true }; // with no-cors we can't see the response body
  } catch (error) {
    console.error('GAS Order Error:', error);
    throw error;
  }
};

export const updateExchangeRateInGAS = async (tasa: number) => {
    // Note: Usually GAS requires a POST for updates
    try {
        await fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update_config', key: 'tasa_cambio', value: tasa })
        });
        return { success: true };
    } catch (error) {
        throw error;
    }
}
