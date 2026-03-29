# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public issue
2. Email the maintainer directly or use GitHub's private vulnerability reporting
3. Include steps to reproduce the vulnerability
4. Allow reasonable time for a fix before public disclosure

## Supported Versions

| Version | Supported |
| ------- | --------- |
| latest  | Yes       |

## Security Practices

- All secrets stored in `.env` files (never committed to git)
- JWT with short-lived access tokens (15 min) and refresh tokens (7 days)
- Rate limiting on authentication endpoints
- HTTP security headers via helmet.js
- CORS restricted to allowed origins
- Input validation with Zod on all endpoints
- Test reset endpoint protected with secret token
