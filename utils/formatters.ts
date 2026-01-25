
export const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatBs = (amount: number) => {
  return `Bs. ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Convierte un string de precio (ej: "1,5") a un número válido (1.5)
 */
export const parsePrice = (price: any): number => {
  if (typeof price === 'number') return price;
  if (!price) return 0;
  // Reemplaza coma por punto y elimina caracteres no numéricos excepto el punto
  const cleaned = String(price).replace(',', '.').replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const transformDriveUrl = (url: string): string => {
  if (!url) return '';
  // Si ya es una URL de visualización directa, no hacer nada
  if (url.includes('drive.google.com/uc?') || url.includes('docs.google.com/uc?')) {
    return url;
  }
  const driveRegex = /\/file\/d\/([^\/]+)/;
  const match = url.match(driveRegex);
  if (match && match[1]) {
    return `https://docs.google.com/uc?export=view&id=${match[1]}`;
  }
  return url;
};
