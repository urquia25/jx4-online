
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart } from 'lucide-react';
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
  const [imgError, setImgError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const priceInVes = product.precio * exchangeRate;
  
  // Priorizar ImagenURL_Publica si existe, de lo contrario usar ImagenURL procesada
  const rawImageUrl = product.imagenurl_publica || product.imagenurl;
  const imageUrl = transformDriveUrl(rawImageUrl);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { rootMargin: '150px', threshold: 0.01 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const hasDescription = product.descripcion && product.descripcion.trim() !== "" && product.descripcion !== "gdgd";
  const showPlaceholder = !rawImageUrl || imgError;

  return (
    <div 
      ref={containerRef}
      className="group relative bg-white rounded-custom p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full border border-transparent hover:border-gray-100"
    >
      {/* Badge de disponibilidad */}
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-black z-10 shadow-sm ${
        product.disponible 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {product.disponible ? 'Disponible' : 'Agotado'}
      </div>
      
      {/* Contenedor de Imagen */}
      <div className="relative h-52 mb-5 overflow-hidden rounded-inner bg-offwhite flex items-center justify-center">
        {isIntersecting && !showPlaceholder ? (
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
              className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-1000 ease-out ${
                isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              loading="lazy"
              onError={() => {
                setImgError(true);
                setIsLoaded(true);
              }}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-inner">
            <span className="text-white text-5xl font-black uppercase tracking-tighter drop-shadow-md">
              {(product.nombre || '?').charAt(0)}
            </span>
          </div>
        )}
      </div>
      
      {/* Información del Producto */}
      <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] text-accent font-black uppercase tracking-widest">
              {product.categoria}
            </p>
          </div>
          
          <h3 className="text-xl font-bold text-darkText mb-2 leading-tight group-hover:text-primary transition-colors">
            {product.nombre}
          </h3>
          
          {/* Descripción condicional: solo si tiene contenido real */}
          {hasDescription && (
            <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed italic">
              {product.descripcion}
            </p>
          )}
          
          <div className="mt-auto pt-4 flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-primary">
                {formatCurrency(product.precio)}
              </span>
              <span className="text-[10px] text-gray-300 font-mono tracking-tighter">
                REF: {product.precio.toFixed(2)}
              </span>
            </div>
            <div className="text-sm text-accent font-bold">
              {formatBs(priceInVes)}
            </div>
          </div>
      </div>
      
      {/* Botón de Acción */}
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
