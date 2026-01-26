
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, CreditCard, MapPin, Phone, User, Send, ChevronRight, Trash2, Plus, Minus, AlertTriangle, Layers, AlertCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAppContext } from '../contexts/AppContext';
import { searchCustomer, createOrderInGAS } from '../services/api';
import { saveOrderToSupabase } from '../services/supabase';
import { formatCurrency, formatBs, transformDriveUrl } from '../utils/formatters';
import { generateWhatsAppMessage } from '../utils/whatsapp';

const CheckoutPage: React.FC = () => {
  const { cart, cartTotal, cartCount, updateQuantity, removeFromCart, clearCart, cartDepartment } = useCart();
  const { config, categories } = useAppContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    telefono: '',
    nombre: '',
    direccion: '',
    metodo_pago: 'efectivo' as 'efectivo' | 'transferencia' | 'pago_movil',
    notas: ''
  });

  const destinationNumber = useMemo(() => {
    if (cart.length === 0) return config.whatsapp_principal;
    const currentDept = categories.find(c => c.nombre === cartDepartment);
    return currentDept?.telefono || config.whatsapp_principal;
  }, [cart, categories, config.whatsapp_principal, cartDepartment]);

  const handlePhoneBlur = async () => {
    if (formData.telefono.length >= 10) {
      const customer = await searchCustomer(formData.telefono);
      if (customer) {
        setFormData(prev => ({ ...prev, nombre: customer.nombre, direccion: customer.direccion }));
      }
    }
  };

  const isWeighted = (item: any) => 
    item.unidad === 'kg' || 
    item.categoria?.toLowerCase().includes('carniceria') || 
    item.categoria?.toLowerCase().includes('charcuteria') ||
    item.categoria?.toLowerCase().includes('frutas') ||
    item.categoria?.toLowerCase().includes('verduras');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);
    setErrorStatus(null);

    const orderData = {
      ...formData,
      productos: cart,
      total: cartTotal,
      totalVes: cartTotal * config.tasa_cambio,
      fecha: new Date().toISOString()
    };

    try {
      // 1. Crear en Google Sheets (Backend v10.1.2)
      const gasResult = await createOrderInGAS(orderData);
      
      // 2. Intentar guardar en Supabase (Segundo plano)
      try {
        await saveOrderToSupabase({
          ...orderData,
          id_pedido: gasResult.order_id || `PED-${Date.now()}`
        });
      } catch (sbErr) {
        console.warn('Backup Supabase fallido:', sbErr);
      }

      // 3. Determinar enlace de WhatsApp (Prioridad al del servidor)
      const waLink = gasResult.pedido?.enlace_whatsapp || generateWhatsAppMessage(orderData, destinationNumber);
      
      clearCart();
      window.open(waLink, '_blank');
      navigate('/mis-pedidos');
    } catch (error: any) {
      console.error('Submit Error:', error);
      setErrorStatus(error.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  if (cartCount === 0) {
    return (
      <div className="max-w-lg mx-auto py-20 px-4 text-center">
        <div className="w-20 h-20 bg-offwhite rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={40} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-primary mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-500 mb-8">¡Explora nuestro catálogo y agrega tus productos favoritos!</p>
        <button onClick={() => navigate('/')} className="bg-primary text-white px-8 py-3 rounded-full font-bold">
          Ver Catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 pt-10">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-primary flex items-center gap-3">
            <ShoppingBag size={28} /> Resumen del Pedido
          </h2>
          <div className="px-4 py-1.5 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/10">
            {cartDepartment}
          </div>
        </div>

        {errorStatus && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in zoom-in-95">
            <AlertCircle size={20} />
            <p className="text-xs font-bold uppercase tracking-widest">Error: {errorStatus}</p>
          </div>
        )}

        <div className="bg-white rounded-custom p-8 shadow-sm border border-gray-100 flex flex-col gap-6">
          <div className="space-y-6">
            {cart.map(item => {
              const weighted = isWeighted(item);
              return (
                <div key={item.id} className="flex items-start gap-4 border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                  <div className="w-16 h-16 bg-offwhite rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-50 p-1">
                    <img src={transformDriveUrl(item.imagenurl)} alt="" className="w-full h-full object-contain mix-blend-multiply" 
                      onError={(e) => (e.currentTarget.src = 'https://ui-avatars.com/api/?name=JX&background=3d4a3e&color=fff')} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-primary leading-tight mb-1">{item.nombre}</h4>
                    {weighted && (
                      <span className="inline-flex items-center gap-1 text-[9px] text-amber-600 font-bold mt-2 bg-amber-50 px-2 py-0.5 rounded-full">
                        <AlertTriangle size={10} /> Sujeto a peso final
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center bg-offwhite rounded-xl p-1 border border-gray-100">
                      <button onClick={() => updateQuantity(item.id, item.quantity - (weighted ? 0.1 : 1))} className="p-1.5 text-primary hover:bg-white rounded-lg transition-colors"><Minus size={14}/></button>
                      <input type="number" step={weighted ? "0.001" : "1"} className="w-14 text-center bg-transparent font-black text-xs outline-none" value={weighted ? item.quantity.toFixed(2) : item.quantity} onChange={(e) => updateQuantity(item.id, parseFloat(e.target.value) || 0)} />
                      <button onClick={() => updateQuantity(item.id, item.quantity + (weighted ? 0.1 : 1))} className="p-1.5 text-primary hover:bg-white rounded-lg transition-colors"><Plus size={14}/></button>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-primary">{formatCurrency(item.precio * item.quantity)}</div>
                      <button onClick={() => removeFromCart(item.id)} className="text-error/40 hover:text-error transition-colors p-1"><Trash2 size={14}/></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-8 border-t border-gray-100 space-y-4">
            <div className="flex justify-between items-center px-2">
              <span className="text-gray-400 font-bold text-sm uppercase tracking-widest">Subtotal Ref.</span>
              <span className="font-black text-primary text-xl">{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex justify-between items-center p-6 bg-primary rounded-[2rem] text-white shadow-xl shadow-primary/20">
              <span className="font-black text-xs uppercase tracking-[0.2em]">Total Bs.</span>
              <div className="text-right">
                <div className="text-2xl font-black">{formatBs(cartTotal * config.tasa_cambio)}</div>
                <div className="text-[10px] opacity-60 font-bold text-right">Tasa: {config.tasa_cambio} Bs.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <h2 className="text-2xl font-black text-primary flex items-center gap-3">
          <MapPin size={28} /> Finalizar Pedido
        </h2>
        
        <div className="bg-white rounded-custom p-8 shadow-sm border border-gray-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Tu Teléfono</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input type="tel" required placeholder="0424..." className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-offwhite font-bold outline-none focus:ring-2 focus:ring-primary/5" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} onBlur={handlePhoneBlur} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Nombre</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input type="text" required className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-offwhite font-bold outline-none focus:ring-2 focus:ring-primary/5" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Dirección de Entrega</label>
            <textarea required rows={3} placeholder="Sector, calle, punto de referencia..." className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-offwhite font-bold outline-none focus:ring-2 focus:ring-primary/5 resize-none" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Método de Pago</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['efectivo', 'transferencia', 'pago_movil'] as const).map(method => (
                <button key={method} type="button" onClick={() => setFormData({...formData, metodo_pago: method})} className={`py-4 rounded-2xl font-black uppercase text-[9px] tracking-[0.2em] border transition-all ${formData.metodo_pago === method ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}>
                  {method.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Notas Adicionales (Opcional)</label>
            <textarea rows={2} className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-offwhite font-bold outline-none focus:ring-2 focus:ring-primary/5 resize-none" value={formData.notas} onChange={e => setFormData({...formData, notas: e.target.value})} />
          </div>
        </div>

        <button disabled={loading} className="w-full bg-accent text-white py-7 rounded-custom font-black text-xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:hover:scale-100">
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span>PROCESANDO...</span>
            </div>
          ) : (
            <><Send size={24} /> ENVIAR PEDIDO A WHATSAPP</>
          )}
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;
