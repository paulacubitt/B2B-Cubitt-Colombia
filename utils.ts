/**
 * Utilidades para formateo de moneda colombiana (COP) y números con 3 decimales
 */

export const formatCOP = (amount: number, includeCurrencyCode: boolean = false): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '$ 0,000' + (includeCurrencyCode ? ' COP' : '');
  }
  
  const formatted = amount.toLocaleString('es-CO', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });

  return `$ ${formatted}${includeCurrencyCode ? ' COP' : ''}`;
};
