import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';

export const options = {
  scenarios: {
    products: {
      executor: 'constant-arrival-rate',
      rate: 50,
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 20,
      maxVUs: 50,
      exec: 'browseProducts',
    },
    categories: {
      executor: 'constant-arrival-rate',
      rate: 30,
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 10,
      maxVUs: 30,
      exec: 'browseCategories',
    },
    health: {
      executor: 'constant-arrival-rate',
      rate: 20,
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 5,
      maxVUs: 20,
      exec: 'healthCheck',
    },
    auth: {
      executor: 'constant-arrival-rate',
      rate: 10,
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 10,
      maxVUs: 20,
      exec: 'authFlow',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.10'],
  },
};

export function browseProducts() {
  const page = Math.floor(Math.random() * 5) + 1;
  const res = http.get(`${BASE_URL}/api/v1/products?page=${page}&limit=10`);
  check(res, { 'products 200': (r) => r.status === 200 });
}

export function browseCategories() {
  const res = http.get(`${BASE_URL}/api/v1/categories`);
  check(res, { 'categories 200': (r) => r.status === 200 });
}

export function healthCheck() {
  const res = http.get(`${BASE_URL}/health`);
  check(res, { 'health 200': (r) => r.status === 200 });
}

export function authFlow() {
  const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const email = `stress-${uniqueId}@test.mock`;

  const registerRes = http.post(
    `${BASE_URL}/api/v1/auth/register`,
    JSON.stringify({ email, password: 'Password1!', name: `Stress ${uniqueId}` }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(registerRes, { 'register 201': (r) => r.status === 201 });

  const loginRes = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ email, password: 'Password1!' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(loginRes, { 'login 200': (r) => r.status === 200 });
}
