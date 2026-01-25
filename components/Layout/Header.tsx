
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LayoutDashboard } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { isAdmin } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Catálogo', path: '/' },
    { name: 'Mis Pedidos', path: '/mis-pedidos' },
  ];

  if (isAdmin) {
    navLinks.push({ name: 'Admin', path: '/admin' });
  }

  return (
    <header className="sticky top-0 z-50 glass-card custom-shadow mb-6">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">
            JX4
          </div>
          <span className="text-primary font-bold text-xl hidden sm:inline">Paracotos</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`font-semibold hover:text-accent transition-colors ${location.pathname === link.path ? 'text-accent' : 'text-primary'}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/checkout" className="relative p-2 bg-offwhite rounded-full hover:scale-110 active:scale-95 transition-all text-primary">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {cartCount}
              </span>
            )}
          </Link>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="md:hidden p-2 text-primary hover:text-accent transition-colors"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white border-t p-4 flex flex-col gap-4 shadow-xl">
          {navLinks.map(link => (
            <Link 
              key={link.path} 
              to={link.path} 
              onClick={() => setIsMenuOpen(false)}
              className="text-primary font-bold text-lg p-2 rounded-xl hover:bg-offwhite"
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
