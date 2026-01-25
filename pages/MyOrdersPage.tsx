
import React, { useState } from 'react';
import { Search, Package, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { fetchOrdersFromSupabase } from '../services/supabase';
import { formatCurrency, formatBs } from '../utils/formatters';

const MyOrdersPage: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    try {
      const data = await fetchOrdersFromSupabase(phone);
      setOrders(data || []);
      setSearched(true);
    } catch (error) {
      alert('Error al buscar pedidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black text-primary mb-4">Mis Pedidos</h2>
        <p className="text-gray-500">Consulta el estado de tus compras con tu número de teléfono</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto mb-16">
        <input 
          type="tel" 
          placeholder="Tu número (ej: 0424...)"
          required
          className="flex-1 px-6 py-4 rounded-full border-none shadow-sm focus:ring-2 focus:ring-primary/20 outline-none"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-primary text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-[#2d3a2e] active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? '...' : 'Buscar'}
        </button>
      </form>

      {searched && (
        <div className="space-y-6">
          {orders.length > 0 ? (
            orders.map(order => (
              <div key={order.id} className="bg-white rounded-custom p-8 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs font-bold text-accent uppercase tracking-widest block mb-1">ID: {order.id.toString().slice(-6)}</span>
                    <h3 className="text-xl font-bold text-primary">{new Date(order.created_at).toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                  </div>
                  <div className="px-4 py-1.5 bg-green-50 text-success rounded-full text-xs font-black uppercase flex items-center gap-2">
                    <CheckCircle2 size={14}/> {order.status}
                  </div>
                </div>

                <div className="flex flex-wrap gap-8 mb-6 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1">Monto Total</p>
                    <p className="font-bold text-primary text-lg">{formatCurrency(order.total)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Método de Pago</p>
                    <p className="font-bold text-primary capitalize">{order.metodo_pago.replace('_', ' ')}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-400 mb-1">Dirección de Entrega</p>
                    <p className="font-medium text-primary line-clamp-1">{order.direccion}</p>
                  </div>
                </div>

                <div className="bg-offwhite rounded-2xl p-4 flex items-center justify-between group cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <Package className="text-primary" size={20} />
                    <span className="font-bold text-primary">Detalle de productos</span>
                  </div>
                  <ChevronRight className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-custom border border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">No encontramos pedidos asociados a este número.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
