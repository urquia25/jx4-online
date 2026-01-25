
import { GAS_URL } from '../constants';
import { Order } from '../types';

export const fetchAppData = async (): Promise<any> => {
  try {
    const response = await fetch(`${GAS_URL}?action=all_data`);
    if (!response.ok) throw new Error('Error al conectar con el servidor');
    const result = await response.json();
    // El backend JX4 Unified v9.4.1 devuelve los datos dentro de la propiedad 'data'
    return result.success ? result.data : null;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const searchCustomer = async (phone: string) => {
  try {
    const response = await fetch(`${GAS_URL}?action=buscar_cliente&telefono=${phone}`);
    if (!response.ok) return null;
    const result = await response.json();
    // El GAS devuelve { success: true, data: { encontrado: true, cliente: { ... } } }
    return result.success && result.data.encontrado ? result.data.cliente : null;
  } catch (error) {
    return null;
  }
};

export const createOrderInGAS = async (order: Order) => {
  try {
    await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'crear_pedido', 
        telefono: order.telefono,
        nombre: order.nombre,
        direccion: order.direccion,
        productos: order.productos,
        metodo_pago: order.metodo_pago,
        notas: order.notas
      })
    });
    return { success: true };
  } catch (error) {
    console.error('GAS Order Error:', error);
    throw error;
  }
};

export const updateExchangeRateInGAS = async (tasa: number) => {
    try {
        await fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'actualizar_tasa', tasa: tasa })
        });
        return { success: true };
    } catch (error) {
        console.error('GAS Update Tasa Error:', error);
        throw error;
    }
}
