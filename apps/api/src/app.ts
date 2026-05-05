import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import compression from 'compression';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './config/db.js';
import { getRedis, redisHealthy } from './config/redis.js';
import authRoutes from './modules/auth/auth.routes.js';
import crudRoutes from './modules/crud/crud.routes.js';
import uploadRoutes from './modules/upload/upload.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Static Assets ---
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- Correlation ID Middleware ---
app.use((req: Request, res: Response, next: NextFunction) => {
  const correlationId = req.headers['x-correlation-id'] || uuidv4();
  req.headers['x-correlation-id'] = correlationId;
  res.setHeader('x-correlation-id', correlationId as string);
  next();
});

// --- Security Middleware ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://picsum.photos", "https://*.googleusercontent.com"],
      connectSrc: ["'self'", "https://*.googleapis.com", "https://api.weatherapi.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json({ limit: '5mb' }));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id'],
  credentials: true,
}));

app.use('/api/auth', authRoutes);
app.use('/api/users', authRoutes); // Backwards compatibility for signup
app.use('/api', crudRoutes);
app.use('/api', uploadRoutes);

// Health Check
app.get('/api/health', async (req: Request, res: Response) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    db: 'down',
    redis: 'down'
  };

  try {
    await db.raw('SELECT 1');
    health.db = 'up';
  } catch (e) {}

  try {
    const client = getRedis();
    await client.ping();
    health.redis = 'up';
  } catch (e) {}

  res.status(health.db === 'up' && health.redis === 'up' ? 200 : 503).json(health);
});

// Static Assets (Standard Express)
export const setupStatic = (app: any) => {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, '../../web/dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }
};

export default app;
