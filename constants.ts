
// Configuración de Entorno JX4 v11.0 - Supabase Native

const getSafeEnv = () => {
  try {
    const meta = (import.meta as any);
    if (meta && meta.env) return meta.env;
    return (process as any).env || {};
  } catch (e) {
    return {};
  }
};

const env = getSafeEnv();

// Variables de Supabase
export const SUPABASE_URL = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || 'https://dpnpnqnvfkwipmgyphmx.supabase.co';
export const SUPABASE_KEY = env.VITE_SUPABASE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwbnBucW52Zmt3aXBtZ3lwaG14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5ODk3NTYsImV4cCI6MjA4NDU2NTc1Nn0.lxGo8CLyhGdBxHgnn8topqy1nPtxTKmaspTZ-G9Sde8';

// Credenciales de administración
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

export const UI_CONFIG = {
  borderRadius: '2.5rem',
  glassEffect: 'backdrop-blur-md bg-white/80 border border-white/20',
};
