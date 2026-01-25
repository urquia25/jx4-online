
// Priorizar variables de entorno de Vite o Next (comunes en Vercel)
export const GAS_URL = (import.meta as any).env?.VITE_GAS_URL || 'https://script.google.com/macros/s/AKfycbz06HxM-b5ekUt1yWZG0R0W_brKgSNuQ-pkA7QkPxzgdM59FZ59txTEe-tz9ghMgx4R/exec';

// Soporte para los nombres de variables que proporcionaste de Supabase
export const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 
                            (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL || 
                            'https://dpnpnqnvfkwipmgyphmx.supabase.co';

export const SUPABASE_KEY = (import.meta as any).env?.VITE_SUPABASE_KEY || 
                            (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
                            (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwbnBucW52Zmt3aXBtZ3lwaG14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5ODk3NTYsImV4cCI6MjA4NDU2NTc1Nn0.lxGo8CLyhGdBxHgnn8topqy1nPtxTKmaspTZ-G9Sde8';

export const ADMIN_USER = (import.meta as any).env?.VITE_ADMIN_USER || 'jjtovar1006';
export const ADMIN_PASS = (import.meta as any).env?.VITE_ADMIN_PASS || 'Apamate.25';

export const COLORS = {
  primary: '#3d4a3e',
  accent: '#d4a574',
  offwhite: '#f8f9f8',
  darkText: '#2d3748',
  success: '#48bb78',
  error: '#f56565',
};
