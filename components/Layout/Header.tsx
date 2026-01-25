
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Settings, Megaphone } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAppContext } from '../../contexts/AppContext';

const JX4Logo = ({ version = 'vertical' }: { version?: 'vertical' | 'horizontal' | 'icon' }) => (
  <div className={`flex ${version === 'vertical' ? 'flex-col items-center' : 'items-center gap-3'} group`}>
    <svg 
      viewBox="0 0 100 120" 
      className={version === 'vertical' ? 'w-16 h-20' : 'w-10 h-12'}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hojas / Moño Orgánico */}
      <g className="leaf-group group-hover:-translate-y-1 transition-transform duration-500">
        {/* Hoja Izquierda */}
        <path 
          d="M50 35C50 35 30 35 25 20C20 5 45 0 50 15" 
          fill="#5a8c5e" 
          className="opacity-90"
        />
        <path d="M50 15C45 10 35 15 35 22" stroke="#d4a574" strokeWidth="0.5" />
        
        {/* Hoja Derecha */}
        <path 
          d="M50 35C50 35 70 35 75 20C80 5 55 0 50 15" 
          fill="#3d4a3e" 
        />
        <path d="M50 15C55 10 65 15 65 22" stroke="#d4a574" strokeWidth="0.5" />
      </g>

      {/* Caja de Empaque */}
      <rect 
        x="15" y="35" width="70" height="60" rx="4" 
        fill="#3d4a3e" 
        className="group-hover:shadow-xl transition-all"
      />
      
      {/* Tipografía JX4 Calada */}
      <text 
        x="50" y="75" 
        fill="white" 
        textAnchor="middle" 
        style={{ fontSize: '22px', fontWeight: 900, fontFamily: 'Plus Jakarta Sans' }}
      >
        JX4
      </text>
    </svg>
    
    {version === 'vertical' && (
      <div className="mt-1 text-center">
        <span className="block text-[10px] font-black tracking-[0.4em] text-primary uppercase">Paracotos</span>
        <span className="block text-[6px] font-bold tracking-[0.2em] text-accent uppercase opacity-80 mt-0.5">Natural Selection</span>
      </div>
    )}
  </div>
);

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { isAdmin } = useAuth();
  const { cintillo } = useAppContext();
  const location = useLocation();

  const navLinks = [
    { name: 'Catálogo', path: '/' },
    { name: 'Mis Pedidos', path: '/mis-pedidos' },
    { name: 'Admin', path: '/admin', isAdmin: true }
  ];

  return (
    <div className="sticky top-0 z-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-28 flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between">
          <Link to="/" className="hover:opacity-90 transition-opacity">
            <JX4Logo version="vertical" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map(link => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`px-6 py-2 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] transition-all ${
                  location.pathname === link.path 
                    ? 'text-primary bg-offwhite shadow-inner' 
                    : 'text-gray-400 hover:text-primary'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/checkout" className="relative p-3 text-primary bg-white border border-gray-100 rounded-full shadow-sm hover:scale-110 transition-all">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-[9px] w-5 h-5 flex items-center justify-center rounded-full font-black border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="md:hidden p-2 text-primary bg-offwhite rounded-full"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Cintillo Minimalista */}
      <div className="bg-white border-b border-gray-50 py-2 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-4">
          <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em]">
            {cintillo || "Calidad y confianza en cada pedido"}
          </p>
          <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-[112px] left-0 w-full bg-white border-t border-gray-100 p-8 flex flex-col gap-4 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 rounded-b-[2rem]">
          {navLinks.map(link => (
            <Link 
              key={link.path} 
              to={link.path} 
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center justify-between p-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all ${
                location.pathname === link.path 
                  ? 'bg-primary text-white shadow-xl translate-x-2' 
                  : 'text-primary bg-offwhite border border-gray-50'
              }`}
            >
              <span>{link.name}</span>
              <Settings size={16} className={location.pathname === link.path ? 'text-white' : 'text-gray-200'} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Header;
