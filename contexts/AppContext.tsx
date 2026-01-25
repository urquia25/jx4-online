
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Config, Category } from '../types';
import { fetchAppData } from '../services/api';
import { fetchConfigFromSupabase } from '../services/supabase';

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
            nombre: d.NOMBRE || d.nombre || d.Nombre || 'General'
          })));
        }
        
        let tasaFinal = data.tasa_cambio;

        // ESTRATEGIA DE RESPALDO: Si la tasa de GAS es la por defecto (36.5), 
        // probablemente el script de GAS falló al leer la hoja. Consultamos Supabase.
        if (tasaFinal === 36.5) {
          const supabaseTasa = await fetchConfigFromSupabase('tasa_cambio');
          if (supabaseTasa) {
            tasaFinal = parseFloat(supabaseTasa);
          }
        }

        setConfig({
          tasa_cambio: tasaFinal,
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
        throw new Error("Sin datos del servidor");
      }
    } catch (err) {
      console.error('Refresh Error:', err);
      setError('Error al sincronizar datos.');
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
