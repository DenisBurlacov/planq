import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';

export const options = {
  stages: [
    { duration: '10s', target: 5 },
    { duration: '30s', target: 10 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const email = `perf-${uniqueId}@test.mock`;
  const password = 'Password1!';
  const name = `PerfUser ${uniqueId}`;

  // Register
  const registerRes = http.post(
    `${BASE_URL}/api/v1/auth/register`,
    JSON.stringify({ email, password, name }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(registerRes, {
    'register status is 201': (r) => r.status === 201,
  });

  sleep(0.5);

  // Login
  const loginRes = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ email, password }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'login returns tokens': (r) => {
      const body = JSON.parse(r.body);
      return !!body.accessToken && !!body.refreshToken;
    },
  });

  if (loginRes.status !== 200) return;

  const { accessToken, refreshToken } = JSON.parse(loginRes.body);

  sleep(0.5);

  // Refresh
  const refreshRes = http.post(
    `${BASE_URL}/api/v1/auth/refresh`,
    JSON.stringify({ refreshToken }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(refreshRes, {
    'refresh status is 200': (r) => r.status === 200,
  });

  const newRefreshToken = refreshRes.status === 200
    ? JSON.parse(refreshRes.body).refreshToken
    : refreshToken;

  sleep(0.5);

  // Logout
  const logoutRes = http.post(
    `${BASE_URL}/api/v1/auth/logout`,
    JSON.stringify({ refreshToken: newRefreshToken }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(logoutRes, {
    'logout status is 204': (r) => r.status === 204,
  });

  sleep(1);
}
