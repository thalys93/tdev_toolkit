/**
 * Converte um valor de centavos para unidades decimais.
 * Ex: 1990 -> 19.90
 */
export function centsToUnits(cents: number): number {
  return Number((cents / 100).toFixed(2));
}

/**
 * Converte um valor em reais para centavos.
 * Ex: 19.90 -> 1990
 */
export function unitsToCents(units: number): number {
  return Math.round(units * 100);
}
