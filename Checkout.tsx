import React, { useState, useEffect } from 'react';
import { useCart, API_BASE_URL, sanitizePrice } from './CartContext';
import { Cliente } from './types';

const Checkout: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { cart, cartTotal, clearCart, tasaDolar, departments = [], whatsappPrincipal } = useCart();
  const [shippingMethod, setShippingMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedDeptoIndex, setSelectedDeptoIndex] = useState(-1);
  const [formData, setFormData] = useState<Cliente>({
    nombre: '',
    telefono: '',
    direccion: '',
    notas: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    if (cart.length > 0 && Array.isArray(departments) && departments.length > 0 && selectedDeptoIndex === -1) {
      const firstProduct = cart[0];
      const sellerPhone = firstProduct.whatsapp_vendedor;
      const idx = departments.findIndex(d => 
        d.telefono === sellerPhone || 
        d.id === firstProduct.categoria
      );
      if (idx !== -1) setSelectedDeptoIndex(idx);
    }
  }, [cart, departments]);

  const generateWhatsAppMessage = (orderId: string) => {
    const safeTotal = sanitizePrice(cartTotal);
    const safeTasa = sanitizePrice(tasaDolar);
    const totalBs = (safeTotal * safeTasa).toLocaleString('es-VE', { minimumFractionDigits: 2 });
    
    const itemsList = cart.map(item => {
      const p = sanitizePrice(item.precio);
      const q = Number(item.cantidadSeleccionada) || 0;
      return `- ${q}x ${item.nombre} ($${(p * q).toFixed(2)})`;
    }).join('%0A');
    
    let text = `*NUEVO PEDIDO JX4: ${orderId}*%0A%0A`;
    text += `*Método:* ${shippingMethod === 'delivery' ? 'Delivery 🛵' : 'Retiro 🏬'}%0A`;
    text += `*Cliente:* ${formData.nombre || 'Cliente'}%0A`;
    if (shippingMethod === 'delivery') {
      text += `*Tel:* ${formData.telefono}%0A`;
      text += `*Dir:* ${formData.direccion}%0A`;
    }
    if (formData.notas) text += `*Notas:* ${formData.notas}%0A`;
    text += `%0A*DETALLE:*%0A${itemsList}%0A%0A`;
    text += `*TOTAL A PAGAR:*%0A*USD:* $${safeTotal.toFixed(2)}%0A*Bs.:* ${totalBs}`;

    let phone = String(whatsappPrincipal || "584241208234");
    if (selectedDeptoIndex !== -1 && departments[selectedDeptoIndex]) {
      phone = String(departments[selectedDeptoIndex].telefono);
    }
    const cleanPhone = phone.replace(/[^\d]/g, '');
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const orderId = `PED-${new Date().getTime().toString().slice(-6)}`;
    try {
      await fetch(API_BASE_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
            action: 'create_order',
            idPedido: orderId,
            cliente: shippingMethod === 'pickup' ? { nombre: formData.nombre || 'Retiro', telefono: '', direccion: 'TIENDA' } : formData,
            productos: cart.map(i => ({ id: i.id, cantidad: i.cantidadSeleccionada, nombre: i.nombre, precio: sanitizePrice(i.precio) })),
            total: sanitizePrice(cartTotal)
        })
      });
      setSuccessId(orderId);
    } catch (err) {
      setSuccessId(orderId);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successId) {
    return (
      <div className="min-h-screen bg-[#fdfdfb] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-[#3d4a3e]/10 p-10 rounded-full text-[#3d4a3e] mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 className="text-3xl font-black text-[#2d2d2d] mb-4">¡Pedido Listo!</h2>
        <p className="text-[#6b7280] mb-10 max-w-xs font-medium">Finaliza enviando el comprobante por WhatsApp.</p>
        <button onClick={() => { window.open(generateWhatsAppMessage(successId), '_blank'); clearCart(); onBack(); }} className="w-full max-w-sm bg-[#25D366] text-white py-5 rounded-3xl font-black shadow-xl shadow-green-100 flex items-center justify-center gap-3">
           ENVIAR WHATSAPP
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfdfb] pb-20 animate-fade-in">
      <header className="bg-white border-b border-gray-100 p-4 flex items-center gap-4 sticky top-0 z-50">
        <button onClick={onBack} className="p-2 hover:bg-gray-50 rounded-full text-[#2d2d2d]">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 className="text-lg font-black text-[#2d2d2d] uppercase italic">Finalizar Pedido</h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="flex bg-[#f3f4f3] p-1.5 rounded-[1.5rem]">
            <button onClick={() => setShippingMethod('delivery')} className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${shippingMethod === 'delivery' ? 'bg-white shadow-sm text-[#3d4a3e]' : 'text-[#9ca3af]'}`}>🛵 Delivery</button>
            <button onClick={() => setShippingMethod('pickup')} className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${shippingMethod === 'pickup' ? 'bg-white shadow-sm text-[#3d4a3e]' : 'text-[#9ca3af]'}`}>🏬 Retiro</button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 space-y-8">
            <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#6b7280] uppercase ml-4 tracking-widest">Nombre Completo</label>
                  <input required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full bg-[#f8f9f8] border border-gray-100 rounded-2xl p-5 outline-none focus:bg-white focus:border-[#3d4a3e]/30 transition-all font-bold text-[#2d2d2d]" />
                </div>
                
                {shippingMethod === 'delivery' && (
                    <>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-[#6b7280] uppercase ml-4 tracking-widest">Teléfono</label>
                          <input required type="tel" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} className="w-full bg-[#f8f9f8] border border-gray-100 rounded-2xl p-5 outline-none focus:bg-white focus:border-[#3d4a3e]/30 transition-all font-bold text-[#2d2d2d]" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-[#6b7280] uppercase ml-4 tracking-widest">Dirección de Entrega</label>
                          <textarea required value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} rows={3} className="w-full bg-[#f8f9f8] border border-gray-100 rounded-2xl p-5 outline-none focus:bg-white focus:border-[#3d4a3e]/30 transition-all font-bold text-[#2d2d2d]" />
                        </div>
                    </>
                )}
            </div>

            <div className="pt-8 border-t border-gray-100 text-center">
                <div className="flex justify-between items-center mb-8 px-4">
                    <span className="text-[#9ca3af] font-black uppercase text-[10px] tracking-[0.2em]">Total Pedido</span>
                    <span className="text-4xl font-black text-[#2d2d2d] italic tracking-tighter">${sanitizePrice(cartTotal).toFixed(2)}</span>
                </div>
                <button type="submit" disabled={isSubmitting || cart.length === 0} className="w-full bg-[#3d4a3e] text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] shadow-xl shadow-[#3d4a3e]/20 active:scale-95 transition-all disabled:opacity-50">
                    {isSubmitting ? "Sincronizando..." : "Confirmar Pedido"}
                </button>
            </div>
        </form>
      </main>
    </div>
  );
};

export default Checkout;