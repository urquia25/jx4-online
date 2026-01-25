
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, CreditCard, MapPin, Phone, User, Send, ChevronRight, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAppContext } from '../contexts/AppContext';
import { searchCustomer, createOrderInGAS } from '../services/api';
import { saveOrderToSupabase } from '../services/supabase';
import { formatCurrency, formatBs } from '../utils/formatters';
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
      // 1. Guardar en GAS
      await createOrderInGAS(orderData);
      // 2. Guardar en Supabase
      await saveOrderToSupabase(orderData);
      
      // 3. Generar WhatsApp
      const waLink = generateWhatsAppMessage(orderData, config.whatsapp_principal);
      
      // 4. Limpiar y redirigir
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
    <div className="max-w-7xl mx-auto px-4 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Resumen del Carrito */}
      <div>
        <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
          <ShoppingBag size={24} /> Resumen de Compra
        </h2>
        <div className="bg-white rounded-custom p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
          {cart.map(item => (
            <div key={item.id} className="flex items-center gap-4 border-b border-gray-50 pb-4">
              <div className="w-16 h-16 bg-offwhite rounded-xl flex-shrink-0 flex items-center justify-center">
                {item.nombre.charAt(0)}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-primary">{item.nombre}</h4>
                <p className="text-sm text-gray-400">{formatCurrency(item.precio)}</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 rounded-full hover:bg-gray-100"><Minus size={16}/></button>
                <span className="font-bold w-4 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 rounded-full hover:bg-gray-100"><Plus size={16}/></button>
              </div>
              <div className="text-right ml-4">
                <div className="font-bold text-primary">{formatCurrency(item.precio * item.quantity)}</div>
                <button onClick={() => removeFromCart(item.id)} className="text-error p-1 hover:bg-red-50 rounded-full"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}

          <div className="pt-4 flex flex-col gap-2">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-2xl font-black text-primary border-t pt-4">
              <span>TOTAL</span>
              <div className="text-right">
                <div>{formatCurrency(cartTotal)}</div>
                <div className="text-sm text-gray-400 font-bold">{formatBs(cartTotal * config.tasa_cambio)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de Pedido */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <MapPin size={24} /> Datos de Entrega
        </h2>
        
        <div className="bg-white rounded-custom p-8 shadow-sm border border-gray-100 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Teléfono</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                type="tel" 
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="Ej: 04241234567"
                value={formData.telefono}
                onChange={e => setFormData({...formData, telefono: e.target.value})}
                onBlur={handlePhoneBlur}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Nombre Completo</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                type="text" 
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="Nombre del cliente"
                value={formData.nombre}
                onChange={e => setFormData({...formData, nombre: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Dirección Exacta</label>
            <textarea 
              required
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Referencia, piso, local..."
              value={formData.direccion}
              onChange={e => setFormData({...formData, direccion: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Método de Pago</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['efectivo', 'transferencia', 'pago_movil'] as const).map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setFormData({...formData, metodo_pago: method})}
                  className={`py-3 rounded-xl font-bold capitalize transition-all border ${
                    formData.metodo_pago === method ? 'bg-primary text-white border-primary shadow-lg scale-105' : 'bg-white text-gray-400 border-gray-100 hover:bg-offwhite'
                  }`}
                >
                  {method.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Notas Adicionales</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="¿Alguna instrucción especial?"
              value={formData.notas}
              onChange={e => setFormData({...formData, notas: e.target.value})}
            />
          </div>
        </div>

        <button 
          disabled={loading}
          className="w-full bg-primary text-white py-6 rounded-custom font-black text-xl shadow-xl hover:bg-[#2d3a2e] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? 'Procesando...' : (
            <>
              Confirmar y Enviar a WhatsApp <Send size={24} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;
