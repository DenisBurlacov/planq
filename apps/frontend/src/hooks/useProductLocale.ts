import { useTranslation } from 'react-i18next';
import type { Product } from '@appTypes/api';

export function useProductName(product: Product): string {
  const { i18n } = useTranslation();
  if (i18n.language === 'ru' && product.nameRu) {
    return product.nameRu;
  }
  return product.name;
}

export function useProductDescription(product: Product): string {
  const { i18n } = useTranslation();
  if (i18n.language === 'ru' && product.descriptionRu) {
    return product.descriptionRu;
  }
  return product.description;
}
