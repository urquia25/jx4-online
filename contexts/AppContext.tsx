
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
  const [config, setConfig] = useState<Config>({ tasa_cambio: 36.5, whatsapp_principal: '584241208234' });
  const [categories, setCategories] = useState<Category[]>([]);
  const [cintillo, setCintillo] = useState('✨ ¡Bienvenidos a JX4 Paracotos! Calidad que se siente en cada bocado. ✨');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAppData();
      
      if (data) {
        setProducts(data.productos || []);
        
        if (Array.isArray(data.departamentos)) {
          setCategories(data.departamentos.map((d: any) => ({
            nombre: d.nombre || 'General',
            telefono: d.telefono_whatsapp || d.telefono || null
          })));
        }
        
        if (data.config?.cintillo) {
          setCintillo(data.config.cintillo);
        }

        setConfig({
          ...data.config,
          tasa_cambio: parseFloat(data.config.tasa_cambio) || 36.5,
          whatsapp_principal: data.config.whatsapp_principal || '584241208234'
        });

        setError(null);
      }
    } catch (err) {
      console.error('Refresh Error:', err);
      setError('Error al sincronizar datos con el servidor.');
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
