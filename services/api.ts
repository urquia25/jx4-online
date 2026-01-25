
import { GAS_URL } from '../constants';
import { Order, Product } from '../types';

export const fetchAppData = async (): Promise<any> => {
  try {
    const response = await fetch(`${GAS_URL}?action=all_data&_t=${Date.now()}`);
    if (!response.ok) throw new Error('Error de red al conectar con JX4 Cloud');
    const result = await response.json();
    
    // El script v10.0.1 devuelve { success: true, data: { productos: [...], ... } }
    if (result.success && result.data) {
      console.log('📦 JX4 Cloud Data Received:', result.data);
      
      const { productos, departamentos, config, cintillo, tasa_cambio } = result.data;

      // Normalizar productos asegurando que los nombres de campos coincidan
      const normalizedProducts: Product[] = (productos || []).map((p: any) => {
        // El precio puede venir como PRECIO o precio dependiendo de la hoja
        const rawPrice = p.precio !== undefined ? p.precio : (p.PRECIO !== undefined ? p.PRECIO : 0);
        let finalPrice = 0;
        
        if (typeof rawPrice === 'string') {
          // Limpiar símbolos de moneda y convertir a número
          finalPrice = parseFloat(rawPrice.replace(/[^\d.-]/g, '')) || 0;
        } else {
          finalPrice = parseFloat(rawPrice) || 0;
        }

        return {
          id: String(p.id || p.ID || ''),
          nombre: String(p.nombre || p.NOMBRE || 'Producto sin nombre'),
          precio: finalPrice,
          categoria: String(p.categoria || p.CATEGORIA || 'General'),
          descripcion: String(p.descripcion || p.DESCRIPCION || ''),
          imagenurl: String(p.imagenurl || p.ImagenURL || p.ImagenURL_Publica || ''),
          disponible: p.disponible !== undefined ? Boolean(p.disponible) : true,
          departamento_id: String(p.departamento || p.DEPARTAMENTO || '')
        };
      }).filter((p: Product) => p.nombre && p.nombre !== 'Producto sin nombre');

      return {
        productos: normalizedProducts,
        departamentos: departamentos || [],
        config: config || {},
        cintillo: cintillo || [],
        tasa_cambio: parseFloat(tasa_cambio) || 36.5
      };
    }
    throw new Error('Estructura de respuesta inválida');
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const searchCustomer = async (phone: string) => {
  try {
    const response = await fetch(`${GAS_URL}?action=buscar_cliente&telefono=${encodeURIComponent(phone)}`);
    const result = await response.json();
    return (result.success && result.data && result.data.encontrado) ? result.data.cliente : null;
  } catch (error) {
    return null;
  }
};

export const createOrderInGAS = async (order: Order) => {
  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'crear_pedido', 
        telefono: order.telefono,
        nombre: order.nombre,
        direccion: order.direccion,
        productos: order.productos.map(p => ({
          id: p.id,
          nombre: p.nombre,
          precio: p.precio,
          cantidad: p.quantity
        })),
        total: order.total,
        metodo_pago: order.metodo_pago,
        notas: order.notas
      })
    });
    return await response.json();
  } catch (error) {
    console.error('GAS Order Error:', error);
    throw error;
  }
};

// Fix: Add missing updateExchangeRateInGAS function used in AdminPage.tsx
export const updateExchangeRateInGAS = async (newTasa: number, user: string, pass: string) => {
  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'actualizar_tasa', 
        tasa: newTasa,
        user,
        pass
      })
    });
    return await response.json();
  } catch (error) {
    console.error('GAS Update Tasa Error:', error);
    throw error;
  }
};
