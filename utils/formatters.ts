
export const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatBs = (amount: number) => {
  return `Bs. ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const transformDriveUrl = (url: string): string => {
  if (!url) return '';
  const driveRegex = /\/file\/d\/([^\/]+)/;
  const match = url.match(driveRegex);
  if (match && match[1]) {
    return `https://docs.google.com/uc?export=view&id=${match[1]}`;
  }
  return url;
};
