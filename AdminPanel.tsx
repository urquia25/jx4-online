import React, { useState, useEffect } from 'react';
import { useCart, API_BASE_URL } from './CartContext';
import { OrderRecord, ApiResponse } from './types';
import DebugImagenes from './components/DebugImagenes';

const AdminPanel: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { tasaDolar, whatsappPrincipal, folderIdImagenes, appSheetAppName, appSheetTableName, departments = [], isApiConfigured, refreshConfig } = useCart();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [showDebug, setShowDebug] = useState(false);

  // Form states
  const [formTasa, setFormTasa] = useState(tasaDolar.toString());
  const [formWA, setFormWA] = useState(whatsappPrincipal);
  const [formFolder, setFormFolder] = useState(folderIdImagenes);
  const [formAppName, setFormAppName] = useState(appSheetAppName);
  const [formTableName, setFormTableName] = useState(appSheetTableName);
  const [newDept, setNewDept] = useState({ nombre: '', telefono: '' });

  useEffect(() => {
    setFormTasa(tasaDolar.toString());
    setFormWA(whatsappPrincipal);
    setFormFolder(folderIdImagenes);
    setFormAppName(appSheetAppName);
    setFormTableName(appSheetTableName);
  }, [tasaDolar, whatsappPrincipal, folderIdImagenes, appSheetAppName, appSheetTableName]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === 'jjtovar1006' && pass === 'Apamate.25') {
      setIsAuthenticated(true);
      if (isApiConfigured) fetchOrders();
    } else {
      alert('Credenciales incorrectas');
    }
  };

  const fetchOrders = async () => {
    if (!isApiConfigured) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}?action=admin_pedidos&t=${Date.now()}`);
      const data: ApiResponse<OrderRecord[]> = await res.json();
      if (data.success) {
        setOrders(Array.isArray(data.data) ? data.data : []);
      }
    } catch (e) {
      setMsg('Error al obtener pedidos.');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setMsg('Sincronizando configuración...');
    try {
      await fetch(API_BASE_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ 
          action: 'update_config', 
          tasa_dolar: parseFloat(formTasa),
          whatsapp_principal: formWA,
          folder_id_imagenes: formFolder,
          appsheet_app_name: formAppName,
          appsheet_table_name: formTableName
        })
      });
      setMsg('✅ Configuración guardada.');
      setTimeout(() => { setMsg(''); refreshConfig(); }, 2000);
    } catch (e) { setMsg('❌ Error.'); }
  };

  const addDepartment = async () => {
    if (!newDept.nombre || !newDept.telefono) return;
    setMsg('Agregando departamento...');
    try {
      await fetch(API_BASE_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'add_department', ...newDept })
      });
      setNewDept({ nombre: '', telefono: '' });
      setMsg('✅ Departamento agregado.');
      setTimeout(() => { setMsg(''); refreshConfig(); }, 2000);
    } catch (e) { setMsg('❌ Error.'); }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Admin Jx4</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="Usuario" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black/5" value={user} onChange={e => setUser(e.target.value)} />
            <input type="password" placeholder="Contraseña" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black/5" value={pass} onChange={e => setPass(e.target.value)} />
            <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold active:scale-95 transition-transform">Entrar</button>
            <button type="button" onClick={onBack} className="w-full text-gray-400 text-sm py-2">Volver</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] pb-20 p-4 md:p-8 animate-fade-in">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Panel de Control</h1>
          <p className="text-xs text-gray-400 font-medium">Gestiona la configuración y pedidos de Jx4</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setShowDebug(!showDebug)} 
                className={`p-3 border rounded-full transition-all ${showDebug ? 'bg-black text-white' : 'bg-white border-gray-100 text-gray-400 hover:text-black'}`}
                title="Debug Mode"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            </button>
            <button onClick={onBack} className="p-3 bg-white border border-gray-100 rounded-full text-gray-400 hover:text-black shadow-sm transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
        </div>
      </header>

      {msg && <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full text-sm font-bold z-[100] shadow-2xl animate-bounce">{msg}</div>}

      <main className="max-w-6xl mx-auto space-y-8">
        {showDebug && <DebugImagenes />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
              <div>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                  Ajustes de la Tienda
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Tasa del Dólar (Bs.)</label>
                        <input type="number" step="0.01" value={formTasa} onChange={e => setFormTasa(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 font-bold" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">WhatsApp Principal</label>
                        <input value={formWA} onChange={e => setFormWA(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-black/5" placeholder="584241234567" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">AppSheet AppName (App ID)</label>
                        <input value={formAppName} onChange={e => setFormAppName(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 font-mono text-xs" placeholder="Ej: Jx4-1234567" />
                        <p className="text-[9px] text-gray-400 mt-2 px-2">* AppSheet &gt; Settings &gt; Info &gt; Properties &gt; App Id</p>
                    </div>
                    <button onClick={saveConfig} className="w-full bg-black text-white py-4 rounded-2xl font-bold mt-4 shadow-lg shadow-black/10 active:scale-95 transition-all">
                        Guardar Cambios
                    </button>
                  </div>
              </div>

              <div className="pt-8 border-t border-gray-50">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Departamentos de Atención
                  </h3>
                  <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input placeholder="Nombre (ej: Víveres)" value={newDept.nombre} onChange={e => setNewDept({...newDept, nombre: e.target.value})} className="p-4 bg-gray-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-black/5" />
                      <input placeholder="WhatsApp (58...)" value={newDept.telefono} onChange={e => setNewDept({...newDept, telefono: e.target.value})} className="p-4 bg-gray-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                  <button onClick={addDepartment} className="w-full border-2 border-black py-3 rounded-2xl font-bold text-sm hover:bg-black hover:text-white transition-all">
                      + Agregar Departamento
                  </button>
                  
                  <div className="grid grid-cols-1 gap-2">
                      {(Array.isArray(departments) ? departments : []).map((d, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <div>
                          <div className="text-sm font-bold">{d.nombre}</div>
                          <div className="text-[10px] text-gray-400">{d.telefono}</div>
                          </div>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                      ))}
                  </div>
                  </div>
              </div>
            </section>

            <section className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col max-h-[85vh]">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  Pedidos en Tiempo Real
                  </h3>
                  <button onClick={fetchOrders} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400" title="Actualizar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                  </button>
              </div>

              <div className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                      <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
                      <span className="text-xs font-bold uppercase tracking-widest">Sincronizando...</span>
                  </div>
                  ) : (Array.isArray(orders) ? orders : []).length === 0 ? (
                  <div className="text-center py-20">
                      <p className="text-gray-400 text-sm italic">No hay pedidos registrados todavía.</p>
                  </div>
                  ) : (
                  (Array.isArray(orders) ? orders : []).map(order => (
                      <div key={order.idPedido} className="p-5 border border-gray-50 rounded-3xl space-y-3 hover:border-gray-200 hover:shadow-md transition-all group bg-white">
                      <div className="flex justify-between items-start">
                          <span className="text-[10px] font-black text-white bg-black px-2.5 py-1 rounded-lg uppercase tracking-tighter">{order.idPedido}</span>
                          <span className="text-sm font-black text-gray-900">${Number(order.total).toFixed(2)}</span>
                      </div>
                      <div>
                          <div className="text-sm font-bold text-gray-900">{order.cliente?.nombre || 'Cliente'}</div>
                          <div className="text-[10px] text-gray-400 line-clamp-1">{order.cliente?.direccion || '-'}</div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${order.estado === 'Completado' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                          {order.estado}
                          </span>
                          <span className="text-[9px] text-gray-300 font-medium">
                          {order.fecha ? new Date(order.fecha).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                          </span>
                      </div>
                      </div>
                  ))
                  )}
              </div>
            </section>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;