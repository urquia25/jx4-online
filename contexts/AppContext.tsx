
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
        // Mapeo adaptado a la estructura de columnas compartida:
        // Col A: ID, Col B: Nombre, Col C: Precio, Col D: Categoria, 
        // Col E: Descripcion, Col F: ImagenURL, Col G: ImagenURL_Publica
        // Col H: Departamento, Col I: Disponible
        const mappedProducts: Product[] = (Array.isArray(data.productos) ? data.productos : []).map((p: any) => ({
          id: p.id || p.ID || '',
          nombre: p.nombre || p.Nombre || 'Sin nombre', // Columna B
          precio: parsePrice(p.precio || p.Precio),    // Columna C
          categoria: p.categoria || p.Categoria || 'General', // Columna D
          descripcion: p.descripcion || p.Descripcion || '', // Columna E
          imagenurl: p.imagenurl || p.ImagenURL || '', // Columna F
          imagenurl_publica: p.imagenurl_publica || p.ImagenURL_Publica || '', // Columna G
          departamento: p.departamento || p.Departamento || '',
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
          setCintillo(data.cintillo[0].texto || data.cintillo[0].Texto || '');
        } else {
          setCintillo('');
        }

        setError(null);
      } else {
        throw new Error("No se recibieron datos del servidor.");
      }
    } catch (err) {
      console.error('refreshData error:', err);
      setError('Error al conectar con la base de datos.');
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
