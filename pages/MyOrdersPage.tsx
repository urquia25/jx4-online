import React, { useState } from 'react';
import { Search, Package, Clock, CheckCircle2, ChevronRight, MapPin, AlertCircle, User } from 'lucide-react';
import { fetchOrdersFromSupabase } from '../services/supabase';
import { formatCurrency, formatBs } from '../utils/formatters';

const MyOrdersPage: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchOrdersFromSupabase(phone);
      setOrders(data || []);
      setSearched(true);
    } catch (error: any) {
      console.error('Search error:', error);
      setErrorMessage(error.message || 'Error al conectar con la base de datos');
    } finally {
      setLoading(false);
    }
  };

  // Función para extraer el nombre del cliente de diferentes posibles columnas
  const extractName = (order: any) => {
    return order.nombre_cliente || order.nombre || 'Cliente JX4';
  };

  // Función para obtener el estado del pedido
  const getStatus = (order: any) => {
    return order.estado || order.status || 'Pendiente';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-primary mb-4 tracking-tighter">Mis Pedidos</h2>
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Historial de compras en Paracotos</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto mb-16">
        <input 
          type="tel" 
          placeholder="Tu número (ej: 0424...)"
          required
          className="flex-1 px-8 py-5 rounded-full border-none shadow-2xl shadow-primary/5 focus:ring-2 focus:ring-primary/20 outline-none font-bold text-primary placeholder:text-gray-300"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-primary text-white px-10 py-5 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-[#2d3a2e] active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? '...' : 'Buscar'}
        </button>
      </form>

      {errorMessage && (
        <div className="mb-10 p-6 bg-red-50 rounded-3xl border border-red-100 flex items-center gap-4 text-error animate-in fade-in slide-in-from-bottom-2">
          <AlertCircle size={24} />
          <div className="text-[10px] font-black uppercase tracking-widest">
            Error de conexión: <span className="opacity-70">{errorMessage}</span>
          </div>
        </div>
      )}

      {searched && (
        <div className="space-y-8">
          {orders.length > 0 ? (
            orders.map(order => (
              <div key={order.id_pedido || order.id || Math.random()} className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-offwhite rounded-2xl flex items-center justify-center text-primary shadow-inner">
                      <User size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em] block mb-1">
                        Pedido #{String(order.id_pedido || order.id || 'N/A').slice(-6).toUpperCase()}
                      </span>
                      <h3 className="text-xl font-black text-primary">
                        {extractName(order)}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                         {order.fecha_pedido ? new Date(order.fecha_pedido).toLocaleDateString() : (order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Fecha Reciente')}
                      </p>
                    </div>
                  </div>
                  <div className="px-6 py-2.5 bg-green-50 text-success rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border border-green-100/50">
                    <CheckCircle2 size={16}/> {getStatus(order)}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-10">
                  <div className="p-6 bg-offwhite rounded-3xl border border-gray-50">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-3">Resumen Financiero</p>
                    <div className="space-y-1">
                      <p className="font-black text-primary text-2xl leading-none">{formatCurrency(order.total)}</p>
                      <p className="text-xs font-bold text-accent italic">Bs. {formatBs(order.total * 36.5)} (Ref)</p>
                    </div>
                  </div>
                  <div className="p-6 bg-offwhite rounded-3xl border border-gray-50">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-3">Información de Entrega</p>
                    <p className="font-bold text-primary text-xs leading-relaxed italic line-clamp-3">
                      {order.direccion_entrega || order.notas || 'Detalles guardados en administración'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between group cursor-pointer border-t border-gray-50 pt-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                      <Package size={18} />
                    </div>
                    <span className="font-black text-primary text-[10px] uppercase tracking-[0.2em]">Ver detalles del carrito</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-100">
              <Package size={64} className="mx-auto text-gray-100 mb-8" />
              <p className="text-gray-300 font-black uppercase text-[12px] tracking-[0.4em]">Sin historial de pedidos para {phone}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;