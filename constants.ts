// Configuración de Entorno JX4 v11.0
// Las variables deben configurarse en el panel de Vercel como VITE_SUPABASE_URL y VITE_SUPABASE_KEY

/**
 * Acceso seguro a las variables de entorno.
 * En algunos entornos de ejecución o durante la fase de carga inicial, 
 * import.meta.env puede ser undefined. Esta validación evita errores fatales.
 */
// Fix: Removed missing vite/client type reference since import.meta is already handled with a safe cast to any
const env = (import.meta as any).env || {};

export const SUPABASE_URL = env.VITE_SUPABASE_URL || 'https://dpnpnqnvfkwipmgyphmx.supabase.co';

export const SUPABASE_KEY = env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwbnBucW52Zmt3aXBtZ3lwaG14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5ODk3NTYsImV4cCI6MjA4NDU2NTc1Nn0.lxGo8CLyhGdBxHgnn8topqy1nPtxTKmaspTZ-G9Sde8';

// Credenciales de administración por defecto
export const ADMIN_USER = 'jjtovar1006';
export const ADMIN_PASS = 'Apamate.25';

export const COLORS = {
  primary: '#3d4a3e',
  accent: '#d4a574',
  offwhite: '#f8f9f8',
  darkText: '#2d3748',
  success: '#48bb78',
  error: '#f56565',
};
