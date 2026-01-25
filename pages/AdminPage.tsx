
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, TrendingUp, History, ShieldAlert, LogOut, RefreshCw, CheckCircle, Database } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAppContext } from '../contexts/AppContext';
import { updateExchangeRateInGAS } from '../services/api';
import { updateTasaSupabase, fetchOrdersFromSupabase } from '../services/supabase';
import { ADMIN_USER, ADMIN_PASS } from '../constants';

const AdminPage: React.FC = () => {
  const { isAdmin, login, logout } = useAuth();
  const { config, products = [], refreshData } = useAppContext();
  
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [newTasa, setNewTasa] = useState(config?.tasa_cambio || 0);
  const [updating, setUpdating] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0 });

  useEffect(() => {
    if (isAdmin) {
      loadStats();
      if (config?.tasa_cambio) setNewTasa(config.tasa_cambio);
    }
  }, [isAdmin, config?.tasa_cambio]);

  const loadStats = async () => {
    try {
      const data = await fetchOrdersFromSupabase();
      const safeData = Array.isArray(data) ? data : [];
      setLogs(safeData.slice(0, 10));
      const total = safeData.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
      setStats({ totalOrders: safeData.length, totalRevenue: total });
    } catch (err) {
      console.error('Error loading admin stats:', err);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(user, pass)) {
      alert('Credenciales inválidas');
    }
  };

  const handleUpdateTasa = async () => {
    if (isNaN(newTasa) || newTasa <= 0) {
      alert('Por favor ingresa una tasa válida.');
      return;
    }

    setUpdating(true);
    try {
      // 1. Intentar actualizar GAS (Hoja de Cálculo)
      const gasResult = await updateExchangeRateInGAS(newTasa, ADMIN_USER, ADMIN_PASS);
      
      // 2. Actualizar Supabase (Nuestra fuente de verdad secundaria confiable)
      await updateTasaSupabase(newTasa);
      
      // 3. Refrescar datos globales
      await refreshData();
      
      alert('Tasa actualizada exitosamente en todos los sistemas.');
    } catch (error) {
      console.error('Error updating rate:', error);
      alert('Error al actualizar tasa. Verifique su conexión.');
    } finally {
      setUpdating(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 px-4">
        <div className="bg-white rounded-custom p-10 shadow-xl border border-gray-100">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mb-8 mx-auto">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-black text-center text-primary mb-8">Admin Access</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="text" 
              placeholder="Username" 
              className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={user}
              onChange={e => setUser(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={pass}
              onChange={e => setPass(e.target.value)}
            />
            <button className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg hover:bg-[#2d3a2e] transition-all">
              Ingresar al Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <h2 className="text-3xl font-black text-primary flex items-center gap-3">
          <LayoutDashboard size={32} /> Panel de Control
        </h2>
        <button onClick={logout} className="flex items-center gap-2 text-error font-bold bg-red-50 px-6 py-3 rounded-full hover:bg-red-100 transition-colors">
          <LogOut size={20} /> Cerrar Sesión
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="bg-primary text-white rounded-custom p-8 shadow-xl flex flex-col justify-between">
          <div>
            <p className="text-primary-foreground/60 font-bold uppercase tracking-widest text-xs mb-4">Ventas Totales</p>
            <h3 className="text-4xl font-black mb-2">${stats.totalRevenue.toFixed(2)}</h3>
            <p className="text-sm opacity-80">{stats.totalOrders} pedidos registrados</p>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center">
            <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full">{products.length} productos</span>
            <CheckCircle className="text-accent" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-custom p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp size={24} className="text-accent" />
            <h3 className="text-xl font-bold text-primary">Tasa de Cambio</h3>
          </div>
          <div className="flex flex-col gap-4">
            <div className="text-sm text-gray-400 font-bold uppercase tracking-wider">Valor Actual: {config?.tasa_cambio || 0} VES</div>
            <input 
              type="number" 
              step="0.01"
              className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-offwhite text-xl font-bold outline-none focus:ring-2 focus:ring-accent/20"
              value={newTasa}
              onChange={e => setNewTasa(parseFloat(e.target.value))}
            />
            <button 
              onClick={handleUpdateTasa}
              disabled={updating}
              className="w-full bg-accent text-white py-4 rounded-xl font-bold shadow-lg hover:bg-[#c49564] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {updating ? <RefreshCw className="animate-spin" size={20} /> : 'Actualizar Tasa'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-custom p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Database size={24} className="text-primary" />
            <h3 className="text-xl font-bold text-primary">Estado del Sistema</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <span className="text-sm font-bold text-green-800">Supabase DB</span>
              <span className="w-3 h-3 bg-success rounded-full animate-pulse"></span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <span className="text-sm font-bold text-green-800">GAS Backend</span>
              <span className="w-3 h-3 bg-success rounded-full animate-pulse"></span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-custom p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-8">
          <History size={24} className="text-primary" />
          <h3 className="text-xl font-bold text-primary">Logs de Pedidos Recientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-400 font-black uppercase tracking-widest border-b border-gray-50 pb-4">
                <th className="pb-4">Cliente</th>
                <th className="pb-4">Total</th>
                <th className="pb-4">Pago</th>
                <th className="pb-4">Estado</th>
                <th className="pb-4">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map(log => (
                <tr key={log.id} className="text-sm hover:bg-offwhite transition-colors">
                  <td className="py-4">
                    <div className="font-bold text-primary">{log.nombre}</div>
                    <div className="text-xs text-gray-400">{log.telefono}</div>
                  </td>
                  <td className="py-4 font-bold text-primary">${(Number(log.total) || 0).toFixed(2)}</td>
                  <td className="py-4 capitalize text-gray-500">{String(log.metodo_pago || '').replace('_', ' ')}</td>
                  <td className="py-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-[10px] font-black rounded-full uppercase">
                      {log.status || 'Pendiente'}
                    </span>
                  </td>
                  <td className="py-4 text-gray-400">
                    {log.created_at ? new Date(log.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
