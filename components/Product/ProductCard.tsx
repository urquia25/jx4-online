
import React, { useState } from 'react';
import { ShoppingCart, ImageIcon } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { transformDriveUrl, formatCurrency, formatBs } from '../../utils/formatters';

interface ProductCardProps {
  product: Product;
  exchangeRate: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, exchangeRate }) => {
  const { addToCart } = useCart();
  const [imgError, setImgError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const rawPrice = parseFloat(String(product.precio)) || 0;
  const priceInVes = rawPrice * (exchangeRate || 36.5);
  const imageUrl = transformDriveUrl(product.imagenurl);

  return (
    <div className="group relative bg-white rounded-custom p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full border border-gray-50 hover:border-primary/10">
      {/* Badge Disponibilidad */}
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-black z-20 shadow-sm ${
        product.disponible 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {product.disponible ? '✓ Disponible' : '✕ Agotado'}
      </div>
      
      {/* Imagen del Producto */}
      <div className="relative h-52 mb-5 overflow-hidden rounded-inner bg-offwhite flex items-center justify-center border border-gray-50">
        {!imgError && imageUrl ? (
          <>
            {!isLoaded && (
              <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin"></div>
              </div>
            )}
            <img
              src={imageUrl}
              alt={product.nombre}
              onLoad={() => setIsLoaded(true)}
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ease-out ${
                isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary to-accent/80 flex flex-col items-center justify-center p-4">
            <ImageIcon className="text-white/40 mb-2" size={40} />
            <span className="text-white text-xl font-black uppercase text-center leading-tight">
              {product.nombre}
            </span>
          </div>
        )}
      </div>
      
      {/* Contenido */}
      <div className="flex-1 flex flex-col">
          <p className="text-[10px] text-accent font-black uppercase tracking-widest mb-1">
            {product.categoria || 'General'}
          </p>
          
          <h3 className="text-xl font-bold text-darkText mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
            {product.nombre}
          </h3>
          
          <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed italic">
            {product.descripcion || 'Sin descripción disponible.'}
          </p>
          
          <div className="mt-auto pt-4 flex flex-col gap-1 border-t border-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-400 uppercase">Precio</span>
              <span className="text-[10px] font-mono text-gray-400">REF: {rawPrice.toFixed(2)}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-3xl font-black text-primary leading-none">
                {formatCurrency(rawPrice)}
              </span>
              <span className="text-lg font-bold text-accent mt-1">
                {formatBs(priceInVes)}
              </span>
            </div>
          </div>
      </div>
      
      <button
        onClick={() => addToCart(product)}
        disabled={!product.disponible}
        className={`mt-6 w-full py-4 rounded-inner font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
          product.disponible
            ? 'bg-primary text-white hover:bg-[#2d3a2e] active:scale-95 shadow-lg hover:shadow-primary/20'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        <ShoppingCart size={18} strokeWidth={3} />
        {product.disponible ? 'Añadir' : 'Agotado'}
      </button>
    </div>
  );
};

export default ProductCard;
