
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
      if (data) {
        // En v9.4.1, los datos vienen directamente bajo la propiedad data que ya extraemos en services/api.ts
        setProducts(Array.isArray(data.productos) ? data.productos : []);
        setCategories(Array.isArray(data.departamentos) ? data.departamentos : []);
        
        if (data.config) {
          setConfig({
            tasa_cambio: parseFloat(data.config.tasa_cambio || data.tasa_cambio || 1),
            whatsapp_principal: data.config.whatsapp_principal || '',
            moneda: data.config.moneda || 'USD'
          });
        }

        // El cintillo en GAS puede ser un array de objetos activos
        if (Array.isArray(data.cintillo) && data.cintillo.length > 0) {
          setCintillo(data.cintillo[0].texto || '');
        } else {
          setCintillo('');
        }

        setError(null);
      } else {
        throw new Error("No se recibieron datos válidos del servidor.");
      }
    } catch (err) {
      console.error('refreshData error:', err);
      setError('Error al cargar datos. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <AppContext.Provider value={{ 
      products, 
      config, 
      categories, 
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
