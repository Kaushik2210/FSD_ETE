import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import ideaRoutes from './routes/ideaRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Allow the configured CLIENT_URL plus any Vercel preview/production
// subdomain (vercel.app), so preview deployments of the frontend keep
// working without a redeploy of the backend every time Vercel assigns a
// new preview URL. Falls back to localhost for local development.
const allowedOrigin = (origin, callback) => {
  const allowList = [process.env.CLIENT_URL, 'http://localhost:5173'].filter(Boolean);
  const isVercelPreview = origin && /\.vercel\.app$/.test(new URL(origin).hostname);
  if (!origin || allowList.includes(origin) || isVercelPreview) return callback(null, true);
  callback(new Error('Not allowed by CORS'));
};

app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json({ limit: '10kb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.status(200).json({ success: true, message: 'API is healthy' }));

app.use('/api/auth', authRoutes);
app.use('/api/ideas', ideaRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
