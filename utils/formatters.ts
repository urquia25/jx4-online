
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

/**
 * Extrae el ID de un archivo de Google Drive desde cualquier formato de URL conocido.
 */
export const extractDriveId = (url: string): string | null => {
  if (!url) return null;
  
  // Patrón 1: /file/d/ID/...
  const driveIdRegex1 = /\/file\/d\/([a-zA-Z0-9_-]{25,})/;
  // Patrón 2: id=ID
  const driveIdRegex2 = /[?&]id=([a-zA-Z0-9_-]{25,})/;
  // Patrón 3: uc?id=ID
  const driveIdRegex3 = /uc\?id=([a-zA-Z0-9_-]{25,})/;

  const match1 = url.match(driveIdRegex1);
  if (match1) return match1[1];

  const match2 = url.match(driveIdRegex2);
  if (match2) return match2[1];

  const match3 = url.match(driveIdRegex3);
  if (match3) return match3[1];

  return null;
};

/**
 * Transforma URLs de Google Drive en enlaces de imagen directa fiables.
 */
export const transformDriveUrl = (url: string): string => {
  if (!url) return '';
  
  const fileId = extractDriveId(url);
  if (fileId) {
    // Este subdominio es mucho más permisivo con el hotlinking que uc?id=
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // Si no es un enlace de Drive reconocible pero es una URL absoluta, devolverla tal cual
  return url.startsWith('http') ? url : '';
};
