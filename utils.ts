/**
 * Utilidades para formateo de moneda colombiana (COP) y números
 */

export const formatCOP = (amount: number, includeCurrencyCode: boolean = false): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '$ 0' + (includeCurrencyCode ? ' COP' : '');
  }
  
  const isInteger = Number.isInteger(amount);
  const formatted = amount.toLocaleString('es-CO', {
    minimumFractionDigits: isInteger ? 0 : 2,
    maximumFractionDigits: 2,
  });

  return `$ ${formatted}${includeCurrencyCode ? ' COP' : ''}`;
};
