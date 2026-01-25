
import React, { useState, useMemo } from 'react';
import { Search, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import ProductCard from '../components/Product/ProductCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const HomePage: React.FC = () => {
  const { products, config, categories, loading, error, refreshData } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const safeProducts = Array.isArray(products) ? products : [];

  const filteredProducts = useMemo(() => {
    return safeProducts.filter(p => {
      const name = (p.nombre || '').toLowerCase();
      const cat = (p.categoria || '').toLowerCase();
      const term = searchTerm.toLowerCase();
      const matchesSearch = name.includes(term) || cat.includes(term);
      const matchesCategory = selectedCategory === 'All' || p.categoria === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [safeProducts, searchTerm, selectedCategory]);

  if (loading && safeProducts.length === 0) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20 pt-12">
      {/* Search & Categories Section */}
      <div className="flex flex-col gap-8 mb-16">
        <div className="relative w-full max-w-2xl mx-auto">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
          <input 
            type="text" 
            placeholder="¿Qué estás buscando hoy?" 
            className="w-full pl-16 pr-20 py-5 rounded-[2rem] bg-white border border-gray-100 shadow-sm focus:ring-4 focus:ring-primary/5 focus:border-primary/10 outline-none transition-all text-sm font-medium placeholder:text-gray-300 placeholder:italic"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            onClick={() => refreshData()}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-primary transition-all"
            title="Sincronizar"
          >
            <RefreshCw size={22} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="flex items-center gap-4 w-full overflow-x-auto pb-4 no-scrollbar">
          <div className="flex-shrink-0 p-3 bg-white rounded-xl border border-gray-50 text-gray-300">
            <SlidersHorizontal size={18} />
          </div>
          <button 
            onClick={() => setSelectedCategory('All')}
            className={`px-8 py-3.5 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
              selectedCategory === 'All' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-50'
            }`}
          >
            Todo
          </button>
          {categories.map((cat, idx) => (
            <button 
              key={idx}
              onClick={() => setSelectedCategory(cat.nombre)}
              className={`px-8 py-3.5 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                selectedCategory === cat.nombre ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-50'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
          <p className="text-primary font-bold mb-6">{error}</p>
          <button onClick={() => refreshData()} className="bg-primary text-white px-10 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-lg">Intentar Sincronizar</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} exchangeRate={config.tasa_cambio} />
          ))}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-40 bg-white rounded-[2.5rem] border border-gray-50">
          <p className="text-gray-300 font-black uppercase text-[10px] tracking-[0.5em]">Sin Coincidencias</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
