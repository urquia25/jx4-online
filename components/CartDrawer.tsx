import React from 'react';
import { useCart, sanitizePrice } from '../CartContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onCheckout }) => {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount, getCleanImageUrl, tasaDolar } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Tu Carrito</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="bg-gray-50 p-6 rounded-full text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              </div>
              <p className="text-gray-400 font-medium">El carrito está vacío</p>
              <button onClick={onClose} className="text-gray-900 font-bold underline text-xs uppercase tracking-widest">Ver Catálogo</button>
            </div>
          ) : (
            cart.map(item => {
              const precioItem = sanitizePrice(item.precio);
              const subtotalItem = precioItem * item.cantidadSeleccionada;
              const imgUrl = getCleanImageUrl(item);
              return (
                <div key={item.id} className="flex gap-4 group animate-fade-in">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                    <img 
                        src={imgUrl} 
                        alt={item.nombre} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.nombre)}&background=f3f4f6&color=9ca3af&size=100&bold=true`;
                        }}
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xs font-black text-gray-900 uppercase tracking-tight line-clamp-1 leading-tight">{item.nombre}</h3>
                      <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-end mt-2">
                      <div className="flex items-center border border-gray-100 rounded-xl overflow-hidden bg-gray-50/50">
                        <button 
                          onClick={() => updateQuantity(item.id, item.cantidadSeleccionada - 1)}
                          className="px-2 py-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        </button>
                        <span className="px-2 py-1 text-[10px] font-black w-7 text-center text-gray-900">{item.cantidadSeleccionada}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.cantidadSeleccionada + 1)}
                          className="px-2 py-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        </button>
                      </div>
                      
                      <div className="flex flex-col items-end leading-none">
                        <span className="text-sm font-black text-gray-900 tracking-tight">${subtotalItem.toFixed(2)}</span>
                        <span className="text-[9px] font-bold text-[#3d4a3e] mt-1 italic opacity-80">Bs. {(subtotalItem * tasaDolar).toLocaleString('es-VE', { minimumFractionDigits: 1 })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-8 border-t border-gray-100 bg-white space-y-6 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
            <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-400 uppercase tracking-[0.2em] font-black">Subtotal ({cartCount} prod.)</span>
                  <span className="text-2xl font-black text-gray-900 italic tracking-tighter">${sanitizePrice(cartTotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-end">
                  <span className="text-sm font-black text-[#3d4a3e] tracking-tight">
                    Bs. {(sanitizePrice(cartTotal) * tasaDolar).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
            </div>
            
            <button 
              onClick={onCheckout}
              className="w-full bg-[#3d4a3e] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-[#2c362d] shadow-2xl shadow-[#3d4a3e]/20 transition-all active:scale-95 flex items-center justify-center gap-3 group"
            >
              Confirmar pedido
              <svg className="group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;