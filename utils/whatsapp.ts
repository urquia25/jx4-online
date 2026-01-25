import { Order, CartItem } from '../types';
import { formatCurrency, formatBs } from './formatters';

export const generateWhatsAppMessage = (order: Order, whatsappNumber: string) => {
  const isWeighted = (item: any) => 
    item.unidad === 'kg' || 
    item.categoria?.toLowerCase().includes('carniceria') || 
    item.categoria?.toLowerCase().includes('charcuteria') ||
    item.categoria?.toLowerCase().includes('frutas') ||
    item.categoria?.toLowerCase().includes('verduras');

  const deptName = order.productos[0]?.categoria.toUpperCase() || 'GENERAL';
  
  let productListText = '';
  order.productos.forEach(item => {
    const unitLabel = isWeighted(item) ? 'kg' : 'und';
    const quantity = isWeighted(item) ? item.quantity.toFixed(3) : item.quantity;
    productListText += `• ${item.nombre} [${quantity} ${unitLabel}] - ${formatCurrency(item.precio * item.quantity)}\n`;
  });

  const hasWeightedProducts = order.productos.some(isWeighted);

  const message = `
🚨 *NUEVO PEDIDO - ${deptName}*
---------------------------------
👤 *Cliente:* ${order.nombre}
📞 *Teléfono:* ${order.telefono}
📍 *Dirección:* ${order.direccion}
---------------------------------
🛒 *Detalle del Pedido:*
${productListText}
---------------------------------
💰 *TOTAL:* ${formatCurrency(order.total)}
💵 *TOTAL Bs:* ${formatBs(order.totalVes)}
💳 *Pago:* ${order.metodo_pago.toUpperCase()}
📝 *Notas:* ${order.notas || 'Sin notas adicionales'}
---------------------------------
${hasWeightedProducts ? '⚠️ *AVISO:* Incluye productos sujetos a pesaje. El total exacto será confirmado por el encargado.' : '🕐 *Aviso:* Por favor, contactar al cliente para coordinar logística.'}

_Enviado desde JX4 Paracotos Digital_
  `.trim();

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodedMessage}`;
};