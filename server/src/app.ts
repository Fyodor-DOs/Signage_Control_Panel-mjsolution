import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

import authRouter from './routes/auth';
import devicesRouter from './routes/devices';
import contentsRouter from './routes/contents';

const app = express();

// ----------------------------------------------------------------
// Middleware
// ----------------------------------------------------------------
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  }),
);
app.use(express.json());

// ----------------------------------------------------------------
// Routes
// ----------------------------------------------------------------
app.use('/api/auth', authRouter);
app.use('/api/devices', devicesRouter);
app.use('/api/contents', contentsRouter);

// ----------------------------------------------------------------
// 404 handler
// ----------------------------------------------------------------
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// ----------------------------------------------------------------
// Global error handler
// ----------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[App] Unhandled error:', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

export default app;
