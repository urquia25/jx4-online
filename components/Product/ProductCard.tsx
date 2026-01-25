
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Info } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { transformDriveUrl, formatCurrency, formatBs } from '../../utils/formatters';

interface ProductCardProps {
  product: Product;
  exchangeRate: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, exchangeRate }) => {
  const { addToCart } = useCart();
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const priceInVes = product.precio * exchangeRate;
  const imageUrl = transformDriveUrl(product.imagenurl);

  // Implementación de Intersection Observer para Lazy Loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.01
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef}
      className="group relative bg-white rounded-custom p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
    >
      {/* Badge de disponibilidad */}
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold z-10 ${
        product.disponible 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {product.disponible ? 'Disponible' : 'Agotado'}
      </div>
      
      {/* Contenedor de Imagen con Lazy Loading */}
      <div className="relative h-48 mb-4 overflow-hidden rounded-inner bg-offwhite flex items-center justify-center">
        {isIntersecting && product.imagenurl ? (
          <>
            {!isLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Cargando...</span>
              </div>
            )}
            <img
              src={imageUrl}
              alt={product.nombre}
              onLoad={() => setIsLoaded(true)}
              className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ease-out ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/' + product.id + '/400/400';
                  setIsLoaded(true);
              }}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white text-4xl font-bold">
              {(product.nombre || '?').charAt(0)}
            </span>
          </div>
        )}
      </div>
      
      {/* Información del Producto */}
      <div className="flex-1 flex flex-col">
          <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-1">
            {product.categoria || 'General'}
          </p>
          <h3 className="text-lg font-bold text-darkText mb-1 line-clamp-1">
            {product.nombre}
          </h3>
          
          {/* Descripción del producto */}
          <p className="text-xs text-gray-500 mb-4 line-clamp-2 min-h-[2rem]">
            {product.descripcion || 'Sin descripción disponible.'}
          </p>
          
          <div className="mt-auto mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-primary">
                {formatCurrency(product.precio)}
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                (Ref: {product.precio})
              </span>
            </div>
            <div className="text-sm text-gray-400 font-medium">
              {formatBs(priceInVes)}
            </div>
          </div>
      </div>
      
      {/* Botón de Acción */}
      <button
        onClick={() => addToCart(product)}
        disabled={!product.disponible}
        className={`w-full py-3.5 rounded-inner font-bold flex items-center justify-center gap-2 transition-all ${
          product.disponible
            ? 'bg-primary text-white hover:bg-[#2d3a2e] active:scale-95 shadow-md hover:shadow-lg'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        <ShoppingCart size={18} />
        {product.disponible ? 'Agregar al carrito' : 'Agotado'}
      </button>
    </div>
  );
};

export default ProductCard;
