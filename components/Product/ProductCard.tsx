
import React from 'react';
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
  const priceInVes = product.precio * exchangeRate;
  const imageUrl = transformDriveUrl(product.imagenurl);

  return (
    <div className="group relative bg-white rounded-custom p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Badge de disponibilidad */}
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold z-10 ${
        product.disponible 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {product.disponible ? 'Disponible' : 'Agotado'}
      </div>
      
      {/* Imagen */}
      <div className="relative h-48 mb-4 overflow-hidden rounded-inner bg-offwhite flex items-center justify-center">
        {product.imagenurl ? (
          <img
            src={imageUrl}
            alt={product.nombre}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/' + product.id + '/400/400';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white text-4xl font-bold">
              {product.nombre.charAt(0)}
            </span>
          </div>
        )}
      </div>
      
      {/* Información */}
      <div className="flex-1">
          <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-1">
            {product.categoria}
          </p>
          <h3 className="text-lg font-bold text-darkText mb-2 line-clamp-2 min-h-[3.5rem]">
            {product.nombre}
          </h3>
          
          {/* Precios */}
          <div className="mb-6">
            <div className="text-2xl font-black text-primary">
              {formatCurrency(product.precio)}
            </div>
            <div className="text-sm text-gray-400 font-medium">
              {formatBs(priceInVes)}
            </div>
          </div>
      </div>
      
      {/* Botón */}
      <button
        onClick={() => addToCart(product)}
        disabled={!product.disponible}
        className={`w-full py-3.5 rounded-inner font-bold flex items-center justify-center gap-2 transition-all ${
          product.disponible
            ? 'bg-primary text-white hover:bg-[#2d3a2e] active:scale-95'
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
