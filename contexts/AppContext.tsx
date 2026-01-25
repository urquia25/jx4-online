
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Config, Category } from '../types';
import { fetchAppData } from '../services/api';

interface AppContextType {
  products: Product[];
  config: Config;
  categories: Category[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  cintillo: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<Config>({ tasa_cambio: 1, whatsapp_principal: '', moneda: 'USD' });
  const [categories, setCategories] = useState<Category[]>([]);
  const [cintillo, setCintillo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAppData();
      // Validación estricta para asegurar que siempre sean arreglos
      setProducts(Array.isArray(data?.productos) ? data.productos : []);
      if (data?.config) {
        setConfig(data.config);
      }
      setCategories(Array.isArray(data?.departamentos) ? data.departamentos : []);
      setCintillo(data?.cintillo || '');
      setError(null);
    } catch (err) {
      console.error('refreshData error:', err);
      setError('Fallo al cargar datos del catálogo. Por favor intenta de nuevo.');
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <AppContext.Provider value={{ 
      products: products || [], 
      config, 
      categories: categories || [], 
      loading, 
      error, 
      refreshData, 
      cintillo 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
