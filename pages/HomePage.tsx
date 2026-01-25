
import React, { useState, useMemo } from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import ProductCard from '../components/Product/ProductCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const HomePage: React.FC = () => {
  const { products, config, categories, loading, error, refreshData, cintillo } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Asegurar que products siempre sea un array antes de filtrar
  const safeProducts = Array.isArray(products) ? products : [];

  const filteredProducts = useMemo(() => {
    return safeProducts.filter(p => {
      if (!p) return false;
      const name = (p.nombre || '').toLowerCase();
      const category = (p.categoria || '').toLowerCase();
      const term = searchTerm.toLowerCase();
      
      const matchesSearch = name.includes(term) || category.includes(term);
      const matchesCategory = selectedCategory === 'All' || p.categoria === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [safeProducts, searchTerm, selectedCategory]);

  if (loading && safeProducts.length === 0) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      {cintillo && (
        <div className="bg-accent/10 border-l-4 border-accent p-4 rounded-xl mb-8 flex items-center justify-between">
          <p className="text-primary font-medium">{cintillo}</p>
          <div className="text-xs font-bold text-accent whitespace-nowrap ml-4">
            Tasa: {config?.tasa_cambio || 0} VES
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
        <div className="relative w-full md:max-w-md flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar productos..." 
              className="w-full pl-12 pr-4 py-4 rounded-full border-none shadow-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => refreshData()}
            disabled={loading}
            title="Refrescar catálogo"
            className={`p-4 bg-white text-primary rounded-full shadow-sm hover:bg-offwhite transition-all active:scale-95 disabled:opacity-50 ${loading ? 'animate-spin' : ''}`}
          >
            <RefreshCw size={24} />
          </button>
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <button 
            onClick={() => setSelectedCategory('All')}
            className={`px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'All' ? 'bg-primary text-white' : 'bg-white text-primary hover:bg-offwhite'
            }`}
          >
            Todos
          </button>
          {Array.isArray(categories) && categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.nombre)}
              className={`px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.nombre ? 'bg-primary text-white' : 'bg-white text-primary hover:bg-offwhite'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      {error && safeProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-error font-bold mb-4">{error}</p>
          <button 
            onClick={refreshData} 
            className="bg-primary text-white px-8 py-3 rounded-full flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={20} /> Reintentar
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} exchangeRate={config?.tasa_cambio || 1} />
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-40">
              <p className="text-gray-400 text-lg font-medium">No encontramos productos que coincidan con tu búsqueda.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;
