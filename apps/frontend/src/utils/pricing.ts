export function calculateDiscountPercent(price: number, salePrice: number): number {
  return Math.round((1 - salePrice / price) * 100);
}

export function formatPrice(amount: number): string {
  return `\u20AC${amount.toFixed(2)}`;
}
