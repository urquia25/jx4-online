
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutDashboard, TrendingUp, History, ShieldAlert, LogOut, 
  RefreshCw, Save, Megaphone, Plus, Trash2, Edit3, Upload, FileText, CheckCircle, Package, Search, X, PieChart, ShoppingBag, Activity, Server
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAppContext } from '../contexts/AppContext';
import { upsertProduct, deleteProduct, uploadProductImage, fetchOrdersFromSupabase, checkSystemHealth } from '../services/supabase';
import { updateExchangeRateInGAS, updateCintilloInGAS } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import * as XLSX from 'xlsx';

const AdminPage: React.FC = () => {
  const { isAdmin, login, logout } = useAuth();
  const { config, products: initialProducts, refreshData, loading: appLoading, cintillo } = useAppContext();
  
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [newTasa, setNewTasa] = useState('');
  const [newCintillo, setNewCintillo] = useState('');
  const [activeTab, setActiveTab] = useState<'config' | 'products' | 'metrics' | 'health'>('config');
  const [searchTerm, setSearchTerm] = useState('');
  const [ordersHistory, setOrdersHistory] = useState<any[]>([]);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>({
    nombre: '', precio: 0, categoria: '', departamento: '', descripcion: '', imagenurl: '', disponible: true, unidad: 'und'
  });
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdmin) {
      if (config?.tasa_cambio) setNewTasa(config.tasa_cambio.toString());
      if (cintillo) setNewCintillo(cintillo);
      fetchOrdersFromSupabase().then(setOrdersHistory);
      handleCheckHealth();
    }
  }, [isAdmin, config?.tasa_cambio, cintillo]);

  const handleCheckHealth = async () => {
    setCheckingHealth(true);
    const health = await checkSystemHealth();
    setHealthStatus(health);
    setCheckingHealth(false);
  };

  const metrics = useMemo(() => {
    const today = new Date().toLocaleDateString();
    const todayOrders = ordersHistory.filter(o => new Date(o.fecha_pedido).toLocaleDateString() === today);
    const totalSales = ordersHistory.reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0);
    const todaySales = todayOrders.reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0);
    
    return {
      todayCount: todayOrders.length,
      todaySales,
      totalSales,
      activeProducts: initialProducts.filter(p => p.disponible).length
    };
  }, [ordersHistory, initialProducts]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(user, pass)) alert('Credenciales inválidas.');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await upsertProduct(currentProduct);
      alert('Producto guardado exitosamente');
      setIsEditing(false);
      refreshData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const url = await uploadProductImage(file);
      setCurrentProduct({ ...currentProduct, imagenurl: url });
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setUploadingImg(false);
    }
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);
      if (confirm(`Importar ${data.length} productos?`)) {
        for (const row of data as any[]) {
          try {
            await upsertProduct({
              nombre: row.Nombre || row.nombre,
              precio: parseFloat(row.Precio || row.precio) || 0,
              categoria: row.Categoria || row.categoria || 'General',
              departamento: row.Departamento || row.departamento || 'General',
              unidad: row.Unidad || row.unidad || 'und',
              disponible: true,
              descripcion: row.Descripcion || row.descripcion || '',
              imagenurl: row.Imagen || row.imagenurl || row.imagen_url || ''
            });
          } catch (err) {}
        }
        refreshData();
      }
    };
    reader.readAsBinaryString(file);
  };

  const filteredProducts = initialProducts.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-32 px-4">
        <div className="bg-white rounded-[2.5rem] p-12 shadow-2xl border border-gray-100">
          <ShieldAlert size={48} className="text-primary mb-10 mx-auto" />
          <h2 className="text-3xl font-black text-center text-primary mb-10 tracking-tighter">Admin Access</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="text" placeholder="Usuario" className="w-full px-8 py-5 rounded-2xl bg-offwhite border-none outline-none font-bold" value={user} onChange={e => setUser(e.target.value)} />
            <input type="password" placeholder="Pass" className="w-full px-8 py-5 rounded-2xl bg-offwhite border-none outline-none font-bold" value={pass} onChange={e => setPass(e.target.value)} />
            <button className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20 pt-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-primary rounded-[2rem] text-white shadow-2xl">
            <LayoutDashboard size={40} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-primary tracking-tighter">Panel Maestro</h2>
            <p className="text-gray-400 font-black uppercase text-[10px] tracking-[0.4em]">Supabase Native v11.0</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => refreshData()} className="p-5 bg-white text-primary rounded-full shadow-sm hover:rotate-180 transition-all duration-700">
            <RefreshCw size={28} className={appLoading ? 'animate-spin' : ''}/>
          </button>
          <button onClick={logout} className="text-red-500 font-black bg-red-50 px-10 py-5 rounded-full uppercase text-[11px] tracking-widest border border-red-100 flex items-center gap-3">
            <LogOut size={20}/> Salir
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-10 overflow-x-auto no-scrollbar py-2">
        {[
          { id: 'config', label: 'Config', icon: <Save size={16}/> },
          { id: 'products', label: 'Inventario', icon: <Package size={16}/> },
          { id: 'metrics', label: 'Métricas', icon: <PieChart size={16}/> },
          { id: 'health', label: 'Salud Sistema', icon: <Activity size={16}/> }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)} 
            className={`px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all flex items-center gap-4 whitespace-nowrap ${
              activeTab === tab.id ? 'bg-primary text-white shadow-xl' : 'bg-white text-gray-400 border border-gray-100'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white rounded-custom p-12 shadow-sm border border-gray-100">
            <h3 className="text-2xl font-black text-primary mb-10 flex items-center gap-4"><TrendingUp className="text-accent" /> Tasa de Cambio</h3>
            <input type="number" step="0.01" className="w-full px-8 py-8 rounded-[2rem] bg-offwhite text-4xl font-black text-primary outline-none mb-10" value={newTasa} onChange={e => setNewTasa(e.target.value)} />
            <button onClick={() => updateExchangeRateInGAS(parseFloat(newTasa))} className="w-full bg-accent text-white py-8 rounded-[2rem] font-black uppercase text-[12px] tracking-[0.3em]">Guardar Tasa</button>
          </div>
          <div className="bg-white rounded-custom p-12 shadow-sm border border-gray-100">
            <h3 className="text-2xl font-black text-primary mb-10 flex items-center gap-4"><Megaphone /> Comunicado</h3>
            <textarea rows={4} className="w-full px-8 py-8 rounded-[2rem] bg-offwhite font-bold outline-none mb-10" value={newCintillo} onChange={e => setNewCintillo(e.target.value)} />
            <button onClick={() => updateCintilloInGAS(newCintillo)} className="w-full bg-primary text-white py-8 rounded-[2rem] font-black uppercase text-[12px] tracking-[0.3em]">Actualizar Cintillo</button>
          </div>
        </div>
      )}

      {activeTab === 'health' && (
        <div className="bg-white rounded-custom p-12 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black text-primary flex items-center gap-4"><Server className="text-accent" /> Diagnóstico de Supabase</h3>
            <button onClick={handleCheckHealth} disabled={checkingHealth} className="p-4 bg-offwhite rounded-full hover:bg-gray-100 transition-all">
              <RefreshCw className={checkingHealth ? 'animate-spin' : ''} />
            </button>
          </div>
          
          {healthStatus ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-8 bg-offwhite rounded-3xl border border-gray-50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Estado DB</p>
                <p className={`text-xl font-black ${healthStatus.ok ? 'text-green-600' : 'text-red-600'}`}>{healthStatus.ok ? 'OPERATIVO' : 'ERROR'}</p>
              </div>
              <div className="p-8 bg-offwhite rounded-3xl border border-gray-50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Productos en Supabase</p>
                <p className="text-xl font-black text-primary">{healthStatus.counts?.productos || 0}</p>
              </div>
              <div className="p-8 bg-offwhite rounded-3xl border border-gray-50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pedidos Registrados</p>
                <p className="text-xl font-black text-primary">{healthStatus.counts?.pedidos || 0}</p>
              </div>
              <div className="p-8 bg-offwhite rounded-3xl border border-gray-50 lg:col-span-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Estructura de Tabla 'productos'</p>
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${healthStatus.imagen_url_column_exists ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="font-bold text-primary">Columna 'imagen_url' {healthStatus.imagen_url_column_exists ? 'detectada' : 'NO DETECTADA'}</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 font-medium italic">Nota: Si la columna no existe, el guardado de imágenes fallará.</p>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center">
              <Server size={48} className="mx-auto text-gray-200 mb-6 animate-pulse" />
              <p className="font-black text-gray-300 uppercase text-[10px] tracking-widest">Ejecutando pruebas de latencia...</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-10">
          <div className="flex flex-col lg:flex-row gap-8 justify-between items-center bg-white p-8 rounded-custom border border-gray-50 shadow-sm">
             <div className="flex gap-4 w-full lg:w-auto">
               <button onClick={() => { setIsEditing(true); setCurrentProduct({ nombre: '', precio: 0, categoria: '', departamento: '', descripcion: '', imagenurl: '', disponible: true, unidad: 'und' }); }} className="flex-1 lg:flex-none bg-primary text-white px-10 py-6 rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center gap-4 shadow-xl">
                 <Plus size={22}/> Nuevo Producto
               </button>
               <label className="cursor-pointer bg-offwhite border border-gray-100 text-gray-500 px-10 py-6 rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center gap-4">
                 <FileText size={22}/> Excel
                 <input type="file" className="hidden" accept=".xlsx" onChange={handleImportExcel} />
               </label>
             </div>
             <div className="relative w-full lg:w-[450px]">
                <Search size={24} className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300" />
                <input type="text" placeholder="Buscar..." className="w-full pl-20 pr-8 py-6 rounded-2xl bg-offwhite border-none font-bold outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
             </div>
          </div>
          
          <div className="bg-white rounded-custom shadow-2xl overflow-hidden border border-gray-50">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-offwhite/50 border-b border-gray-50">
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">
                    <th className="px-10 py-8 text-left">Producto</th>
                    <th className="px-10 py-8 text-left">Precio</th>
                    <th className="px-10 py-8 text-left">Departamento</th>
                    <th className="px-10 py-8 text-center">Estado</th>
                    <th className="px-10 py-8 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-offwhite/30 transition-all group">
                      <td className="px-10 py-6 font-black text-primary">{p.nombre}</td>
                      <td className="px-10 py-6 font-black text-primary">{formatCurrency(p.precio)}</td>
                      <td className="px-10 py-6">
                        <span className="px-4 py-2 bg-primary/5 text-primary text-[10px] font-black uppercase rounded-xl border border-primary/10">{p.departamento}</span>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${p.disponible ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {p.disponible ? 'Activo' : 'Agotado'}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => { setCurrentProduct({...p}); setIsEditing(true); }} className="p-4 text-primary bg-offwhite rounded-2xl hover:bg-primary hover:text-white transition-all"><Edit3 size={20}/></button>
                          <button onClick={() => { if(confirm('¿Borrar?')) deleteProduct(p.id!).then(refreshData); }} className="p-4 text-red-500 bg-red-50 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={20}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-primary/40 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-2xl border border-white/20">
            <div className="flex items-center justify-between p-10 border-b border-gray-50">
              <h3 className="text-3xl font-black text-primary flex items-center gap-5 tracking-tighter">
                <Package className="text-accent" /> {currentProduct.id ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button onClick={() => setIsEditing(false)} className="p-4 bg-offwhite text-gray-400 rounded-full">
                <X size={28}/>
              </button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-12 overflow-y-auto max-h-[75vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <input type="text" required placeholder="Nombre" className="w-full px-8 py-6 rounded-2xl bg-offwhite font-bold outline-none" value={currentProduct.nombre} onChange={e => setCurrentProduct({...currentProduct, nombre: e.target.value})} />
                  <input type="number" step="0.01" required placeholder="Precio USD" className="w-full px-8 py-6 rounded-2xl bg-offwhite font-black outline-none" value={currentProduct.precio} onChange={e => setCurrentProduct({...currentProduct, precio: parseFloat(e.target.value)})} />
                  <div className="grid grid-cols-2 gap-6">
                    <input type="text" required placeholder="Depto" className="w-full px-8 py-6 rounded-2xl bg-offwhite font-bold outline-none" value={currentProduct.departamento} onChange={e => setCurrentProduct({...currentProduct, departamento: e.target.value})} />
                    <input type="text" required placeholder="Categoría" className="w-full px-8 py-6 rounded-2xl bg-offwhite font-bold outline-none" value={currentProduct.categoria} onChange={e => setCurrentProduct({...currentProduct, categoria: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="relative h-72 bg-offwhite border-4 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center overflow-hidden group">
                    {currentProduct.imagenurl ? (
                      <img src={currentProduct.imagenurl} className="w-full h-full object-contain p-6" />
                    ) : (
                      <Upload size={64} className="text-gray-200" />
                    )}
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white font-black text-[12px] uppercase">
                      Cambiar Imagen
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    {uploadingImg && <div className="absolute inset-0 bg-white/95 flex items-center justify-center animate-pulse"><RefreshCw className="animate-spin text-accent" /></div>}
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-primary text-white py-8 rounded-[2.5rem] font-black uppercase text-base tracking-[0.4em] mt-12 shadow-2xl flex items-center justify-center gap-6">
                <CheckCircle size={32}/> Guardar en Supabase
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
