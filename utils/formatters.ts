
export const formatCurrency = (amount: number | string, currency: string = 'USD') => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(value)) return '$ 0,00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(value);
};

export const formatBs = (amount: number | string) => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(value)) return 'Bs. 0,00';

  return `Bs. ${value.toLocaleString('es-VE', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

export const transformDriveUrl = (url: string): string => {
  if (!url) return '';
  
  // Extraer el ID de Google Drive (funciona con formato /d/ID, uc?id=ID, open?id=ID)
  const driveMatch = url.match(/[-\w]{25,}/);
  
  if (driveMatch && (url.includes('drive.google.com') || url.includes('docs.google.com'))) {
    const fileId = driveMatch[0];
    // Forzamos el servidor de contenido directo (lh3) que es más rápido y estable
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  return url.startsWith('http') ? url : '';
};
