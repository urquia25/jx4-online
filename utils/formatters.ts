
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
  
  // Si ya es una URL de previsualización directa (uc?export=view&id=) o de contenido (lh3)
  if (url.includes('googleusercontent.com/d/') || url.includes('drive.google.com/uc')) {
    // Si ya tiene el ID, extraerlo para asegurar el formato lh3 que es más rápido
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]{25,})/) || url.match(/\/d\/([a-zA-Z0-9_-]{25,})/);
    if (idMatch) return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
    return url;
  }

  // Soporte para formato /file/d/ID/view
  const driveRegex = /\/file\/d\/([a-zA-Z0-9_-]{25,})/;
  const idRegex = /[?&]id=([a-zA-Z0-9_-]{25,})/;

  const matchDrive = url.match(driveRegex);
  const matchId = url.match(idRegex);
  
  const fileId = (matchDrive && matchDrive[1]) || (matchId && matchId[1]);

  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  return url.startsWith('http') ? url : '';
};
