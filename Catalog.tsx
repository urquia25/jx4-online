import React, { useState, useEffect, useCallback } from 'react';
import { Product, ApiResponse } from './types';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import { useCart, API_BASE_URL, sanitizePrice } from './CartContext';

const Catalog: React.FC<{ onNavigate: (page: 'catalog' | 'checkout' | 'admin') => void }> = ({ onNavigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const { isApiConfigured, departments } = useCart();

  const fetchProducts = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError(null);
    if (!isApiConfigured) { 
        setError("La URL del Script no es válida o falta configurar.");
        setLoading(false); 
        return; 
    }
    
    try {
      // IMPORTANTE: No usar cabeceras personalizadas para evitar errores CORS OPTIONS
      const response = await fetch(`${API_BASE_URL}?action=productos&t=${Date.now()}`);
      
      if (!response.ok) throw new Error("Error de respuesta del servidor");
      
      const result: ApiResponse<Product[]> = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setProducts(result.data.map(p => ({ ...p, precio: sanitizePrice(p.precio) })));
      } else {
        throw new Error(result.error || "Error al procesar datos del inventario");
      }
    } catch (e: any) {
      console.error("Connection Error:", e);
      setError("No se pudo conectar con el inventario. Verifique que el Script esté publicado como 'Cualquier persona'.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [isApiConfigured]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  const getCategoryLabel = (id: string) => departments.find(d => d.id === id)?.nombre || id;
  const categories: string[] = ['Todos', ...(Array.from(new Set(products.map(p => p.categoria))) as string[])];
  const filteredProducts = products.filter(p => selectedCategory === 'Todos' || p.categoria === selectedCategory);

  return (
    <div className="min-h-screen pb-24 animate-fade-in bg-[#fdfdfb]">
      <Header onCartClick={() => setIsCartOpen(true)} />
      
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-10 md:mt-16">
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="relative inline-flex items-center gap-3">
            <h2 className="text-2xl md:text-5xl font-black tracking-tighter uppercase italic text-[#2d2d2d] leading-none">
              Catálogo
            </h2>
            <button 
              onClick={handleManualRefresh} 
              disabled={isRefreshing || loading} 
              className={`transition-all p-2 rounded-full hover:bg-gray-100 ${isRefreshing ? 'animate-spin text-[#3d4a3e]' : 'text-gray-200 hover:text-[#3d4a3e]'}`}
              title="Purga de Caché y Sincronización"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
            </button>
          </div>
          <p className="text-[10px] md:text-xs text-[#6b7280] font-black uppercase tracking-[0.4em] mt-4">
            Directo de Tienda
          </p>
          <div className="w-16 h-1 bg-[#3d4a3e]/10 rounded-full mt-8"></div>
        </div>

        {error && (
            <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-3xl text-center">
                <p className="text-red-600 font-bold text-sm uppercase tracking-widest mb-2">Error de Sincronización</p>
                <p className="text-red-400 text-xs">{error}</p>
                <button onClick={() => fetchProducts()} className="mt-4 text-xs font-black text-red-600 underline">REINTENTAR CONEXIÓN</button>
            </div>
        )}

        <div className="flex gap-2 overflow-x-auto md:flex-wrap justify-center pb-8 scrollbar-hide mb-8">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)} 
              className={`px-6 py-3 rounded-2xl text-[9px] md:text-xs font-black uppercase tracking-tight whitespace-nowrap border-2 transition-all active:scale-95
                ${selectedCategory === cat 
                  ? 'bg-[#3d4a3e] text-white border-[#3d4a3e] shadow-xl shadow-[#3d4a3e]/20' 
                  : 'bg-white text-gray-400 border-gray-100 hover:border-[#3d4a3e]/30'}`}
            >
              {cat === 'Todos' ? cat : getCategoryLabel(cat)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="bg-[#f3f4f3] aspect-square rounded-[2.5rem]"></div>
                <div className="h-3 bg-[#f3f4f3] rounded-full w-2/3 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-8 animate-fade-in">
            {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && !error && (
           <div className="py-32 text-center text-gray-300 uppercase font-black text-[11px] tracking-[0.5em] italic opacity-50">
              No se encontraron productos
           </div>
        )}
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onCheckout={() => onNavigate('checkout')} />
    </div>
  );
};

export default Catalog;