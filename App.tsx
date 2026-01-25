
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import HomePage from './pages/HomePage';
import CheckoutPage from './pages/CheckoutPage';
import MyOrdersPage from './pages/MyOrdersPage';
import AdminPage from './pages/AdminPage';
import { ShieldAlert, TrendingUp } from 'lucide-react';

const Footer: React.FC = () => {
  const { config } = useAppContext();
  
  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-16">
        <div>
          <h3 className="text-2xl font-black mb-6 text-primary tracking-tighter">JX4 Paracotos</h3>
          <p className="text-gray-400 leading-relaxed font-medium text-sm">
            Calidad garantizada en víveres y carnicería. Distribución directa desde el corazón de Paracotos.
          </p>
          
          {/* Tasa de Cambio Minimalista en el Footer */}
          <div className="mt-8 inline-flex items-center gap-4 bg-offwhite px-5 py-2.5 rounded-2xl border border-gray-50">
            <TrendingUp size={14} className="text-gray-300" />
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Ref. Día: <span className="text-primary">{config.tasa_cambio} Bs.</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-black mb-8 uppercase text-[10px] tracking-[0.2em] text-accent">Explorar</h4>
          <ul className="space-y-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            <li><Link to="/" className="hover:text-primary transition-colors">Catálogo Digital</Link></li>
            <li><Link to="/mis-pedidos" className="hover:text-primary transition-colors">Estado de Pedidos</Link></li>
            <li><Link to="/admin" className="flex items-center gap-2 hover:text-primary transition-colors"><ShieldAlert size={14}/> Acceso Admin</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-black mb-8 uppercase text-[10px] tracking-[0.2em] text-accent">Contacto</h4>
          <p className="text-sm text-gray-400 mb-6 font-medium italic">Paracotos, Estado Miranda</p>
          <a href="https://wa.me/584241208234" target="_blank" className="inline-block bg-primary text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:shadow-primary/20 transition-all active:scale-95">
            Pedir por WhatsApp
          </a>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 mt-20 pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] text-gray-300 font-black uppercase tracking-[0.2em]">
        <span>&copy; {new Date().getFullYear()} JX4 Paracotos • v10.0.3</span>
        <div className="flex gap-6 italic">
          <span>Diseño Minimalista</span>
          <Link to="/admin" className="hover:text-primary">Acceso Privado</Link>
        </div>
      </div>
    </footer>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col bg-[#fcfcfc]">
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/mis-pedidos" element={<MyOrdersPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </CartProvider>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
