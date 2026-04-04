import express, { type Express } from 'express';
import path from 'node:path';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { requestIdMiddleware } from '@middleware/requestId.js';
import { errorHandler } from '@middleware/errorHandler.js';
import { swaggerSpec } from '@utils/swagger.js';
import authRouter from '@routes/auth.js';
import healthRouter from '@routes/health.js';
import resetRouter from '@routes/reset.js';
import productsRouter from '@routes/products.js';
import categoriesRouter from '@routes/categories.js';
import cartRouter from '@routes/cart.js';
import ordersRouter from '@routes/orders.js';
import wishlistRouter from '@routes/wishlist.js';
import reviewsRouter from '@routes/reviews.js';
import promoRouter from '@routes/promo.js';
import profileRouter from '@routes/profile.js';
import addressesRouter from '@routes/addresses.js';
import notificationsRouter from '@routes/notifications.js';
import realtimeNotificationsRouter from '@routes/realtime-notifications.js';
import adminRouter from '@routes/admin.js';

const app: Express = express();

// Security
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(compression());

// Body parsing
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Request ID on every request
app.use(requestIdMiddleware);

// Global rate limiting — 100 requests per minute on all public API routes
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'test' ? 10000 : 100,
  message: {
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many requests, please try again later',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/wishlist', wishlistRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/api/v1/promotions', promoRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/profile/notifications', notificationsRouter);
app.use('/api/v1/addresses', addressesRouter);
app.use('/api/v1/notifications', realtimeNotificationsRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/test', resetRouter);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
