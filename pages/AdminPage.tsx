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
  Settings,
  Megaphone,
  Bell,
  Save
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAppContext } from '../contexts/AppContext';
import { updateExchangeRateInGAS, updateCintilloInGAS } from '../services/api';
import { updateTasaSupabase, fetchOrdersFromSupabase } from '../services/supabase';
import { formatCurrency, formatBs } from '../utils/formatters';

const AdminPage: React.FC = () => {
  const { isAdmin, login, logout } = useAuth();
  const { config, products = [], refreshData, loading: appLoading, cintillo } = useAppContext();
  
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [newTasa, setNewTasa] = useState<string>('');
  const [newCintillo, setNewCintillo] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [updatingCintillo, setUpdatingCintillo] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0 });

  useEffect(() => {
    if (isAdmin) {
      if (config?.tasa_cambio) setNewTasa(config.tasa_cambio.toString());
      if (cintillo) setNewCintillo(cintillo);
      loadStats();
    }
  }, [isAdmin, config?.tasa_cambio, cintillo]);

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
      alert('Credenciales inválidas.');
    }
  };

  const handleUpdateTasa = async () => {
    const tasaValue = parseFloat(newTasa);
    if (isNaN(tasaValue) || tasaValue <= 0) {
      alert('Ingresa una tasa válida.');
      return;
    }
    setUpdating(true);
    try {
      await updateExchangeRateInGAS(tasaValue);
      try { await updateTasaSupabase(tasaValue); } catch (e) {}
      await refreshData();
      alert('Tasa actualizada.');
    } catch (error) {
      alert('Error al actualizar tasa.');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateCintillo = async () => {
    if (!newCintillo.trim()) {
      alert('El cintillo no puede estar vacío.');
      return;
    }
    setUpdatingCintillo(true);
    try {
      await updateCintilloInGAS(newCintillo);
      await refreshData();
      alert('¡Cintillo actualizado con éxito!');
    } catch (error) {
      alert('Error al actualizar el cintillo.');
    } finally {
      setUpdatingCintillo(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 px-4">
        <div className="bg-white rounded-custom p-10 shadow-2xl border border-gray-100">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mb-8 mx-auto">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-black text-center text-primary mb-8">Administración JX4</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="text" placeholder="Usuario" 
              className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none font-medium"
              value={user} onChange={e => setUser(e.target.value)}
            />
            <input 
              type="password" placeholder="Contraseña" 
              className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none font-medium"
              value={pass} onChange={e => setPass(e.target.value)}
            />
            <button className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20 pt-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary"><LayoutDashboard size={32} /></div>
          <div>
            <h2 className="text-3xl font-black text-primary">Tablero JX4</h2>
            <p className="text-gray-400 font-medium italic">Edición de anuncio y tasa del día</p>
          </div>
        </div>
        <button onClick={logout} className="text-error font-bold bg-red-50 px-8 py-3 rounded-full hover:bg-red-100 transition-colors">
          Cerrar Sesión
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Editor de Tasa */}
        <div className="bg-white rounded-custom p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp size={24} className="text-accent" />
            <h3 className="text-xl font-bold text-primary">Tasa de Cambio</h3>
          </div>
          <div className="space-y-6">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold">Bs.</span>
              <input 
                type="number" step="0.01"
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-100 bg-offwhite text-2xl font-black text-primary outline-none"
                value={newTasa} onChange={e => setNewTasa(e.target.value)}
              />
            </div>
            <button 
              onClick={handleUpdateTasa}
              disabled={updating}
              className="w-full bg-accent text-white py-5 rounded-xl font-black uppercase tracking-widest text-sm shadow-lg flex items-center justify-center gap-3"
            >
              {updating ? <RefreshCw className="animate-spin" /> : <Save size={18} />} Actualizar Tasa
            </button>
          </div>
        </div>

        {/* Editor de Cintillo */}
        <div className="bg-white rounded-custom p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <Megaphone size={24} className="text-primary" />
            <h3 className="text-xl font-bold text-primary">Anuncio Superior (Cintillo)</h3>
          </div>
          <div className="space-y-6">
            <textarea 
              rows={2}
              className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-offwhite text-sm font-bold text-primary outline-none resize-none"
              value={newCintillo}
              onChange={e => setNewCintillo(e.target.value)}
              placeholder="Escribe el anuncio aquí..."
            />
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <Bell size={14} className="text-accent" />
                <span className="text-[10px] font-black uppercase text-gray-400">Vista Previa</span>
              </div>
              <p className="text-xs font-bold text-primary italic">"{newCintillo || 'No hay texto definido'}"</p>
            </div>
            <button 
              onClick={handleUpdateCintillo}
              disabled={updatingCintillo}
              className="w-full bg-primary text-white py-5 rounded-xl font-black uppercase tracking-widest text-sm shadow-lg flex items-center justify-center gap-3"
            >
              {updatingCintillo ? <RefreshCw className="animate-spin" /> : <Megaphone size={18} />} Publicar Anuncio
            </button>
          </div>
        </div>
      </div>

      {/* Stats e Historial Simple */}
      <div className="bg-white rounded-custom p-8 shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-primary mb-8 flex items-center gap-3"><History size={24}/> Últimos Pedidos</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] text-gray-300 font-black uppercase tracking-widest border-b">
                <th className="text-left pb-4">Cliente</th>
                <th className="text-left pb-4">Monto</th>
                <th className="text-left pb-4">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b last:border-0 border-gray-50 hover:bg-offwhite transition-colors">
                  <td className="py-4">
                    <div className="font-bold text-primary text-sm">{log.nombre}</div>
                    <div className="text-[10px] text-gray-400">{log.telefono}</div>
                  </td>
                  <td className="py-4 font-black text-primary text-sm">{formatCurrency(log.total)}</td>
                  <td className="py-4 text-xs text-gray-400">{new Date(log.created_at).toLocaleDateString()}</td>
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