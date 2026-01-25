import React, { useState } from 'react';
import { ShoppingCart, ImageIcon, Info, AlertCircle, X, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { transformDriveUrl, formatCurrency, formatBs } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  exchangeRate: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, exchangeRate }) => {
  const { addToCart, cartDepartment, clearAndAdd } = useCart();
  const navigate = useNavigate();
  
  const [imgError, setImgError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  
  const rawPrice = parseFloat(String(product.precio)) || 0;
  const priceInVes = rawPrice * (exchangeRate || 36.5);
  const imageUrl = transformDriveUrl(product.imagenurl);

  const isWeighted = product.unidad === 'kg' || 
                     product.categoria?.toLowerCase().includes('carniceria') || 
                     product.categoria?.toLowerCase().includes('charcuteria') ||
                     product.categoria?.toLowerCase().includes('frutas') ||
                     product.categoria?.toLowerCase().includes('verduras');

  const handleAddToCart = () => {
    const success = addToCart(product);
    if (success) {
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 2000);
    } else {
      setShowConflictModal(true);
    }
  };

  const handleClearAndAdd = () => {
    clearAndAdd(product);
    setShowConflictModal(false);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  return (
    <div className="group relative bg-white rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full border border-gray-50">
      {/* Success Feedback */}
      {addedFeedback && (
        <div className="absolute inset-x-5 top-5 z-30 bg-primary text-white text-[10px] font-black uppercase py-2 px-4 rounded-xl flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
          <ShoppingBag size={12} /> Agregado a {product.categoria}
        </div>
      )}

      {/* Status Badge */}
      <div className={`absolute top-4 right-4 px-2.5 py-1 rounded-lg text-[8px] uppercase tracking-widest font-black z-20 shadow-sm ${
        product.disponible 
          ? 'bg-green-50 text-green-600' 
          : 'bg-red-50 text-red-600'
      }`}>
        {product.disponible ? (isWeighted ? '✓ Por Kilo' : '✓ Stock') : '✕ Agotado'}
      </div>
      
      {/* Image Container */}
      <div className="relative h-48 mb-6 overflow-hidden rounded-2xl bg-offwhite flex items-center justify-center border border-gray-50 p-2">
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
              className={`w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-1000 ease-out ${
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
        
        {product.descripcion && (
          <button 
            onClick={() => setShowFullDesc(true)}
            className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full shadow-lg text-primary hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
          >
            <Info size={16} />
          </button>
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

          {isWeighted && (
            <div className="mb-4 flex items-start gap-1.5 p-2 bg-amber-50 rounded-xl border border-amber-100/50">
              <AlertCircle size={12} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-[9px] font-bold text-amber-700 leading-tight">
                Sujeto a peso final.
              </p>
            </div>
          )}
          
          <div className="mt-auto pt-4 flex flex-col border-t border-gray-50">
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-xl font-black text-primary leading-none">
                  {formatCurrency(rawPrice)}
                  <span className="text-[10px] text-gray-400 ml-1 font-bold">{isWeighted ? '/ Kg' : '/ Und'}</span>
                </span>
                <span className="text-[11px] font-bold text-accent mt-1">
                  {formatBs(priceInVes)}
                </span>
              </div>
              
              <button
                onClick={handleAddToCart}
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

      {/* Conflict Modal */}
      {showConflictModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-primary/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8 text-amber-600">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-2xl font-black text-primary mb-4">Carrito Ocupado</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-medium mb-10 px-4">
                Para agregar productos de <b className="text-accent">[{product.categoria}]</b>, primero debes finalizar o vaciar tu pedido actual de <b className="text-primary">[{cartDepartment}]</b>.
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-3"
                >
                  Ir a Finalizar Pedido <ArrowRight size={16}/>
                </button>
                <button 
                  onClick={handleClearAndAdd}
                  className="w-full bg-offwhite text-error py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-gray-100 flex items-center justify-center gap-3"
                >
                  <Trash2 size={16}/> Empezar Carrito Nuevo
                </button>
                <button 
                  onClick={() => setShowConflictModal(false)}
                  className="w-full py-4 text-gray-400 font-bold uppercase text-[9px] tracking-[0.2em]"
                >
                  Seguir Comprando Actual
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Description Modal */}
      {showFullDesc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="relative h-64 bg-offwhite p-4">
               <img src={imageUrl} alt={product.nombre} className="w-full h-full object-contain mix-blend-multiply" />
               <button 
                onClick={() => setShowFullDesc(false)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
               >
                <X size={20} />
               </button>
            </div>
            <div className="p-8">
              <span className="text-[10px] font-black text-accent uppercase tracking-widest">{product.categoria}</span>
              <h3 className="text-2xl font-black text-primary mt-2 mb-4">{product.nombre}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                {product.descripcion || "No hay descripción adicional disponible."}
              </p>
              <div className="flex items-center justify-between border-t pt-6">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Precio</p>
                  <p className="text-xl font-black text-primary">{formatCurrency(rawPrice)}</p>
                </div>
                <button 
                  onClick={() => { handleAddToCart(); setShowFullDesc(false); }}
                  className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                >
                  Agregar <ShoppingCart size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;