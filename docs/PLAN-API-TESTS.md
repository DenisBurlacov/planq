# PLANQ — API Test Framework Plan (Python + pytest)

## Target

- **App**: PLANQ e-commerce (http://localhost:4000)
- **Swagger**: http://localhost:4000/api-docs
- **Endpoints**: 110+
- **Auth**: JWT (access + refresh tokens)
- **Roles**: USER, MANAGER, ADMIN

## Tech Stack

```
pytest
requests
allure-pytest
python-dotenv
jsonschema (contract testing)
websocket-client (WS testing)
faker (test data)
```

## Project Structure

```
planq-api-tests/
├── conftest.py              # Global fixtures
├── pytest.ini               # Config
├── requirements.txt
├── .env                     # BASE_URL, RESET_TOKEN
├── src/
│   ├── client/
│   │   ├── base_client.py   # Base HTTP client (requests session, auth headers)
│   │   ├── auth_client.py   # Login, register, refresh, logout
│   │   ├── products_client.py
│   │   ├── cart_client.py
│   │   ├── orders_client.py
│   │   ├── admin_client.py
│   │   ├── profile_client.py
│   │   └── ws_client.py     # WebSocket client
│   ├── models/
│   │   ├── user.py          # Response models (dataclass/pydantic)
│   │   ├── product.py
│   │   ├── order.py
│   │   └── ...
│   ├── helpers/
│   │   ├── auth_helper.py   # Login shortcuts (as_user, as_admin, as_manager)
│   │   ├── data_factory.py  # POST /test/generate wrapper
│   │   ├── cleanup.py       # POST /test/reset wrapper
│   │   └── assertions.py    # Custom assertions (status, schema, contains)
│   └── schemas/
│       ├── product.json     # JSON Schema for contract testing
│       ├── order.json
│       └── ...
├── tests/
│   ├── test_health.py
│   ├── auth/
│   │   ├── test_login.py
│   │   ├── test_register.py
│   │   ├── test_refresh.py
│   │   ├── test_logout.py
│   │   ├── test_forgot_password.py
│   │   ├── test_2fa.py
│   │   └── test_oauth.py
│   ├── products/
│   │   ├── test_list.py
│   │   ├── test_detail.py
│   │   ├── test_search.py
│   │   ├── test_filters.py
│   │   └── test_suggest.py
│   ├── cart/
│   │   ├── test_add.py
│   │   ├── test_update.py
│   │   ├── test_remove.py
│   │   └── test_get.py
│   ├── orders/
│   │   ├── test_checkout.py
│   │   ├── test_cancel.py
│   │   ├── test_list.py
│   │   ├── test_payment_cards.py
│   │   └── test_auto_progress.py
│   ├── profile/
│   │   ├── test_get_update.py
│   │   ├── test_password.py
│   │   ├── test_avatar.py
│   │   ├── test_addresses.py
│   │   ├── test_cards.py
│   │   ├── test_notifications.py
│   │   └── test_webhooks.py
│   ├── admin/
│   │   ├── test_products_crud.py
│   │   ├── test_orders_management.py
│   │   ├── test_users_management.py
│   │   ├── test_promos_crud.py
│   │   ├── test_categories_crud.py
│   │   ├── test_reviews_moderation.py
│   │   ├── test_settings.py
│   │   ├── test_audit_log.py
│   │   ├── test_stats.py
│   │   └── test_manager_restrictions.py
│   ├── security/
│   │   ├── test_unauthorized.py
│   │   ├── test_forbidden.py
│   │   ├── test_rate_limiting.py
│   │   ├── test_xss_injection.py
│   │   └── test_sql_injection.py
│   ├── integration/
│   │   ├── test_checkout_flow.py
│   │   ├── test_order_lifecycle.py
│   │   ├── test_multi_role.py
│   │   └── test_websocket.py
│   └── contract/
│       ├── test_product_schema.py
│       └── test_order_schema.py
└── reports/
    └── allure-results/
```

---

## Test Plan by Priority

### Phase 1: Foundation (Week 1)

**Setup + basic CRUD tests**

1. **conftest.py** — base_url fixture, auth fixtures (user_token, admin_token, manager_token)
2. **test_health.py** — GET /health → 200, response has status: ok
3. **test_login.py**
   - Valid credentials → 200 + tokens
   - Invalid password → 401
   - Non-existent email → 401
   - Empty body → 400
   - Blocked user → 403
4. **test_register.py**
   - Valid registration → 201 + tokens + emailVerified: false
   - Duplicate email → 409
   - Invalid email format → 400
   - Password too short → 400
5. **test_products_list.py**
   - Default pagination → 20 items, page 1
   - Custom limit → limit=5 returns 5
   - Page 2 → different items than page 1
   - Total matches actual count (101)
6. **test_product_detail.py**
   - Valid ID → 200 + full product
   - Invalid ID → 404
   - Includes category, variants

### Phase 2: Shopping Flow (Week 2)

**Cart, checkout, orders**

7. **test_cart.py**
   - Add item → cart has 1 item
   - Add same item → quantity increases
   - Update quantity → reflected
   - Remove item → cart empty
   - Add without auth → 401
8. **test_checkout.py**
   - Success card (4242...) → order created, status PENDING
   - Declined card (4000...0002) → payment failed
   - Wallet payment → balance deducted
   - Promo code SAVE10 → 10% discount applied
   - Missing address → 400
   - Empty cart → 400
9. **test_order_cancel.py**
   - Cancel PENDING → CANCELLED + reason saved
   - Cancel DELIVERED → 400 (can't cancel)
   - Wallet refund on cancel
10. **test_wishlist.py**
    - Add/remove/list
    - Duplicate add → error or idempotent
    - Paginated response

### Phase 3: Profile & Auth Advanced (Week 3)

11. **test_refresh.py** — refresh token rotation, expired refresh → 401
12. **test_forgot_password.py**
    - Valid email → token returned (dev env)
    - Invalid email → 404
    - Rate limiting: 11 requests → 429
13. **test_2fa.py**
    - Enable → get secret
    - Login requires code → tempToken
    - Valid code → real tokens
    - Disable → login works without code
14. **test_addresses.py** — CRUD + set default + max validation
15. **test_cards.py** — CRUD + max 5 limit + brand detection + set default
16. **test_notifications_prefs.py** — get/update preferences
17. **test_avatar.py** — upload (multipart) + delete + file type validation

### Phase 4: Admin (Week 4)

18. **test_admin_products.py** — CRUD + soft delete + restore + bulk delete
19. **test_admin_orders.py** — list + status transitions + invalid transitions + bulk update + CSV export
20. **test_admin_users.py** — list + block/unblock
21. **test_admin_promos.py** — CRUD
22. **test_admin_categories.py** — CRUD
23. **test_admin_reviews.py** — list + delete (moderation)
24. **test_admin_settings.py** — get/update store settings
25. **test_admin_audit.py** — verify actions are logged
26. **test_admin_stats.py** — dashboard stats, revenue chart, top products
27. **test_manager_restrictions.py**
    - MANAGER can: list orders, list products, moderate reviews
    - MANAGER cannot: list users (403), view audit (403), change settings (403), delete products (403)

### Phase 5: Security & Advanced (Week 5)

28. **test_unauthorized.py** — all protected endpoints without token → 401
29. **test_forbidden.py** — USER accessing admin endpoints → 403
30. **test_rate_limiting.py** — exceed rate limit → 429 + Retry-After header
31. **test_xss_injection.py** — `<script>alert(1)</script>` in name/address fields
32. **test_sql_injection.py** — `'; DROP TABLE users; --` in search/filter params
33. **test_content_negotiation.py** — Accept: application/xml → XML response
34. **test_feature_flags.py** — toggle flag → verify effect

### Phase 6: Integration & WebSocket (Week 6)

35. **test_checkout_flow.py** — full E2E: login → add → checkout → verify → cancel → refund
36. **test_order_lifecycle.py** — auto-progress: trigger → listen WS → verify status changes
37. **test_websocket.py** — connect, receive events, handle disconnect/reconnect
38. **test_webhook_delivery.py** — create subscription → trigger event → check delivery log
39. **test_multi_role.py** — same test data, different roles, different expected outcomes

---

## Key Fixtures (conftest.py)

```python
@pytest.fixture(scope="session")
def base_url():
    return os.getenv("BASE_URL", "http://localhost:4000")

@pytest.fixture(scope="session")
def user_token(base_url):
    """Login as regular user, return access token"""

@pytest.fixture(scope="session")
def admin_token(base_url):
    """Login as admin, return access token"""

@pytest.fixture(scope="session")
def manager_token(base_url):
    """Login as manager, return access token"""

@pytest.fixture(autouse=True)
def cleanup(base_url):
    """Reset test data after each test module"""
    yield
    requests.post(f"{base_url}/api/test/reset",
        headers={"X-Reset-Token": RESET_TOKEN},
        json={"scope": ["orders", "cart"]})
```

## Test Accounts

| Role       | Email                  | Password   |
| ---------- | ---------------------- | ---------- |
| User       | alice@example.com      | Password1! |
| User       | bob@example.com        | Password1! |
| Admin      | admin@planq.com        | Password1! |
| Manager    | manager@planq.com      | Password1! |
| Blocked    | blocked@example.com    | Password1! |
| Unverified | unverified@example.com | Password1! |

## Promo Codes

- `SAVE10` — 10% off
- `WELCOME20` — 20% off
- `FLASH30` — 30% off

## Test Cards

- `4242424242424242` — Success
- `4000000000000002` — Declined
- `4000000000000069` — Timeout (5s delay)

## Auto-Progress

```
POST /api/test/orders/:id/auto-progress
Header: X-Reset-Token: super_secret_reset_token_change_in_production
Body: { "intervalSeconds": 8 }
Chain: PROCESSING (8s) → SHIPPED (16s) → DELIVERED (24s)
```
