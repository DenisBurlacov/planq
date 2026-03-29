// Load .env for tests
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_min_32_chars_here';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_min_32_chars_here';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.RESET_TOKEN = 'test_reset_token';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://planq:planq_secret@localhost:5432/planq_db';
