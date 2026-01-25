
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  History, 
  ShieldAlert, 
  LogOut, 
  RefreshCw, 
  CheckCircle, 
  Database,
  DollarSign,
  Package,
  ArrowUpRight,
  Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAppContext } from '../contexts/AppContext';
import { updateExchangeRateInGAS } from '../services/api';
import { updateTasaSupabase, fetchOrdersFromSupabase } from '../services/supabase';
import { formatCurrency, formatBs } from '../utils/formatters';

const AdminPage: React.FC = () => {
  const { isAdmin, login, logout } = useAuth();
  const { config, products = [], refreshData, loading: appLoading } = useAppContext();
  
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [newTasa, setNewTasa] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0 });

  // Inicializar la tasa local cuando el config cargue
  useEffect(() => {
    if (isAdmin && config?.tasa_cambio) {
      setNewTasa(config.tasa_cambio.toString());
      loadStats();
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
      alert('Credenciales inválidas. Revisa el usuario y contraseña del archivo de configuración.');
    }
  };

  const handleUpdateTasa = async () => {
    const tasaValue = parseFloat(newTasa);
    if (isNaN(tasaValue) || tasaValue <= 0) {
      alert('Por favor ingresa una tasa válida.');
      return;
    }

    setUpdating(true);
    try {
      // 1. Actualizar GAS (Fuente principal)
      console.log('Actualizando GAS...');
      await updateExchangeRateInGAS(tasaValue);
      
      // 2. Actualizar Supabase (Respaldo) - Con catch propio para no detener el flujo principal
      try {
        console.log('Actualizando Supabase...');
        await updateTasaSupabase(tasaValue);
      } catch (sbError) {
        console.warn('Supabase no pudo actualizarse, pero GAS sí.', sbError);
      }
      
      // 3. Forzar refresco global de la App para que los precios cambien
      await refreshData();
      
      alert(`¡Éxito! Tasa actualizada correctamente a ${tasaValue} Bs.`);
    } catch (error) {
      console.error('Error updating rate:', error);
      alert('Error crítico al actualizar la tasa. Revisa la consola para más detalles.');
    } finally {
      setUpdating(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 px-4">
        <div className="bg-white rounded-custom p-10 shadow-2xl border border-gray-100">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mb-8 mx-auto">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-black text-center text-primary mb-8">Acceso de Administrador</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Usuario</label>
              <input 
                type="text" 
                placeholder="Ingresa tu usuario" 
                className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                value={user}
                onChange={e => setUser(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Contraseña</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                value={pass}
                onChange={e => setPass(e.target.value)}
              />
            </div>
            <button className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg hover:bg-[#2d3a2e] active:scale-95 transition-all flex items-center justify-center gap-2">
              Iniciar Sesión
            </button>
          </form>
          <p className="text-[10px] text-gray-400 mt-8 text-center uppercase font-bold">JX4 Paracotos Control Panel v10.0.3</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      {/* Header Admin */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <LayoutDashboard size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-primary">Tablero de Control</h2>
            <p className="text-gray-400 font-medium">Gestión total de JX4 Paracotos</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => refreshData()}
            className="p-3 bg-white text-primary rounded-full shadow-sm hover:bg-offwhite border border-gray-100 transition-all"
            title="Sincronizar Datos"
          >
            <RefreshCw size={20} className={appLoading ? 'animate-spin' : ''} />
          </button>
          <button onClick={logout} className="flex items-center gap-2 text-error font-bold bg-red-50 px-8 py-3 rounded-full hover:bg-red-100 transition-colors shadow-sm">
            <LogOut size={20} /> Salir
          </button>
        </div>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-custom border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 text-success rounded-lg"><DollarSign size={20}/></div>
            <span className="text-[10px] font-black text-gray-300 uppercase">Ventas Brutas</span>
          </div>
          <h3 className="text-2xl font-black text-primary">{formatCurrency(stats.totalRevenue)}</h3>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><ArrowUpRight size={12}/> Histórico Supabase</p>
        </div>

        <div className="bg-white p-6 rounded-custom border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Package size={20}/></div>
            <span className="text-[10px] font-black text-gray-300 uppercase">Pedidos</span>
          </div>
          <h3 className="text-2xl font-black text-primary">{stats.totalOrders}</h3>
          <p className="text-xs text-gray-400 mt-1">Órdenes procesadas</p>
        </div>

        <div className="bg-white p-6 rounded-custom border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 text-purple-500 rounded-lg"><Settings size={20}/></div>
            <span className="text-[10px] font-black text-gray-300 uppercase">Catálogo</span>
          </div>
          <h3 className="text-2xl font-black text-primary">{products.length}</h3>
          <p className="text-xs text-gray-400 mt-1">Productos activos</p>
        </div>

        <div className="bg-primary p-6 rounded-custom shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 text-white rounded-lg"><TrendingUp size={20}/></div>
            <span className="text-[10px] font-black text-white/40 uppercase">Tasa Actual</span>
          </div>
          <h3 className="text-2xl font-black text-white">{config.tasa_cambio} <span className="text-xs font-normal">Bs</span></h3>
          <p className="text-xs text-white/60 mt-1 flex items-center gap-1"><CheckCircle size={10} /> Conectado a GAS</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Editor de Tasa */}
        <div className="bg-white rounded-custom p-8 shadow-sm border border-gray-100 lg:col-span-1">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp size={24} className="text-accent" />
            <h3 className="text-xl font-bold text-primary">Actualizar Tasa</h3>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Valor USD a VES (Bs.)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold">Bs.</span>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-100 bg-offwhite text-2xl font-black text-primary outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                  value={newTasa}
                  onChange={e => setNewTasa(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            <button 
              onClick={handleUpdateTasa}
              disabled={updating || appLoading}
              className="w-full bg-accent text-white py-5 rounded-xl font-black uppercase tracking-widest text-sm shadow-lg hover:bg-[#c49564] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {updating ? <RefreshCw className="animate-spin" size={20} /> : 'Confirmar Tasa'}
            </button>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter leading-tight">
                Nota: La actualización enviará el comando a Google Sheets y Supabase simultáneamente.
              </p>
            </div>
          </div>
        </div>

        {/* Logs de Pedidos */}
        <div className="bg-white rounded-custom p-8 shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <History size={24} className="text-primary" />
              <h3 className="text-xl font-bold text-primary">Pedidos Recientes</h3>
            </div>
            <button onClick={loadStats} className="p-2 hover:bg-offwhite rounded-full transition-colors text-gray-400">
              <RefreshCw size={18} />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-gray-300 font-black uppercase tracking-widest border-b border-gray-50">
                  <th className="pb-4">Cliente</th>
                  <th className="pb-4">Monto</th>
                  <th className="pb-4">Pago</th>
                  <th className="pb-4">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.length > 0 ? logs.map(log => (
                  <tr key={log.id} className="text-sm hover:bg-offwhite transition-colors group">
                    <td className="py-4">
                      <div className="font-bold text-primary">{log.nombre}</div>
                      <div className="text-[10px] text-gray-400 font-medium">{log.telefono}</div>
                    </td>
                    <td className="py-4">
                      <div className="font-bold text-primary">{formatCurrency(log.total)}</div>
                      <div className="text-[10px] text-accent font-bold">{formatBs((Number(log.total) || 0) * config.tasa_cambio)}</div>
                    </td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-gray-50 text-gray-500 text-[10px] font-black rounded-lg uppercase">
                        {String(log.metodo_pago || '').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 text-xs text-gray-400 font-medium">
                      {log.created_at ? new Date(log.created_at).toLocaleDateString() : '---'}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-gray-300 font-bold italic">
                      No hay datos disponibles en Supabase actualmente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Estado de Conexión */}
      <div className="bg-white rounded-custom p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <Database size={24} className="text-primary" />
          <h3 className="text-xl font-bold text-primary">Sistemas de Backend</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-success rounded-full shadow-[0_0_10px_rgba(72,187,120,0.5)]"></div>
              <span className="text-sm font-black text-green-800 uppercase tracking-widest">JX4 Cloud (GAS)</span>
            </div>
            <span className="text-[10px] font-black text-success uppercase">Operativo v10.0.3</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
              <span className="text-sm font-black text-blue-800 uppercase tracking-widest">Supabase (Relacional)</span>
            </div>
            <span className="text-[10px] font-black text-blue-500 uppercase">Conexión Estable</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
