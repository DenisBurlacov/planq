import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { cartApi } from '@api/cart';
import { useCartStore } from '@store/cart.store';
import { useAuthStore } from '@store/auth.store';
import { useToast } from '@components/ui/Toast';
import { ApiException } from '@api/client';
import type { Product } from '@appTypes/api';

export function useAddToCart() {
  const { t } = useTranslation('catalog');
  const { accessToken } = useAuthStore();
  const { increment } = useCartStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();

  const addToCart = async (product: Product, quantity = 1) => {
    if (!accessToken) {
      navigate('/login', { state: { from: location } });
      return;
    }
    try {
      await cartApi.add(product.id, quantity);
      increment(quantity);
      await qc.invalidateQueries({ queryKey: ['cart'] });
      toast('success', t('product.addedToCartName', { name: product.name }));
    } catch (err) {
      toast('error', err instanceof ApiException ? err.message : t('product.failedAddToCart'));
    }
  };

  return addToCart;
}
