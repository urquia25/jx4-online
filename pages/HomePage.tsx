
import React, { useState, useMemo } from 'react';
import { Search, RefreshCw, Megaphone, TrendingUp } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import ProductCard from '../components/Product/ProductCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const HomePage: React.FC = () => {
  const { products, config, categories, loading, error, refreshData, cintillo } = useAppContext();
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
    <div className="max-w-7xl mx-auto px-4 pb-20">
      {/* Banner de Información y Tasa Minimalista */}
      <div className="mb-10">
        <div className="bg-primary text-white p-4 rounded-custom flex flex-col md:flex-row items-center justify-between shadow-xl gap-6 relative overflow-hidden">
          {/* Decoración sutil de fondo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          
          <div className="flex items-center gap-4 z-10 w-full md:w-auto">
            <div className="bg-accent/20 p-3 rounded-2xl flex-shrink-0">
              <Megaphone size={20} className="text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm md:text-base font-bold leading-tight line-clamp-2 italic">
                {cintillo || "JX4 Paracotos: Calidad y Frescura."}
              </p>
            </div>
          </div>
          
          {/* La Tasa: Fondo blanco, letras gris cemento, fuente pequeña y discreta */}
          <div className="z-10 bg-white px-4 py-2 rounded-full shadow-lg border border-gray-100 flex items-center gap-3 self-center md:self-auto min-w-max">
            <div className="flex items-center gap-2">
              <TrendingUp size={12} className="text-[#9ca3af]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-[#9ca3af]">Ref. del Día</span>
            </div>
            <div className="h-4 w-px bg-gray-100"></div>
            <span className="text-[11px] font-bold text-[#7d7d7d]">
              1 USD = <span className="text-[#525252]">{config.tasa_cambio} Bs.</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
        <div className="relative w-full md:max-w-md flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="¿Qué producto buscas hoy?" 
              className="w-full pl-11 pr-4 py-4 rounded-full border border-gray-100 shadow-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => refreshData()}
            className={`p-4 bg-white text-primary rounded-full shadow-sm hover:bg-offwhite border border-gray-100 transition-all ${loading ? 'animate-spin' : ''}`}
          >
            <RefreshCw size={22} />
          </button>
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 no-scrollbar">
          <button 
            onClick={() => setSelectedCategory('All')}
            className={`px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all shadow-sm ${
              selectedCategory === 'All' ? 'bg-primary text-white' : 'bg-white text-primary hover:bg-offwhite border border-gray-100'
            }`}
          >
            Todo
          </button>
          {categories.map((cat, idx) => (
            <button 
              key={idx}
              onClick={() => setSelectedCategory(cat.nombre)}
              className={`px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all shadow-sm ${
                selectedCategory === cat.nombre ? 'bg-primary text-white' : 'bg-white text-primary hover:bg-offwhite border border-gray-100'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="text-center py-20 bg-red-50 rounded-custom border border-red-100">
          <p className="text-red-800 font-bold mb-4">{error}</p>
          <button onClick={() => refreshData()} className="bg-primary text-white px-6 py-2 rounded-full font-bold">Reintentar</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} exchangeRate={config.tasa_cambio} />
            ))}
          </div>
          
          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-40 bg-white rounded-custom border-2 border-dashed border-gray-100">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-gray-200" />
              </div>
              <p className="text-gray-400 font-medium">No se encontraron productos para "{searchTerm}"</p>
              <button 
                onClick={() => {setSearchTerm(''); setSelectedCategory('All');}}
                className="mt-4 text-primary font-bold hover:underline"
              >
                Limpiar búsqueda
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;
