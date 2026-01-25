
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
    <div className="group relative bg-white rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full border border-gray-50">
      {/* Status Badge */}
      <div className={`absolute top-4 right-4 px-2.5 py-1 rounded-lg text-[8px] uppercase tracking-widest font-black z-20 shadow-sm ${
        product.disponible 
          ? 'bg-green-50 text-green-600' 
          : 'bg-red-50 text-red-600'
      }`}>
        {product.disponible ? '✓ Stock' : '✕ Out'}
      </div>
      
      {/* Image Container */}
      <div className="relative h-48 mb-6 overflow-hidden rounded-2xl bg-offwhite flex items-center justify-center border border-gray-50">
        {!imgError && imageUrl ? (
          <>
            {!isLoaded && (
              <div className="absolute inset-0 bg-gray-50 flex items-center justify-center animate-pulse">
                <div className="w-6 h-6 border-2 border-accent/20 border-t-accent rounded-full animate-spin"></div>
              </div>
            )}
            <img
              src={imageUrl}
              alt={product.nombre}
              onLoad={() => setIsLoaded(true)}
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          <div className="w-full h-full bg-offwhite flex flex-col items-center justify-center p-4">
            <ImageIcon className="text-gray-200 mb-2" size={32} />
            <span className="text-gray-300 text-[10px] font-black uppercase text-center leading-tight">
              {product.nombre}
            </span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col">
          <p className="text-[9px] text-accent font-black uppercase tracking-widest mb-1 opacity-60">
            {product.categoria || 'Variado'}
          </p>
          
          <h3 className="text-base font-bold text-primary mb-2 leading-tight line-clamp-2 min-h-[2.5rem]">
            {product.nombre}
          </h3>
          
          <div className="mt-auto pt-4 flex flex-col border-t border-gray-50">
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-xl font-black text-primary leading-none">
                  {formatCurrency(rawPrice)}
                </span>
                <span className="text-[11px] font-bold text-accent mt-1">
                  {formatBs(priceInVes)}
                </span>
              </div>
              
              <button
                onClick={() => addToCart(product)}
                disabled={!product.disponible}
                className={`p-3 rounded-xl transition-all ${
                  product.disponible
                    ? 'bg-primary text-white hover:bg-[#2d3a2e] shadow-lg active:scale-90'
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
              >
                <ShoppingCart size={16} />
              </button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default ProductCard;
