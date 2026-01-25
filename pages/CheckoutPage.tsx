import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, CreditCard, MapPin, Phone, User, Send, ChevronRight, Trash2, Plus, Minus, AlertTriangle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAppContext } from '../contexts/AppContext';
import { searchCustomer, createOrderInGAS } from '../services/api';
import { saveOrderToSupabase } from '../services/supabase';
// Fix: Added missing import for transformDriveUrl
import { formatCurrency, formatBs, transformDriveUrl } from '../utils/formatters';
import { generateWhatsAppMessage } from '../utils/whatsapp';

const CheckoutPage: React.FC = () => {
  const { cart, cartTotal, cartCount, updateQuantity, removeFromCart, clearCart } = useCart();
  const { config } = useAppContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    telefono: '',
    nombre: '',
    direccion: '',
    metodo_pago: 'efectivo' as 'efectivo' | 'transferencia' | 'pago_movil',
    notas: ''
  });

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
    const orderData = {
      ...formData,
      productos: cart,
      total: cartTotal,
      totalVes: cartTotal * config.tasa_cambio,
      fecha: new Date().toISOString()
    };

    try {
      await createOrderInGAS(orderData);
      await saveOrderToSupabase(orderData);
      const waLink = generateWhatsAppMessage(orderData, config.whatsapp_principal);
      clearCart();
      window.open(waLink, '_blank');
      navigate('/mis-pedidos');
    } catch (error) {
      alert('Hubo un error al procesar el pedido. Por favor intenta de nuevo.');
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
      {/* Resumen del Carrito */}
      <div>
        <h2 className="text-2xl font-black text-primary mb-8 flex items-center gap-3">
          <ShoppingBag size={28} /> Resumen del Pedido
        </h2>
        
        <div className="bg-white rounded-custom p-8 shadow-sm border border-gray-100 flex flex-col gap-6">
          <div className="space-y-6">
            {cart.map(item => {
              const weighted = isWeighted(item);
              return (
                <div key={item.id} className="flex items-start gap-4 border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                  <div className="w-16 h-16 bg-offwhite rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-50">
                    {/* Fix: transformDriveUrl is now correctly imported */}
                    <img src={transformDriveUrl(item.imagenurl)} alt="" className="w-full h-full object-cover" 
                      onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-primary leading-tight mb-1">{item.nombre}</h4>
                    <p className="text-[10px] text-accent font-black uppercase tracking-widest">{item.categoria}</p>
                    {weighted && (
                      <span className="inline-flex items-center gap-1 text-[9px] text-amber-600 font-bold mt-2 bg-amber-50 px-2 py-0.5 rounded-full">
                        <AlertTriangle size={10} /> Sujeto a peso final
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center bg-offwhite rounded-xl p-1 border border-gray-100">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - (weighted ? 0.1 : 1))} 
                        className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-primary"
                      >
                        <Minus size={14}/>
                      </button>
                      
                      <input 
                        type="number" 
                        step={weighted ? "0.001" : "1"}
                        className="w-14 text-center bg-transparent font-black text-xs outline-none"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseFloat(e.target.value) || 0)}
                      />

                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + (weighted ? 0.1 : 1))} 
                        className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-primary"
                      >
                        <Plus size={14}/>
                      </button>
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
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-bold text-sm uppercase tracking-widest">Subtotal Ref.</span>
              <span className="font-black text-primary text-xl">{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex justify-between items-center p-6 bg-primary rounded-[2rem] text-white shadow-xl shadow-primary/20">
              <span className="font-black text-xs uppercase tracking-[0.2em]">Total Bs.</span>
              <div className="text-right">
                <div className="text-2xl font-black">{formatBs(cartTotal * config.tasa_cambio)}</div>
                <div className="text-[10px] opacity-60 font-bold">Tasa: {config.tasa_cambio} Bs.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
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
                <input 
                  type="tel" 
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-offwhite focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold"
                  placeholder="0424..."
                  value={formData.telefono}
                  onChange={e => setFormData({...formData, telefono: e.target.value})}
                  onBlur={handlePhoneBlur}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="text" 
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-offwhite focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold"
                  placeholder="Juan Pérez"
                  value={formData.nombre}
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Dirección de Entrega</label>
            <textarea 
              required
              rows={3}
              className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-offwhite focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold"
              placeholder="Indica calle, casa y punto de referencia..."
              value={formData.direccion}
              onChange={e => setFormData({...formData, direccion: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Método de Pago</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['efectivo', 'transferencia', 'pago_movil'] as const).map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setFormData({...formData, metodo_pago: method})}
                  className={`py-4 rounded-2xl font-black uppercase text-[9px] tracking-[0.2em] transition-all border ${
                    formData.metodo_pago === method 
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' 
                      : 'bg-white text-gray-400 border-gray-100 hover:bg-offwhite'
                  }`}
                >
                  {method.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Comentarios / Notas</label>
            <input 
              type="text" 
              className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-offwhite focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium"
              placeholder="¿Alguna instrucción extra?"
              value={formData.notas}
              onChange={e => setFormData({...formData, notas: e.target.value})}
            />
          </div>
        </div>

        <button 
          disabled={loading}
          className="w-full bg-accent text-white py-7 rounded-custom font-black text-xl shadow-2xl hover:bg-[#c49564] active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
        >
          {loading ? 'Procesando...' : (
            <>
              Confirmar en WhatsApp <Send size={24} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;