
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Added RefreshCw to imports
import { ShoppingBag, CreditCard, MapPin, Phone, User, Send, ChevronRight, Trash2, Plus, Minus, AlertTriangle, Layers, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
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
  const [autofilling, setAutofilling] = useState(false);
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
    const cleanPhone = formData.telefono.replace(/\D/g, '');
    if (cleanPhone.length >= 10) {
      setAutofilling(true);
      try {
        const customer = await searchCustomer(cleanPhone);
        if (customer) {
          setFormData(prev => ({ 
            ...prev, 
            nombre: customer.nombre || prev.nombre, 
            direccion: customer.direccion || prev.direccion 
          }));
        }
      } finally {
        setAutofilling(false);
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
      fecha: new Date().toISOString(),
      departamento: cartDepartment
    };

    try {
      // 1. Guardar en Supabase
      const gasResult = await createOrderInGAS(orderData);
      
      // 2. Determinar enlace de WhatsApp
      const waLink = generateWhatsAppMessage(orderData, destinationNumber);
      
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
      <div className="max-w-lg mx-auto py-32 px-4 text-center animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-offwhite rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-gray-50">
          <ShoppingBag size={48} className="text-gray-200" />
        </div>
        <h2 className="text-3xl font-black text-primary mb-4 tracking-tighter">Tu carrito está vacío</h2>
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-10 px-10">¡Explora nuestro catálogo y descubre la selección natural de hoy!</p>
        <button onClick={() => navigate('/')} className="bg-primary text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 transition-all">
          Ir al Catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16 pt-10 animate-in fade-in duration-700">
      {/* Resumen Section */}
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-primary flex items-center gap-4 tracking-tighter">
            <ShoppingBag size={32} /> Tu Pedido
          </h2>
          <div className="px-6 py-2 bg-primary text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-full shadow-lg shadow-primary/20 border border-primary/20">
            {cartDepartment}
          </div>
        </div>

        {errorStatus && (
          <div className="p-5 bg-red-50 border border-red-100 rounded-[2rem] flex items-center gap-4 text-red-600 animate-in slide-in-from-top-4">
            <AlertCircle size={24} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest">Error al procesar</p>
              <p className="text-xs font-bold opacity-70">{errorStatus}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-custom p-10 shadow-sm border border-gray-100 flex flex-col gap-8">
          <div className="space-y-8">
            {cart.map(item => {
              const weighted = isWeighted(item);
              return (
                <div key={item.id} className="flex items-start gap-6 border-b border-gray-50 pb-8 last:border-0 last:pb-0 group">
                  <div className="w-20 h-20 bg-offwhite rounded-3xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-50 p-2 group-hover:scale-105 transition-transform">
                    <img src={transformDriveUrl(item.imagenurl)} alt="" className="w-full h-full object-contain mix-blend-multiply" 
                      onError={(e) => (e.currentTarget.src = 'https://ui-avatars.com/api/?name=JX&background=3d4a3e&color=fff')} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-primary text-lg leading-tight mb-2">{item.nombre}</h4>
                    {weighted && (
                      <span className="inline-flex items-center gap-2 text-[9px] text-amber-600 font-black uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-lg border border-amber-100/50">
                        <AlertTriangle size={12} /> Sujeto a pesaje
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-4">
                    <div className="flex items-center bg-offwhite rounded-2xl p-1.5 border border-gray-100 shadow-inner">
                      <button onClick={() => updateQuantity(item.id, item.quantity - (weighted ? 0.1 : 1))} className="p-2 text-primary hover:bg-white rounded-xl transition-all"><Minus size={16}/></button>
                      <input type="number" step={weighted ? "0.001" : "1"} className="w-16 text-center bg-transparent font-black text-sm outline-none" value={weighted ? item.quantity.toFixed(2) : item.quantity} onChange={(e) => updateQuantity(item.id, parseFloat(e.target.value) || 0)} />
                      <button onClick={() => updateQuantity(item.id, item.quantity + (weighted ? 0.1 : 1))} className="p-2 text-primary hover:bg-white rounded-xl transition-all"><Plus size={16}/></button>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-primary text-lg">{formatCurrency(item.precio * item.quantity)}</div>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-300 hover:text-red-500 transition-colors p-1 flex items-center gap-1"><Trash2 size={12}/><span className="text-[8px] font-black uppercase">Quitar</span></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-10 border-t border-gray-100 space-y-6">
            <div className="flex justify-between items-center px-4">
              <span className="text-gray-400 font-black text-[10px] uppercase tracking-[0.4em]">Subtotal Ref.</span>
              <span className="font-black text-primary text-2xl tracking-tighter">{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex justify-between items-center p-8 bg-primary rounded-[2.5rem] text-white shadow-2xl shadow-primary/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-150 transition-transform duration-1000">
                <ShoppingBag size={120} />
              </div>
              <div className="relative z-10">
                <span className="font-black text-[10px] uppercase tracking-[0.4em] opacity-60">Total a Pagar</span>
                <div className="text-4xl font-black tracking-tighter mt-1">{formatBs(cartTotal * config.tasa_cambio)}</div>
              </div>
              <div className="text-right relative z-10">
                <div className="text-[9px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-lg">Tasa {config.tasa_cambio} Bs.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        <h2 className="text-3xl font-black text-primary flex items-center gap-4 tracking-tighter">
          <MapPin size={32} /> Finalizar Pedido
        </h2>
        
        <div className="bg-white rounded-custom p-10 shadow-sm border border-gray-100 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative">
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">WhatsApp de Contacto</label>
              <div className="relative group">
                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type="tel" required placeholder="04241234567" 
                  className="w-full pl-16 pr-12 py-5 rounded-2xl border border-gray-50 bg-offwhite font-bold text-primary outline-none focus:ring-4 focus:ring-primary/5 transition-all" 
                  value={formData.telefono} 
                  onChange={e => setFormData({...formData, telefono: e.target.value})} 
                  onBlur={handlePhoneBlur} 
                />
                {autofilling && (
                  <div className="absolute right-5 top-1/2 -translate-y-1/2">
                    <RefreshCw className="animate-spin text-accent" size={16} />
                  </div>
                )}
              </div>
              {formData.nombre && (
                <div className="absolute -bottom-6 left-2 flex items-center gap-2 text-[8px] font-black text-accent uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
                  <Sparkles size={10} /> ¡Te recordamos! Datos autocompletados
                </div>
              )}
            </div>
            <div>
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Tu Nombre</label>
              <div className="relative group">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type="text" required 
                  className="w-full pl-16 pr-6 py-5 rounded-2xl border border-gray-50 bg-offwhite font-bold text-primary outline-none focus:ring-4 focus:ring-primary/5 transition-all" 
                  value={formData.nombre} 
                  onChange={e => setFormData({...formData, nombre: e.target.value})} 
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Dirección de Despacho</label>
            <textarea 
              required rows={4} 
              placeholder="Sector, calle, casa/apto, punto de referencia..." 
              className="w-full px-8 py-5 rounded-2xl border border-gray-50 bg-offwhite font-bold text-primary outline-none focus:ring-4 focus:ring-primary/5 resize-none transition-all" 
              value={formData.direccion} 
              onChange={e => setFormData({...formData, direccion: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-5">Modalidad de Pago</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(['efectivo', 'transferencia', 'pago_movil'] as const).map(method => (
                <button 
                  key={method} 
                  type="button" 
                  onClick={() => setFormData({...formData, metodo_pago: method})} 
                  className={`py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] border transition-all flex items-center justify-center gap-2 ${
                    formData.metodo_pago === method 
                      ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20 -translate-y-1' 
                      : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard size={14} className={formData.metodo_pago === method ? 'opacity-100' : 'opacity-20'} />
                  {method.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Comentarios Adicionales</label>
            <textarea 
              rows={2} 
              className="w-full px-8 py-5 rounded-2xl border border-gray-50 bg-offwhite font-bold text-primary outline-none focus:ring-4 focus:ring-primary/5 resize-none transition-all" 
              placeholder="¿Alguna instrucción especial?"
              value={formData.notas} 
              onChange={e => setFormData({...formData, notas: e.target.value})} 
            />
          </div>
        </div>

        <button 
          disabled={loading} 
          className="w-full bg-accent text-white py-8 rounded-custom font-black text-xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-5 disabled:opacity-50 disabled:hover:scale-100 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          {loading ? (
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span>PROCESANDO ENVÍO...</span>
            </div>
          ) : (
            <span className="flex items-center gap-5 relative z-10">
              <Send size={28} /> ENVIAR PEDIDO A WHATSAPP
            </span>
          )}
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;
