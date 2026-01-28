
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, CreditCard, MapPin, Phone, User, Send, Trash2, Plus, Minus, AlertTriangle, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAppContext } from '../contexts/AppContext';
import { searchCustomer, createOrderInGAS } from '../services/api';
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
      departamento: cartDepartment || 'General'
    };

    try {
      await createOrderInGAS(orderData);
      const waLink = generateWhatsAppMessage(orderData, destinationNumber);
      clearCart();
      window.open(waLink, '_blank');
      navigate('/mis-pedidos');
    } catch (error: any) {
      setErrorStatus(error.message || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  if (cartCount === 0) {
    return (
      <div className="max-w-lg mx-auto py-32 px-4 text-center animate-in fade-in">
        <div className="w-24 h-24 bg-offwhite rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-gray-50 shadow-inner">
          <ShoppingBag size={48} className="text-gray-200" />
        </div>
        <h2 className="text-3xl font-black text-primary mb-4">Carrito Vacío</h2>
        <button onClick={() => navigate('/')} className="bg-primary text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl">
          Ir al Catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16 pt-10 animate-in fade-in">
      <div className="flex flex-col gap-8">
        <h2 className="text-3xl font-black text-primary flex items-center gap-4">
          <ShoppingBag size={32} /> Tu Pedido
        </h2>
        
        {errorStatus && (
          <div className="p-5 bg-red-50 border border-red-100 rounded-[2rem] flex items-center gap-4 text-red-600">
            <AlertCircle size={24} />
            <p className="text-xs font-bold">{errorStatus}</p>
          </div>
        )}

        <div className="bg-white rounded-custom p-10 shadow-sm border border-gray-100 flex flex-col gap-8">
          <div className="space-y-8">
            {cart.map(item => {
              const weighted = isWeighted(item);
              return (
                <div key={item.id} className="flex items-start gap-6 border-b border-gray-50 pb-8 last:border-0 last:pb-0">
                  <div className="w-20 h-20 bg-offwhite rounded-3xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-50 p-2">
                    <img src={transformDriveUrl(item.imagen_url)} alt="" className="w-full h-full object-contain mix-blend-multiply" 
                      onError={(e) => (e.currentTarget.src = 'https://ui-avatars.com/api/?name=JX&background=3d4a3e&color=fff')} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-primary text-lg leading-tight mb-2">{item.nombre}</h4>
                    {weighted && <span className="text-[9px] text-amber-600 font-black uppercase tracking-widest bg-amber-50 px-2 py-1 rounded">Peso Referencial</span>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center bg-offwhite rounded-xl p-1 border border-gray-100">
                      <button onClick={() => updateQuantity(item.id!, item.quantity - (weighted ? 0.1 : 1))} className="p-1"><Minus size={14}/></button>
                      <span className="w-10 text-center font-black text-xs">{weighted ? item.quantity.toFixed(2) : item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id!, item.quantity + (weighted ? 0.1 : 1))} className="p-1"><Plus size={14}/></button>
                    </div>
                    <div className="font-black text-primary">{formatCurrency(item.precio * item.quantity)}</div>
                    <button onClick={() => removeFromCart(item.id!)} className="text-red-300 hover:text-red-500"><Trash2 size={12}/></button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-10 border-t border-gray-100">
            <div className="flex justify-between items-center p-8 bg-primary rounded-[2.5rem] text-white shadow-2xl">
              <div>
                <span className="font-black text-[10px] uppercase opacity-60 tracking-[0.4em]">Total a Pagar</span>
                <div className="text-4xl font-black mt-1">{formatBs(cartTotal * config.tasa_cambio)}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-black uppercase bg-white/10 px-3 py-1 rounded-lg tracking-widest">Tasa {config.tasa_cambio}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        <h2 className="text-3xl font-black text-primary flex items-center gap-4">
          <MapPin size={32} /> Entrega y Pago
        </h2>
        <div className="bg-white rounded-custom p-10 shadow-sm border border-gray-100 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative">
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input type="tel" required className="w-full pl-16 pr-6 py-5 rounded-2xl bg-offwhite font-bold outline-none" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} onBlur={handlePhoneBlur} />
                {autofilling && <RefreshCw className="absolute right-6 top-1/2 -translate-y-1/2 animate-spin text-accent" size={16} />}
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Nombre</label>
              <input type="text" required className="w-full px-8 py-5 rounded-2xl bg-offwhite font-bold outline-none" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Dirección</label>
            <textarea required rows={3} className="w-full px-8 py-5 rounded-2xl bg-offwhite font-bold outline-none resize-none" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
          </div>
          <div>
            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Método de Pago</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['efectivo', 'transferencia', 'pago_movil'].map(method => (
                <button key={method} type="button" onClick={() => setFormData({...formData, metodo_pago: method as any})} className={`py-4 rounded-xl font-black uppercase text-[10px] tracking-widest border transition-all ${formData.metodo_pago === method ? 'bg-primary text-white border-primary shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'}`}>{method.replace('_', ' ')}</button>
              ))}
            </div>
          </div>
        </div>
        <button disabled={loading} className="w-full bg-accent text-white py-8 rounded-custom font-black text-xl shadow-2xl flex items-center justify-center gap-5 hover:scale-[1.02] active:scale-95 transition-all">
          <Send size={28} /> {loading ? 'PROCESANDO...' : 'ENVIAR POR WHATSAPP'}
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;
