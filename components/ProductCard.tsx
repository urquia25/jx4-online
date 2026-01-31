import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, getCleanImageUrl, departments, tasaDolar } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAdd = () => {
    setAdding(true);
    addToCart(product, 1);
    setTimeout(() => setAdding(false), 600);
  };

  const imageUrl = getCleanImageUrl(product);
  const precioNum = Number(product.precio) || 0;
  const isPlaceholder = imageUrl.includes('ui-avatars.com');
  const catLabel = departments.find(d => d.id === product.categoria)?.nombre || product.categoria || 'Gral';

  return (
    <div className="group bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden flex flex-col transition-all duration-500 hover:border-[#3d4a3e]/20 hover:shadow-2xl hover:shadow-[#3d4a3e]/10 h-full relative">
      {/* Imagen con bordes ultra suaves */}
      <div className="aspect-square w-full bg-[#f8f9f8] overflow-hidden relative flex items-center justify-center">
        <img 
          src={imageUrl} 
          alt={product.nombre}
          loading="lazy"
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ${isPlaceholder ? 'opacity-30 p-12' : ''}`}
          onError={(e) => {
            const t = e.target as HTMLImageElement;
            const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.nombre || 'P')}&background=f3f4f3&color=3d4a3e&size=400&bold=true&format=svg`;
            
            // Si falla la carga, aplicamos visual de fallback agresivo
            if (t.src !== fallback) {
                t.src = fallback;
                t.className = "w-full h-full object-cover opacity-30 p-12 animate-fade-in";
            }
          }}
        />
        <div className="absolute top-4 left-4">
            <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm text-[6px] md:text-[9px] uppercase font-black text-[#6b7280] rounded-xl border border-gray-100 shadow-sm">
                {catLabel}
            </span>
        </div>
      </div>
      
      {/* Cuerpo en Gris Oscuro / Verde */}
      <div className="p-5 md:p-7 flex flex-col flex-grow">
        <h3 className="font-black text-[#2d2d2d] text-[12px] md:text-[16px] mb-1 line-clamp-1 leading-tight uppercase tracking-tight group-hover:text-[#3d4a3e] transition-colors">
            {product.nombre}
        </h3>
        <p className="text-[10px] md:text-xs text-[#9ca3af] line-clamp-2 mb-5 flex-grow leading-relaxed font-medium italic">
            {product.descripcion || 'Selección Exclusiva JX4'}
        </p>
        
        <div className="flex flex-col gap-4 mt-auto border-t border-gray-50 pt-5">
          <div className="flex justify-between items-baseline leading-none">
            <span className="text-base md:text-2xl font-black text-[#2d2d2d] tracking-tighter">${precioNum.toFixed(2)}</span>
            <span className="text-[9px] md:text-[12px] text-[#3d4a3e] font-bold uppercase tracking-tighter">Bs. {(precioNum * tasaDolar).toLocaleString('es-VE', { maximumFractionDigits: 1 })}</span>
          </div>
          
          <button 
            onClick={handleAdd}
            disabled={adding}
            className={`w-full py-3.5 md:py-4.5 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-[0.25em] transition-all active:scale-95
              ${adding 
                ? 'bg-green-600 text-white shadow-lg' 
                : 'bg-[#3d4a3e] text-white hover:bg-[#2c362d] shadow-xl shadow-[#3d4a3e]/15'}`}
          >
            {adding ? (
              <span className="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                AÑADIDO
              </span>
            ) : 'AGREGAR'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;