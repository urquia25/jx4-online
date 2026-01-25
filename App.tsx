
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import HomePage from './pages/HomePage';
import CheckoutPage from './pages/CheckoutPage';
import MyOrdersPage from './pages/MyOrdersPage';
import AdminPage from './pages/AdminPage';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col">
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
              
              <footer className="bg-primary text-white py-12 mt-20">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div>
                    <h3 className="text-2xl font-black mb-6">JX4 Paracotos</h3>
                    <p className="text-primary-foreground/60 leading-relaxed">
                      Calidad y confianza en cada pedido. Tu catálogo favorito de productos seleccionados.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-accent">Navegación</h4>
                    <ul className="space-y-2 text-sm">
                      <li><a href="#/" className="hover:text-accent transition-colors">Inicio</a></li>
                      <li><a href="#/mis-pedidos" className="hover:text-accent transition-colors">Mis Pedidos</a></li>
                      <li><a href="#/admin" className="hover:text-accent transition-colors">Administración</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-accent">Contacto</h4>
                    <p className="text-sm text-primary-foreground/60 mb-2">Paracotos, Estado Miranda, Venezuela</p>
                    <p className="text-lg font-bold">atencion@jx4.com</p>
                  </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 border-t border-white/10 mt-12 pt-8 text-center text-xs text-primary-foreground/40 font-bold uppercase tracking-widest">
                  &copy; {new Date().getFullYear()} JX4 Paracotos v9.4 - Todos los derechos reservados
                </div>
              </footer>
            </div>
          </CartProvider>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
