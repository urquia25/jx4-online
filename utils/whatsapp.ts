
import { Order, CartItem } from '../types';
import { formatCurrency, formatBs } from './formatters';

export const generateWhatsAppMessage = (order: Order, whatsappNumber: string) => {
  const isWeighted = (item: any) => 
    item.unidad === 'kg' || 
    item.categoria?.toLowerCase().includes('carniceria') || 
    item.categoria?.toLowerCase().includes('charcuteria') ||
    item.categoria?.toLowerCase().includes('frutas') ||
    item.categoria?.toLowerCase().includes('verduras');

  const productList = order.productos
    .map(item => {
      const unitLabel = isWeighted(item) ? 'kg' : 'und';
      const quantity = isWeighted(item) ? item.quantity.toFixed(3) : item.quantity;
      return `• ${item.nombre} [${quantity} ${unitLabel}] - ${formatCurrency(item.precio * item.quantity)}`;
    })
    .join('\n');

  const hasWeightedProducts = order.productos.some(isWeighted);

  const message = `
📦 *NUEVO PEDIDO - JX4 Paracotos*
------------------------------
👤 *Cliente:* ${order.nombre}
📞 *Teléfono:* ${order.telefono}
📍 *Dirección:* ${order.direccion}
------------------------------
🛍️ *Detalle del Pedido:*
${productList}
------------------------------
💰 *TOTAL:* ${formatCurrency(order.total)}
💵 *TOTAL Bs:* ${formatBs(order.totalVes)}
💳 *Pago:* ${order.metodo_pago.toUpperCase()}
📝 *Notas:* ${order.notas || 'Ninguna'}
------------------------------
${hasWeightedProducts ? '⚠️ *AVISO:* Este pedido incluye productos por peso. El total final será confirmado tras el pesaje exacto.' : ''}
_Pedido generado desde la Web JX4_
  `.trim();

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodedMessage}`;
};
