
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutDashboard, TrendingUp, History, ShieldAlert, LogOut, 
  RefreshCw, Save, Megaphone, Plus, Trash2, Edit3, Upload, FileText, CheckCircle, Package, Search, X, PieChart, ShoppingBag
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAppContext } from '../contexts/AppContext';
import { upsertProduct, deleteProduct, uploadProductImage, fetchOrdersFromSupabase } from '../services/supabase';
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
  const [activeTab, setActiveTab] = useState<'config' | 'products' | 'metrics'>('config');
  const [searchTerm, setSearchTerm] = useState('');
  const [ordersHistory, setOrdersHistory] = useState<any[]>([]);
  
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
    }
  }, [isAdmin, config?.tasa_cambio, cintillo]);

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
      alert('Producto guardado exitosamente en Supabase');
      setIsEditing(false);
      refreshData();
    } catch (err: any) {
      console.error('Save error:', err);
      alert('Error al guardar: ' + (err.message || 'Verifica que la columna imagenurl exista en tu tabla de Supabase'));
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
      alert('Error al subir imagen: ' + err.message);
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
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      if (confirm(`Se han encontrado ${data.length} productos. ¿Deseas importarlos a Supabase?`)) {
        let count = 0;
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
            count++;
          } catch (err) { console.error('Error importando fila', err); }
        }
        alert(`Importación completada: ${count} productos guardados.`);
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
        <div className="bg-white rounded-[2.5rem] p-12 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center text-primary mb-10 mx-auto border border-primary/10">
            <ShieldAlert size={48} />
          </div>
          <h2 className="text-3xl font-black text-center text-primary mb-2 tracking-tighter">Acceso Admin</h2>
          <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-10">JX4 Native v11.0</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="text" placeholder="Usuario" className="w-full px-8 py-5 rounded-2xl border border-gray-100 bg-offwhite outline-none font-bold text-primary focus:ring-4 focus:ring-primary/5 transition-all" value={user} onChange={e => setUser(e.target.value)} />
            <input type="password" placeholder="Contraseña" className="w-full px-8 py-5 rounded-2xl border border-gray-100 bg-offwhite outline-none font-bold text-primary focus:ring-4 focus:ring-primary/5 transition-all" value={pass} onChange={e => setPass(e.target.value)} />
            <button className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">Ingresar al Sistema</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20 pt-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-primary rounded-[2rem] text-white shadow-2xl shadow-primary/20">
            <LayoutDashboard size={40} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-primary tracking-tighter">Panel de Control</h2>
            <p className="text-gray-400 font-black uppercase text-[10px] tracking-[0.4em]">Gestión Supabase v11.0</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => refreshData()} className="p-5 bg-white text-primary rounded-full shadow-sm hover:rotate-180 transition-all duration-700 border border-gray-100">
            <RefreshCw size={28} className={appLoading ? 'animate-spin' : ''}/>
          </button>
          <button onClick={logout} className="text-red-500 font-black bg-red-50 px-10 py-5 rounded-full hover:bg-red-100 transition-all uppercase text-[11px] tracking-widest border border-red-100 flex items-center gap-3">
            <LogOut size={20}/> Salir del Sistema
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm flex items-center gap-6">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl"><TrendingUp size={24}/></div>
          <div>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Ventas Hoy</p>
            <p className="text-2xl font-black text-primary">{formatCurrency(metrics.todaySales)}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm flex items-center gap-6">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><ShoppingBag size={24}/></div>
          <div>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Pedidos Hoy</p>
            <p className="text-2xl font-black text-primary">{metrics.todayCount}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm flex items-center gap-6">
          <div className="p-4 bg-green-50 text-green-600 rounded-2xl"><Package size={24}/></div>
          <div>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Productos</p>
            <p className="text-2xl font-black text-primary">{metrics.activeProducts}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm flex items-center gap-6">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl"><PieChart size={24}/></div>
          <div>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Ventas Totales</p>
            <p className="text-2xl font-black text-primary">{formatCurrency(metrics.totalSales)}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-10 overflow-x-auto no-scrollbar py-2">
        {[
          { id: 'config', label: 'Configuración', icon: <Save size={16}/> },
          { id: 'products', label: 'Inventario', icon: <Package size={16}/> },
          { id: 'metrics', label: 'Historial', icon: <History size={16}/> }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)} 
            className={`px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all flex items-center gap-4 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-primary text-white shadow-2xl shadow-primary/20 -translate-y-1' 
                : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50 hover:text-primary'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in duration-500">
          <div className="bg-white rounded-custom p-12 shadow-sm border border-gray-100">
            <h3 className="text-2xl font-black text-primary mb-10 flex items-center gap-4">
              <TrendingUp className="text-accent" size={28}/> Tasa de Cambio Global
            </h3>
            <div className="relative mb-10 group">
              <span className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 font-black text-2xl group-focus-within:text-accent transition-colors">Bs.</span>
              <input 
                type="number" step="0.01" 
                className="w-full pl-20 pr-8 py-8 rounded-[2rem] border border-gray-50 bg-offwhite text-4xl font-black text-primary outline-none focus:ring-8 focus:ring-accent/5 transition-all" 
                value={newTasa} 
                onChange={e => setNewTasa(e.target.value)} 
              />
            </div>
            <button 
              onClick={() => updateExchangeRateInGAS(parseFloat(newTasa))} 
              className="w-full bg-accent text-white py-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[12px] shadow-2xl shadow-accent/20 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Save size={24}/> Sincronizar Tasa en Supabase
            </button>
          </div>

          <div className="bg-white rounded-custom p-12 shadow-sm border border-gray-100">
            <h3 className="text-2xl font-black text-primary mb-10 flex items-center gap-4">
              <Megaphone className="text-primary" size={28}/> Comunicado Marquee
            </h3>
            <textarea 
              rows={4} 
              className="w-full px-8 py-8 rounded-[2rem] border border-gray-50 bg-offwhite text-base font-bold text-primary outline-none resize-none mb-10 focus:ring-8 focus:ring-primary/5 transition-all" 
              placeholder="Ej: ✨ ¡Promoción activa en Carnicería! ✨"
              value={newCintillo} 
              onChange={e => setNewCintillo(e.target.value)} 
            />
            <button 
              onClick={() => updateCintilloInGAS(newCintillo)} 
              className="w-full bg-primary text-white py-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[12px] shadow-2xl shadow-primary/20 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Megaphone size={24}/> Actualizar Cintillo
            </button>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-10 animate-in fade-in duration-700">
          <div className="flex flex-col lg:flex-row gap-8 justify-between items-center bg-white p-8 rounded-custom border border-gray-50 shadow-sm">
             <div className="flex gap-4 w-full lg:w-auto">
               <button 
                onClick={() => { setIsEditing(true); setCurrentProduct({ nombre: '', precio: 0, categoria: '', departamento: '', descripcion: '', imagenurl: '', disponible: true, unidad: 'und' }); }} 
                className="flex-1 lg:flex-none bg-primary text-white px-10 py-6 rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-4 shadow-xl hover:scale-105 transition-all"
               >
                 <Plus size={22}/> Nuevo Producto
               </button>
               <label className="cursor-pointer bg-offwhite border border-gray-100 text-gray-500 px-10 py-6 rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-4 hover:bg-white transition-all shadow-inner">
                 <FileText size={22}/> Importar Excel
                 <input type="file" className="hidden" accept=".xlsx, .csv" onChange={handleImportExcel} />
               </label>
             </div>

             <div className="relative w-full lg:w-[450px] group">
                <Search size={24} className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre o categoría..."
                  className="w-full pl-20 pr-8 py-6 rounded-2xl bg-offwhite border border-gray-50 font-bold text-base outline-none focus:ring-8 focus:ring-primary/5 transition-all"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
             </div>
          </div>

          <div className="bg-white rounded-custom shadow-2xl shadow-primary/5 border border-gray-50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-offwhite/50 border-b border-gray-50">
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">
                    <th className="px-10 py-8 text-left">Detalle Producto</th>
                    <th className="px-10 py-8 text-left">Precio Ref.</th>
                    <th className="px-10 py-8 text-left">Departamento</th>
                    <th className="px-10 py-8 text-center">Estado</th>
                    <th className="px-10 py-8 text-right">Gestión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-offwhite/30 transition-all group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-[1.2rem] bg-offwhite border border-gray-100 flex items-center justify-center overflow-hidden p-2 group-hover:scale-110 transition-transform">
                            <img 
                              src={p.imagenurl || 'https://ui-avatars.com/api/?name=JX&background=3d4a3e&color=fff'} 
                              className="w-full h-full object-contain mix-blend-multiply" 
                              onError={e => e.currentTarget.src = 'https://ui-avatars.com/api/?name=JX&background=3d4a3e&color=fff'}
                            />
                          </div>
                          <div>
                            <p className="font-black text-primary text-lg leading-tight">{p.nombre}</p>
                            <p className="text-[10px] text-accent font-black uppercase tracking-widest mt-1">{p.unidad}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className="font-black text-primary text-xl tracking-tighter">{formatCurrency(p.precio)}</span>
                      </td>
                      <td className="px-10 py-6">
                        <span className="px-4 py-2 bg-primary/5 text-primary text-[10px] font-black uppercase rounded-xl border border-primary/10 tracking-widest">
                          {p.departamento || p.categoria}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${p.disponible ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          <div className={`w-2 h-2 rounded-full ${p.disponible ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                          {p.disponible ? 'Activo' : 'Agotado'}
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <button 
                            onClick={() => { setCurrentProduct({...p}); setIsEditing(true); }} 
                            className="p-4 text-primary bg-offwhite rounded-2xl hover:bg-primary hover:text-white transition-all shadow-inner"
                          >
                            <Edit3 size={20}/>
                          </button>
                          <button 
                            onClick={() => { if(confirm('¿Seguro?')) deleteProduct(p.id!).then(refreshData); }} 
                            className="p-4 text-red-500 bg-red-50 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-inner"
                          >
                            <Trash2 size={20}/>
                          </button>
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

      {/* Product Modal Refined */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-primary/40 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 border border-white/20">
            <div className="flex items-center justify-between p-10 border-b border-gray-50">
              <h3 className="text-3xl font-black text-primary flex items-center gap-5 tracking-tighter">
                <Package className="text-accent" size={32}/> {currentProduct.id ? 'Edición de Producto' : 'Nuevo Producto en Supabase'}
              </h3>
              <button onClick={() => setIsEditing(false)} className="p-4 bg-offwhite text-gray-400 rounded-full hover:bg-gray-100 transition-all">
                <X size={28}/>
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="p-12 overflow-y-auto max-h-[75vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Nombre del Producto</label>
                    <input type="text" required className="w-full px-8 py-6 rounded-2xl border border-gray-50 bg-offwhite font-bold text-lg outline-none focus:ring-8 focus:ring-primary/5 transition-all" value={currentProduct.nombre} onChange={e => setCurrentProduct({...currentProduct, nombre: e.target.value})} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Precio Ref. (USD)</label>
                      <input type="number" step="0.01" required className="w-full px-8 py-6 rounded-2xl border border-gray-50 bg-offwhite font-black text-xl outline-none focus:ring-8 focus:ring-accent/5 transition-all" value={currentProduct.precio} onChange={e => setCurrentProduct({...currentProduct, precio: parseFloat(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Unidad de Venta</label>
                      <select className="w-full px-8 py-6 rounded-2xl border border-gray-50 bg-offwhite font-black text-base outline-none focus:ring-8 focus:ring-primary/5 transition-all appearance-none" value={currentProduct.unidad} onChange={e => setCurrentProduct({...currentProduct, unidad: e.target.value})}>
                        <option value="und">Unidades (UND)</option>
                        <option value="kg">Kilos (KG)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Departamento</label>
                      <input type="text" required placeholder="Ej: Carnicería" className="w-full px-8 py-6 rounded-2xl border border-gray-50 bg-offwhite font-bold outline-none" value={currentProduct.departamento} onChange={e => setCurrentProduct({...currentProduct, departamento: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Categoría Filtro</label>
                      <input type="text" required placeholder="Ej: Aves" className="w-full px-8 py-6 rounded-2xl border border-gray-50 bg-offwhite font-bold outline-none" value={currentProduct.categoria} onChange={e => setCurrentProduct({...currentProduct, categoria: e.target.value})} />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 p-8 bg-offwhite rounded-[2rem] border border-gray-50 shadow-inner">
                    <input type="checkbox" id="disp_check" className="w-8 h-8 accent-primary cursor-pointer" checked={currentProduct.disponible} onChange={e => setCurrentProduct({...currentProduct, disponible: e.target.checked})} />
                    <label htmlFor="disp_check" className="text-xs font-black text-primary uppercase tracking-[0.1em] cursor-pointer">Disponible para el público</label>
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Imagen del Producto (Storage)</label>
                    <div className="relative h-72 bg-offwhite border-4 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center overflow-hidden group shadow-inner">
                      {currentProduct.imagenurl ? (
                        <img src={currentProduct.imagenurl} className="w-full h-full object-contain mix-blend-multiply p-6" />
                      ) : (
                        <div className="text-center p-12">
                          <Upload size={64} className="mx-auto text-gray-200 mb-6" />
                          <p className="text-[11px] font-black text-gray-300 uppercase tracking-widest leading-relaxed">Arrastra o selecciona<br/>una imagen de alta calidad</p>
                        </div>
                      )}
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white font-black text-[12px] uppercase tracking-[0.3em] gap-4 backdrop-blur-sm">
                        <Upload size={32}/> Cambiar Imagen
                      </button>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                      {uploadingImg && (
                        <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center gap-5">
                          <RefreshCw className="animate-spin text-accent" size={48} />
                          <span className="text-[11px] font-black text-primary uppercase tracking-widest">Inyectando en Supabase...</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Descripción Técnica / Origen</label>
                    <textarea rows={4} placeholder="Detalles específicos para el cliente..." className="w-full px-8 py-6 rounded-[2rem] border border-gray-50 bg-offwhite font-bold text-base outline-none resize-none focus:ring-8 focus:ring-primary/5 transition-all" value={currentProduct.descripcion} onChange={e => setCurrentProduct({...currentProduct, descripcion: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <button type="submit" className="w-full bg-primary text-white py-8 rounded-[2.5rem] font-black uppercase text-base tracking-[0.4em] shadow-2xl shadow-primary/30 flex items-center justify-center gap-6 hover:scale-[1.02] active:scale-95 transition-all">
                  <CheckCircle size={32}/> Finalizar Guardado en Nube
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
