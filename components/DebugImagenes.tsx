import React, { useState, useEffect } from 'react';
import { useCart, API_BASE_URL } from '../CartContext';

const DebugImagenes: React.FC = () => {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const { getCleanImageUrl, appSheetAppName } = useCart();

  useEffect(() => {
    const testImages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}?action=productos&t=${Date.now()}`);
        const result = await res.json();
        if (result.success && result.data) {
          setProductos(result.data);
          const newLogs = [];
          newLogs.push(`AppID Detectado: ${appSheetAppName}`);
          newLogs.push(`Total Productos: ${result.data.length}`);
          setLogs(newLogs);
        }
      } catch (e) {
        setLogs(prev => [...prev, `Error API: ${e}`]);
      } finally {
        setLoading(false);
      }
    };
    testImages();
  }, [API_BASE_URL, appSheetAppName]);

  return (
    <div className="bg-gray-900 text-green-400 p-6 rounded-[2rem] font-mono text-xs overflow-hidden shadow-2xl border border-white/10">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-white">Console: Image Debugger</h3>
        <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-[10px]">LIVE</span>
      </div>

      <div className="space-y-2 mb-8 bg-black/40 p-4 rounded-xl border border-white/5 max-h-40 overflow-y-auto">
        {logs.map((log, i) => (
          <div key={i} className="flex gap-2">
            <span className="opacity-30">[{i}]</span>
            <span>{log}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
        {productos.map((p, i) => {
          const url = getCleanImageUrl(p);
          const hasImageField = !!(p.imagenurl || p.foto || p.imagen || p.imagen_raw);
          
          return (
            <div key={i} className="p-4 bg-black/20 rounded-2xl border border-white/5 flex gap-4 items-start">
              <div className="w-16 h-16 bg-white/5 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 relative">
                <img 
                  src={url} 
                  alt="test" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).parentElement?.classList.add('border-red-500/50');
                  }}
                />
              </div>
              <div className="flex-grow overflow-hidden">
                <div className="font-bold text-white mb-1 truncate">{p.nombre}</div>
                <div className="text-[9px] opacity-60 break-all space-y-1">
                  <p><span className="text-blue-400">Raw:</span> {p.imagen_raw || 'VACIO'}</p>
                  <p><span className="text-yellow-400">Final:</span> {url.substring(0, 50)}...</p>
                  <p>
                    Status: {hasImageField ? '✅ Field OK' : '❌ Field MISSING'} 
                    | {url.includes('ui-avatars') ? '⚠️ Fallback' : '✨ Built URL'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {loading && (
        <div className="text-center py-10 animate-pulse">Analizando flujos de datos...</div>
      )}
    </div>
  );
};

export default DebugImagenes;