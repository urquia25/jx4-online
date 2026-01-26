
import { GAS_URL } from '../constants';
import { Order, Product } from '../types';

/**
 * Obtiene todos los datos sincronizados desde Google Apps Script v10.1.2
 */
export const fetchAppData = async (): Promise<any> => {
  try {
    const response = await fetch(`${GAS_URL}?action=all_data&_t=${Date.now()}`);
    if (!response.ok) throw new Error('Fallo de conexión con JX4 Cloud');
    
    const result = await response.json();
    
    if (result.success && result.data) {
      const { productos, departamentos, config, cintillo, tasa_cambio } = result.data;

      return {
        productos: productos || [],
        departamentos: departamentos || [],
        config: config || {},
        cintillo: cintillo || [],
        tasa_cambio: parseFloat(tasa_cambio) || parseFloat(config?.tasa_cambio) || 36.5
      };
    }
    throw new Error('Estructura de datos inválida desde el servidor');
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Busca un cliente en la base de datos de Google Sheets
 */
export const searchCustomer = async (phone: string) => {
  try {
    const response = await fetch(`${GAS_URL}?action=buscar_cliente&telefono=${encodeURIComponent(phone)}`);
    const result = await response.json();
    return (result.success && result.data && result.data.encontrado) ? result.data.cliente : null;
  } catch (error) {
    return null;
  }
};

/**
 * Crea un nuevo pedido en Google Sheets con compatibilidad total v10.1.2
 */
export const createOrderInGAS = async (order: Order) => {
  try {
    const payload = { 
      action: 'crear_pedido', 
      telefono: order.telefono,
      nombre: order.nombre,
      direccion: order.direccion,
      productos: order.productos.map(p => ({
        id: p.id,
        nombre: p.nombre,
        precio: p.precio,
        quantity: p.quantity, // Debe ser 'quantity' para el script GAS
        unidad: p.unidad || 'und',
        departamento: p.departamento || 'General'
      })),
      total: order.total,
      metodo_pago: order.metodo_pago,
      notas: order.notas
    };

    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Error reportado por el servidor JX4');
    }
    return result;
  } catch (error: any) {
    console.error('GAS Order Error:', error);
    throw error;
  }
};

/**
 * Actualiza la tasa de cambio global en GAS
 */
export const updateExchangeRateInGAS = async (newTasa: number) => {
  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ 
        action: 'actualizar_tasa', 
        tasa: newTasa
      })
    });
    if (!response.ok) throw new Error('Error al actualizar en JX4 Cloud');
    return await response.json();
  } catch (error) {
    console.error('GAS Update Tasa Error:', error);
    throw error;
  }
};

// Fix: Rename updateConfigInGAS to updateCintilloInGAS to fix the error in AdminPage.tsx
/**
 * Actualiza el texto del cintillo en GAS
 */
export const updateCintilloInGAS = async (value: string) => {
  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ 
        action: 'actualizar_config', 
        clave: 'cintillo',
        valor: value
      })
    });
    return await response.json();
  } catch (error) {
    console.error('GAS Update Cintillo Error:', error);
    throw error;
  }
};
