import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';

export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '30s', target: 20 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<400'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  // List products (page 1)
  const listRes = http.get(`${BASE_URL}/api/v1/products?page=1&limit=10`);
  check(listRes, {
    'list products 200': (r) => r.status === 200,
    'list returns items': (r) => {
      const body = JSON.parse(r.body);
      return Array.isArray(body.items) && body.items.length > 0;
    },
  });

  sleep(0.5);

  // Filter by category
  const catRes = http.get(`${BASE_URL}/api/v1/categories`);
  check(catRes, {
    'categories 200': (r) => r.status === 200,
  });

  if (catRes.status === 200) {
    const categories = JSON.parse(catRes.body);
    if (Array.isArray(categories) && categories.length > 0) {
      const catSlug = categories[0].slug;
      const filteredRes = http.get(`${BASE_URL}/api/v1/products?category=${catSlug}&page=1&limit=5`);
      check(filteredRes, {
        'filtered products 200': (r) => r.status === 200,
      });
    }
  }

  sleep(0.5);

  // Search
  const searchRes = http.get(`${BASE_URL}/api/v1/products?search=modern&page=1&limit=5`);
  check(searchRes, {
    'search products 200': (r) => r.status === 200,
  });

  sleep(0.5);

  // Product detail
  if (listRes.status === 200) {
    const products = JSON.parse(listRes.body);
    if (products.items && products.items.length > 0) {
      const productSlug = products.items[0].slug;
      const detailRes = http.get(`${BASE_URL}/api/v1/products/${productSlug}`);
      check(detailRes, {
        'product detail 200': (r) => r.status === 200,
      });
    }
  }

  sleep(1);
}
