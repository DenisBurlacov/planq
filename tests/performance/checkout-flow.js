import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';

export const options = {
  stages: [
    { duration: '10s', target: 3 },
    { duration: '30s', target: 8 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'],
    http_req_failed: ['rate<0.10'],
  },
};

function authHeaders(token) {
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
}

export default function () {
  const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const email = `checkout-${uniqueId}@test.mock`;
  const password = 'Password1!';

  // Register
  http.post(
    `${BASE_URL}/api/v1/auth/register`,
    JSON.stringify({ email, password, name: `Checkout ${uniqueId}` }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  // Login
  const loginRes = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ email, password }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (loginRes.status !== 200) return;

  const { accessToken } = JSON.parse(loginRes.body);

  sleep(0.5);

  // Get products
  const productsRes = http.get(`${BASE_URL}/api/v1/products?page=1&limit=5`);
  if (productsRes.status !== 200) return;

  const products = JSON.parse(productsRes.body);
  if (!products.items || products.items.length === 0) return;

  const productId = products.items[0].id;

  // Add to cart
  const addCartRes = http.post(
    `${BASE_URL}/api/v1/cart`,
    JSON.stringify({ productId, quantity: 1 }),
    authHeaders(accessToken)
  );
  check(addCartRes, {
    'add to cart success': (r) => r.status === 200 || r.status === 201,
  });

  sleep(0.5);

  // Checkout with card
  const checkoutRes = http.post(
    `${BASE_URL}/api/v1/orders/checkout`,
    JSON.stringify({
      shippingAddress: '123 Performance Test St, Load City',
      paymentMethod: 'CARD',
      cardNumber: '4242424242424242',
    }),
    authHeaders(accessToken)
  );
  check(checkoutRes, {
    'checkout status is 201': (r) => r.status === 201,
    'checkout returns order': (r) => {
      if (r.status !== 201) return false;
      const body = JSON.parse(r.body);
      return !!body.id && body.status === 'PENDING';
    },
  });

  sleep(1);
}
