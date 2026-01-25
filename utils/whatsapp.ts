
import { Order, CartItem } from '../types';
import { formatCurrency, formatBs } from './formatters';

export const generateWhatsAppMessage = (order: Order, whatsappNumber: string) => {
  const productList = order.productos
    .map(item => `• ${item.nombre} x${item.quantity} - ${formatCurrency(item.precio * item.quantity)}`)
    .join('\n');

  const message = `
📦 *NUEVO PEDIDO - JX4 Paracotos*
------------------------------
👤 *Cliente:* ${order.nombre}
📞 *Teléfono:* ${order.telefono}
📍 *Dirección:* ${order.direccion}
------------------------------
🛍️ *Detalle:*
${productList}
------------------------------
💰 *TOTAL:* ${formatCurrency(order.total)}
💵 *TOTAL Bs:* ${formatBs(order.totalVes)}
💳 *Pago:* ${order.metodo_pago.toUpperCase()}
📝 *Notas:* ${order.notas || 'Ninguna'}
------------------------------
_Pedido generado desde la Web JX4_
  `.trim();

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodedMessage}`;
};
