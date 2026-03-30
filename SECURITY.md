# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public issue
2. Use GitHub's [private vulnerability reporting](https://github.com/DenisBurlacov/Planq/security/advisories/new)
3. Include: steps to reproduce, affected version, potential impact
4. Allow reasonable time for a fix before public disclosure

We will respond within 5 business days.

## Supported Versions

| Version        | Supported |
| -------------- | --------- |
| 1.0.x (latest) | ✅ Yes    |
| < 1.0.0        | ❌ No     |

## Security Practices

### Authentication

- JWT with short-lived access tokens (15 min) and rotating refresh tokens (7 days)
- Passwords hashed with bcrypt (10 rounds)
- Refresh tokens invalidated on logout

### API

- Rate limiting on all authentication endpoints
- Input validation with Zod on every route
- CORS restricted to configured allowed origins
- HTTP security headers via `helmet`
- SQL injection prevented by Prisma ORM parameterised queries

### Secrets

- All secrets in `.env` files — never committed to git
- `.env.example` contains only placeholder values
- GitHub Actions secrets used for CI/CD credentials

### ⚠️ Important: Demo Application Notice

PLANQ is a **practice/demo application** intended for QA automation learning.

- Do **not** deploy to production with real user data
- Test accounts use simple passwords (`Password1!`) — change before any real deployment
- The `/api/v1/admin/reset` endpoint is protected by a secret token but should be disabled in production
