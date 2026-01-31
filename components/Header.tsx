import React from 'react';
import { useCart } from '../CartContext';

interface HeaderProps {
  onCartClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCartClick }) => {
  const { cartCount, tasaDolar } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4 md:px-12">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex flex-col cursor-pointer group" onClick={() => window.location.reload()}>
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-[#2d2d2d] leading-none italic group-hover:text-[#3d4a3e] transition-colors">JX4</h1>
          <span className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-[#6b7280] font-black mt-1">
            la tienda digital de Paracotos
          </span>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex flex-col items-end leading-none">
             <span className="text-[7px] md:text-[9px] uppercase font-black text-gray-300 tracking-widest mb-1">Tasa Ref.</span>
             <span className="text-sm md:text-lg font-black text-[#3d4a3e]">Bs. {tasaDolar.toFixed(2)}</span>
          </div>
          
          <button 
            onClick={onCartClick}
            className="relative p-2.5 text-[#2d2d2d] hover:bg-[#f3f4f3] rounded-full transition-all active:scale-90 border border-transparent"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#3d4a3e] text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black shadow-lg animate-in zoom-in">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;