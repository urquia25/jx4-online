
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
  const [cintillo, setCintillo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAppData();
      if (data) {
        setProducts(data.productos);
        
        if (Array.isArray(data.departamentos)) {
          setCategories(data.departamentos.map((d: any) => ({
            nombre: d.NOMBRE || d.nombre || 'General'
          })));
        }
        
        setConfig({
          tasa_cambio: data.tasa_cambio,
          whatsapp_principal: data.config.whatsapp_principal || '584241208234',
          app_name: data.config.app_name || 'JX4 Paracotos'
        });

        if (Array.isArray(data.cintillo) && data.cintillo.length > 0) {
          setCintillo(data.cintillo[0].texto || data.cintillo[0].TEXTO || '');
        } else {
          setCintillo('Calidad y confianza en Paracotos.');
        }

        setError(null);
      } else {
        throw new Error("Respuesta de datos inválida del servidor");
      }
    } catch (err) {
      console.error('Error en refreshData:', err);
      setError('No se pudo sincronizar con JX4 Cloud. Verifique su conexión.');
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
