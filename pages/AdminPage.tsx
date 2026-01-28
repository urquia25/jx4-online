
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, TrendingUp, History, ShieldAlert, LogOut, 
  RefreshCw, Save, Megaphone, Plus, Trash2, Edit3, Upload, FileText, Download, CheckCircle, Package, Search, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAppContext } from '../contexts/AppContext';
import { upsertProduct, deleteProduct, uploadProductImage } from '../services/supabase';
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
  
  // Product Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>({
    nombre: '', precio: 0, categoria: '', departamento: '', descripcion: '', imagen_url: '', disponible: true, unidad: 'und'
  });
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdmin) {
      if (config?.tasa_cambio) setNewTasa(config.tasa_cambio.toString());
      if (cintillo) setNewCintillo(cintillo);
    }
  }, [isAdmin, config?.tasa_cambio, cintillo]);

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
      alert('Error al guardar: ' + err.message);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const url = await uploadProductImage(file);
      setCurrentProduct({ ...currentProduct, imagen_url: url });
    } catch (err: any) {
      alert('Error al subir imagen: ' + err.message);
    } finally {
      setUploadingImg(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      await deleteProduct(id);
      refreshData();
    } catch (err: any) {
      alert('Error: ' + err.message);
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
      
      if (confirm(`Se han encontrado ${data.length} productos. ¿Deseas importarlos?`)) {
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
              descripcion: row.Descripcion || row.descripcion || ''
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
      <div className="max-w-md mx-auto py-20 px-4">
        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-gray-100 animate-in fade-in duration-500">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-8 mx-auto">
            <ShieldAlert size={40} />
          </div>
          <h2 className="text-2xl font-black text-center text-primary mb-8">Administración JX4</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <input type="text" placeholder="Usuario" className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-offwhite outline-none font-bold text-primary focus:ring-2 focus:ring-primary/10 transition-all" value={user} onChange={e => setUser(e.target.value)} />
              <input type="password" placeholder="Contraseña" className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-offwhite outline-none font-bold text-primary focus:ring-2 focus:ring-primary/10 transition-all" value={pass} onChange={e => setPass(e.target.value)} />
            </div>
            <button className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:shadow-primary/20 transition-all">Ingresar al Sistema</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20 pt-10">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary rounded-3xl text-white shadow-xl shadow-primary/20">
            <LayoutDashboard size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-primary tracking-tighter">JX4 Control Panel</h2>
            <p className="text-gray-400 font-bold uppercase text-[9px] tracking-[0.3em]">Gestión Integral v11.0</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => refreshData()} className="p-4 bg-white text-primary rounded-full shadow-sm hover:rotate-180 transition-all duration-700">
            <RefreshCw size={24} className={appLoading ? 'animate-spin' : ''}/>
          </button>
          <button onClick={logout} className="text-error font-black bg-red-50 px-8 py-4 rounded-full hover:bg-red-100 transition-colors uppercase text-[10px] tracking-widest border border-red-100 flex items-center gap-2">
            <LogOut size={16}/> Salir
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-10 overflow-x-auto no-scrollbar py-2">
        {[
          { id: 'config', label: 'Configuración', icon: <Save size={14}/> },
          { id: 'products', label: 'Catálogo', icon: <Package size={14}/> },
          { id: 'metrics', label: 'Estadísticas', icon: <TrendingUp size={14}/> }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)} 
            className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-primary text-white shadow-xl shadow-primary/20 -translate-y-1' 
                : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-custom p-10 shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-xl font-black text-primary mb-8 flex items-center gap-3">
              <TrendingUp className="text-accent" size={24}/> Tasa del Día
            </h3>
            <div className="relative mb-6">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 font-black text-xl">Bs.</span>
              <input 
                type="number" step="0.01" 
                className="w-full pl-16 pr-6 py-5 rounded-2xl border border-gray-50 bg-offwhite text-3xl font-black text-primary outline-none focus:ring-4 focus:ring-accent/5 transition-all" 
                value={newTasa} 
                onChange={e => setNewTasa(e.target.value)} 
              />
            </div>
            <button 
              onClick={() => updateExchangeRateInGAS(parseFloat(newTasa))} 
              className="mt-auto w-full bg-accent text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-accent/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Save size={18}/> Actualizar Tasa Global
            </button>
          </div>

          <div className="bg-white rounded-custom p-10 shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-xl font-black text-primary mb-8 flex items-center gap-3">
              <Megaphone className="text-primary" size={24}/> Comunicado (Cintillo)
            </h3>
            <textarea 
              rows={3} 
              className="w-full px-6 py-5 rounded-2xl border border-gray-50 bg-offwhite text-sm font-bold text-primary outline-none resize-none mb-6 focus:ring-4 focus:ring-primary/5 transition-all" 
              placeholder="Escribe el mensaje que verán los clientes..."
              value={newCintillo} 
              onChange={e => setNewCintillo(e.target.value)} 
            />
            <button 
              onClick={() => updateCintilloInGAS(newCintillo)} 
              className="mt-auto w-full bg-primary text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Megaphone size={18}/> Actualizar Anuncio
            </button>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col lg:flex-row gap-6 justify-between items-center">
             <div className="flex gap-3 w-full lg:w-auto">
               <button 
                onClick={() => { setIsEditing(true); setCurrentProduct({ nombre: '', precio: 0, categoria: '', departamento: '', descripcion: '', imagen_url: '', disponible: true, unidad: 'und' }); }} 
                className="flex-1 lg:flex-none bg-primary text-white px-8 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 shadow-xl hover:scale-105 transition-all"
               >
                 <Plus size={18}/> Nuevo Producto
               </button>
               <label className="cursor-pointer bg-white border border-gray-100 text-gray-400 px-8 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm">
                 <FileText size={18}/> Importar Excel
                 <input type="file" className="hidden" accept=".xlsx, .csv" onChange={handleImportExcel} />
               </label>
             </div>

             <div className="relative w-full lg:w-96">
                <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  type="text" 
                  placeholder="Buscar en el catálogo..."
                  className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white border border-gray-100 font-bold text-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
             </div>
          </div>

          <div className="bg-white rounded-custom shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-offwhite border-b border-gray-50">
                  <tr className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">
                    <th className="px-8 py-6 text-left">Info Producto</th>
                    <th className="px-8 py-6 text-left">Precio (Ref)</th>
                    <th className="px-8 py-6 text-left">Categoría</th>
                    <th className="px-8 py-6 text-center">Estado</th>
                    <th className="px-8 py-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-offwhite/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-offwhite border border-gray-50 flex items-center justify-center overflow-hidden p-1">
                            <img 
                              src={p.imagenurl || 'https://ui-avatars.com/api/?name=JX&background=3d4a3e&color=fff'} 
                              className="w-full h-full object-contain" 
                              onError={e => e.currentTarget.src = 'https://ui-avatars.com/api/?name=JX&background=3d4a3e&color=fff'}
                            />
                          </div>
                          <div>
                            <p className="font-black text-primary text-sm leading-tight">{p.nombre}</p>
                            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">{p.unidad}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-black text-accent text-sm">{formatCurrency(p.precio)}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1.5 bg-primary/5 text-primary text-[9px] font-black uppercase rounded-lg border border-primary/10">
                          {p.categoria}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${p.disponible ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${p.disponible ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                          {p.disponible ? 'Activo' : 'Agotado'}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setCurrentProduct({...p, imagen_url: p.imagenurl}); setIsEditing(true); }} 
                            className="p-3 text-primary bg-offwhite rounded-xl hover:bg-primary hover:text-white transition-all"
                          >
                            <Edit3 size={16}/>
                          </button>
                          <button 
                            onClick={() => handleDelete(p.id)} 
                            className="p-3 text-error bg-red-50 rounded-xl hover:bg-error hover:text-white transition-all"
                          >
                            <Trash2 size={16}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <p className="text-gray-300 font-black uppercase text-[10px] tracking-[0.5em]">No hay coincidencias en el catálogo</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Product Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-primary/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between p-8 border-b border-gray-50">
              <h3 className="text-2xl font-black text-primary flex items-center gap-3">
                <Package className="text-accent"/> {currentProduct.id ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button onClick={() => setIsEditing(false)} className="p-3 bg-offwhite text-gray-400 rounded-full hover:bg-gray-100">
                <X size={20}/>
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Nombre Comercial</label>
                    <input type="text" placeholder="Ej: Pollo Entero JX4" required className="w-full px-6 py-4 rounded-2xl border border-gray-50 bg-offwhite font-bold text-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all" value={currentProduct.nombre} onChange={e => setCurrentProduct({...currentProduct, nombre: e.target.value})} />
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Precio Ref. (USD)</label>
                      <input type="number" step="0.01" placeholder="0.00" required className="w-full px-6 py-4 rounded-2xl border border-gray-50 bg-offwhite font-bold text-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all" value={currentProduct.precio} onChange={e => setCurrentProduct({...currentProduct, precio: parseFloat(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Unidad</label>
                      <select className="px-6 py-4 rounded-2xl border border-gray-50 bg-offwhite font-bold text-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all" value={currentProduct.unidad} onChange={e => setCurrentProduct({...currentProduct, unidad: e.target.value})}>
                        <option value="und">Unidad</option>
                        <option value="kg">Kilogramo</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Categoría / Depto</label>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="Categoría" required className="w-full px-6 py-4 rounded-2xl border border-gray-50 bg-offwhite font-bold text-sm outline-none" value={currentProduct.categoria} onChange={e => setCurrentProduct({...currentProduct, categoria: e.target.value})} />
                      <input type="text" placeholder="Departamento" required className="w-full px-6 py-4 rounded-2xl border border-gray-50 bg-offwhite font-bold text-sm outline-none" value={currentProduct.departamento} onChange={e => setCurrentProduct({...currentProduct, departamento: e.target.value})} />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-offwhite rounded-2xl border border-gray-50">
                    <input type="checkbox" id="disp" className="w-5 h-5 accent-primary cursor-pointer" checked={currentProduct.disponible} onChange={e => setCurrentProduct({...currentProduct, disponible: e.target.checked})} />
                    <label htmlFor="disp" className="text-xs font-black text-primary uppercase cursor-pointer">Producto Disponible para la venta</label>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Imagen del Producto</label>
                    <div className="relative h-56 bg-offwhite border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center overflow-hidden group">
                      {currentProduct.imagen_url ? (
                        <img src={currentProduct.imagen_url} className="w-full h-full object-contain mix-blend-multiply" />
                      ) : (
                        <div className="text-center p-8">
                          <Upload size={48} className="mx-auto text-gray-200 mb-4" />
                          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Sin imagen asignada</p>
                        </div>
                      )}
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white font-black text-[10px] uppercase tracking-widest gap-2">
                        <Upload size={24}/> Seleccionar Archivo
                      </button>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                      {uploadingImg && (
                        <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center gap-3">
                          <RefreshCw className="animate-spin text-primary" size={32} />
                          <span className="text-[9px] font-black text-primary uppercase tracking-widest">Subiendo...</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Descripción (Opcional)</label>
                    <textarea placeholder="Detalles, origen, beneficios..." className="w-full px-6 py-4 rounded-2xl border border-gray-50 bg-offwhite font-bold text-sm outline-none h-32 resize-none focus:ring-4 focus:ring-primary/5 transition-all" value={currentProduct.descripcion} onChange={e => setCurrentProduct({...currentProduct, descripcion: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-primary text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all">
                  <CheckCircle size={20}/> {currentProduct.id ? 'Guardar Cambios' : 'Crear Producto'}
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
