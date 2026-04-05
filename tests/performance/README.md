# Performance Tests (k6)

Load and stress tests for the PLANQ backend API.

## Prerequisites

Install k6: https://grafana.com/docs/k6/latest/set-up/install-k6/

```bash
# macOS
brew install k6

# Linux (Debian/Ubuntu)
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D68
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6

# Arch
sudo pacman -S k6
```

## Running

Make sure the backend is running on `http://localhost:4000` (or set `BASE_URL`).

```bash
# Auth flow: register -> login -> refresh -> logout
k6 run tests/performance/auth-flow.js

# Browse catalog: list, filter, search, product detail
k6 run tests/performance/browse-catalog.js

# Checkout flow: login -> add to cart -> checkout
k6 run tests/performance/checkout-flow.js

# Stress test: concurrent requests to multiple endpoints
k6 run tests/performance/api-stress.js
```

### Custom base URL

```bash
k6 run -e BASE_URL=http://staging.example.com:4000 tests/performance/auth-flow.js
```

## Scripts

| Script              | Description                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------ |
| `auth-flow.js`      | Full authentication lifecycle (register, login, refresh, logout)                           |
| `browse-catalog.js` | Product browsing: list with pagination, category filter, search, detail page               |
| `checkout-flow.js`  | End-to-end purchase: register, login, add to cart, checkout                                |
| `api-stress.js`     | High-concurrency stress test hitting products, categories, health, and auth simultaneously |

## Thresholds

Each script defines thresholds for p95 response time and error rate. k6 exits with code 99 if thresholds are breached.
