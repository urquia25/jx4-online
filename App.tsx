
import React, { useState, Suspense, useEffect } from 'react';
import { CartProvider } from './CartContext';
import Catalog from './Catalog';
import Checkout from './Checkout';
import AdminPanel from './AdminPanel';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'catalog' | 'checkout' | 'admin'>('catalog');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error("App Error:", error);
      setHasError(true);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center bg-white">
        <h2 className="text-xl font-bold mb-2">Algo salió mal</h2>
        <p className="text-gray-500 mb-6 text-sm">No pudimos cargar la aplicación correctamente en este dispositivo.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-black text-white px-6 py-3 rounded-xl font-bold"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <CartProvider>
      <div className="antialiased text-gray-900 min-h-screen bg-[#fcfcfc]">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center h-screen">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-medium text-gray-400">Iniciando Jx4...</p>
          </div>
        }>
          {currentPage === 'catalog' && (
            <>
              <Catalog onNavigate={setCurrentPage} />
              <button 
                onClick={() => setCurrentPage('admin')}
                className="fixed bottom-6 right-6 p-4 bg-white border border-gray-100 rounded-full shadow-xl text-gray-300 hover:text-black transition-all active:scale-95 z-[60]"
                title="Acceso Admin"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </>
          )}
          {currentPage === 'checkout' && <Checkout onBack={() => setCurrentPage('catalog')} />}
          {currentPage === 'admin' && <AdminPanel onBack={() => setCurrentPage('catalog')} />}
        </Suspense>
      </div>
    </CartProvider>
  );
};

export default App;
