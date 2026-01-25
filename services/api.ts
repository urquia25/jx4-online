
import { GAS_URL } from '../constants';
import { Order, Product } from '../types';

export const fetchAppData = async (): Promise<any> => {
  try {
    const response = await fetch(`${GAS_URL}?action=all_data&_t=${Date.now()}`);
    if (!response.ok) throw new Error('Error de red al conectar con JX4 Cloud');
    
    const result = await response.json();
    
    if (result.success && result.data) {
      const { productos, departamentos, config, cintillo, tasa_cambio } = result.data;

      // Normalización ultra-robusta de productos
      const normalizedProducts: Product[] = (productos || []).map((p: any) => {
        const rawPrice = p.precio ?? p.PRECIO ?? p.Precio ?? 0;
        let finalPrice = 0;
        
        if (typeof rawPrice === 'string') {
          finalPrice = parseFloat(rawPrice.replace(/[^\d.-]/g, '')) || 0;
        } else {
          finalPrice = parseFloat(rawPrice) || 0;
        }

        const rawImg = p.imagenurl ?? p.ImagenURL ?? p.ImagenURL_Publica ?? p.IMAGENURL ?? '';

        return {
          id: String(p.id ?? p.ID ?? ''),
          nombre: String(p.nombre ?? p.NOMBRE ?? 'Producto sin nombre'),
          precio: finalPrice,
          categoria: String(p.categoria ?? p.CATEGORIA ?? p.DEPARTAMENTO ?? 'General'),
          descripcion: String(p.descripcion ?? p.DESCRIPCION ?? ''),
          imagenurl: String(rawImg),
          disponible: !(p.disponible === false || p.ACTIVO === 'NO' || p.activo === 'no'),
          departamento_id: String(p.departamento ?? p.DEPARTAMENTO ?? '')
        };
      }).filter((p: Product) => p.nombre && p.nombre !== 'Producto sin nombre');

      // Intentar extraer la tasa de cambio de cualquier propiedad posible en config
      let extractedTasa = parseFloat(tasa_cambio);
      if (config && isNaN(extractedTasa) || extractedTasa === 36.5) {
        // Buscar en el objeto config por diversas llaves
        const possibleKeys = ['tasa_cambio', 'tasa', 'TASA', 'TASA_CAMBIO', 'VALOR'];
        for (const key of possibleKeys) {
          if (config[key]) {
            extractedTasa = parseFloat(config[key]);
            break;
          }
        }
      }

      return {
        productos: normalizedProducts,
        departamentos: departamentos || [],
        config: config || {},
        cintillo: cintillo || [],
        tasa_cambio: isNaN(extractedTasa) ? 36.5 : extractedTasa
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
      headers: { 'Content-Type': 'text/plain' }, // Evita preflight OPTIONS innecesarios en GAS
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

export const updateExchangeRateInGAS = async (newTasa: number, user: string, pass: string) => {
  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
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
