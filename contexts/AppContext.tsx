
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Config, Category } from '../types';
import { fetchAppData } from '../services/api';
import { parsePrice } from '../utils/formatters';

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
        // Mapeo exhaustivo para coincidir con las columnas de Google Sheets proporcionadas
        const mappedProducts: Product[] = (Array.isArray(data.productos) ? data.productos : []).map((p: any) => ({
          id: p.id || p.ID || '',
          nombre: p.nombre || p.Nombre || 'Sin nombre',
          precio: parsePrice(p.precio || p.Precio),
          categoria: p.categoria || p.Categoria || 'General',
          descripcion: p.descripcion || p.Descripcion || '',
          imagenurl: p.imagenurl || p.ImagenURL || '',
          imagenurl_publica: p.imagenurl_publica || p.ImagenURL_Publica || '',
          departamento: p.departamento || p.Departamento || '',
          // Convertimos 'si' o 'SI' a booleano true
          disponible: String(p.disponible || p.Disponible || '').toLowerCase().trim() === 'si'
        }));

        setProducts(mappedProducts);
        setCategories(Array.isArray(data.departamentos) ? data.departamentos : []);
        
        if (data.config) {
          setConfig({
            tasa_cambio: parsePrice(data.config.tasa_cambio || data.tasa_cambio || 1),
            whatsapp_principal: data.config.whatsapp_principal || '',
            moneda: data.config.moneda || 'USD'
          });
        }

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
