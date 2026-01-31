import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, ApiResponse, Department, AppConfig } from './types';

export const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbxkNIjfx4otnvkhhuBbsQseKyOpq8TyLipP5OMI666tGwR7bg82MC4lUtVMDCsP1eZadA/exec';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  tasaDolar: number;
  whatsappPrincipal: string;
  folderIdImagenes: string;
  appSheetAppName: string;
  appSheetTableName: string;
  departments: Department[];
  setTasaDolar: (tasa: number) => void;
  formatPrice: (usd: number) => string;
  isApiConfigured: boolean;
  refreshConfig: () => Promise<void>;
  getCleanImageUrl: (product: any) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const sanitizePrice = (val: any): number => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  let cleaned = String(val).toLowerCase().replace(/[^\d,.-]/g, '');
  if (cleaned.includes(',') && cleaned.includes('.')) cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  else if (cleaned.includes(',')) cleaned = cleaned.replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [config, setConfig] = useState<AppConfig>({
    tasaDolar: 60.0, 
    whatsappPrincipal: '584241208234', 
    folderIdImagenes: '', 
    appSheetAppName: 'Jx4-324982005', 
    appSheetTableName: 'PRODUCTOS', 
    departments: []
  } as any);

  const isApiConfigured = API_BASE_URL && API_BASE_URL.startsWith('https://script.google.com');

  const fetchConfig = async () => {
    if (!isApiConfigured) return;
    try {
      const res = await fetch(`${API_BASE_URL}?action=config&t=${Date.now()}`);
      const result: ApiResponse<any> = await res.json();
      if (result.success && result.data) {
        setConfig({
          tasaDolar: sanitizePrice(result.data.tasa_dolar || result.data.tasaDolar) || 60,
          whatsappPrincipal: String(result.data.whatsapp_principal || result.data.whatsappPrincipal || '584241208234'),
          folderIdImagenes: String(result.data.folder_id_imagenes || ''),
          appSheetAppName: String(result.data.appsheet_app_name || result.data.appSheetAppName || 'Jx4-324982005'),
          appSheetTableName: String(result.data.appsheet_table_name || result.data.appSheetTableName || 'PRODUCTOS'),
          departments: result.data.departments || []
        });
      }
    } catch (e) { 
      console.warn("Fallo al obtener configuración remota:", e);
    }
  };

  const getCleanImageUrl = (product: any): string => {
    if (!product || typeof product !== 'object') return "";
    
    let rawUrl = product.imagenurl || product.imagenurl_publica || product.foto || product.imagen || "";
    
    if (rawUrl && typeof rawUrl === 'string') {
        // 1. Corregir enlaces de Google Drive para visualización directa
        if (rawUrl.includes('drive.google.com')) {
            const driveMatch = rawUrl.match(/[-\w]{25,}/);
            if (driveMatch) rawUrl = `https://drive.google.com/uc?export=view&id=${driveMatch[0]}`;
        }
        
        // 2. Si es una URL completa, añadir timestamp anti-caché
        if (rawUrl.startsWith('http')) {
            const separator = rawUrl.includes('?') ? '&' : '?';
            return `${rawUrl}${separator}t=${Date.now()}`;
        }
    }

    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.nombre || 'P')}&background=f3f4f3&color=3d4a3e&size=400&bold=true&format=svg`;
    
    // 3. Si sigue siendo una ruta relativa, intentar construirla con la config actual
    if (rawUrl && typeof rawUrl === 'string' && (rawUrl.includes('/') || rawUrl.includes('.'))) {
        return `https://www.appsheet.com/template/gettablefileurl?appName=${encodeURIComponent(config.appSheetAppName)}&tableName=${encodeURIComponent(config.appSheetTableName)}&fileName=${encodeURIComponent(rawUrl)}&t=${Date.now()}`;
    }

    return fallback;
  };

  useEffect(() => {
    const saved = localStorage.getItem('jx4_cart');
    if (saved) try { setCart(JSON.parse(saved)); } catch(e) { setCart([]); }
    fetchConfig();
  }, []);

  useEffect(() => { localStorage.setItem('jx4_cart', JSON.stringify(cart)); }, [cart]);

  const addToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, cantidadSeleccionada: item.cantidadSeleccionada + quantity } : item);
      return [...prev, { ...product, precio: sanitizePrice(product.precio), cantidadSeleccionada: quantity }];
    });
  };

  const formatPrice = (usd: number) => {
    const val = sanitizePrice(usd);
    return `$${val.toFixed(2)} / Bs. ${(val * config.tasaDolar).toLocaleString('es-VE', { minimumFractionDigits: 1 })}`;
  };

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart: (id) => setCart(p => p.filter(i => i.id !== id)),
      updateQuantity: (id, q) => q <= 0 ? setCart(p => p.filter(i => i.id !== id)) : setCart(p => p.map(i => i.id === id ? {...i, cantidadSeleccionada: q} : i)),
      clearCart: () => setCart([]),
      cartTotal: cart.reduce((s, i) => s + (sanitizePrice(i.precio) * i.cantidadSeleccionada), 0),
      cartCount: cart.reduce((s, i) => s + i.cantidadSeleccionada, 0),
      tasaDolar: config.tasaDolar, whatsappPrincipal: config.whatsappPrincipal, folderIdImagenes: config.folderIdImagenes,
      appSheetAppName: config.appSheetAppName, appSheetTableName: config.appSheetTableName,
      departments: config.departments, setTasaDolar: (t) => setConfig(p => ({...p, tasaDolar: t})),
      formatPrice, isApiConfigured, refreshConfig: fetchConfig, getCleanImageUrl
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart fail");
  return c;
};