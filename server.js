import express from 'express';
import cors from 'cors';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { APP_VERSION, SEMVER_INFO } from './config/version.js';

const PORT = process.env.PORT || 8410;
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// SemVer & Request Logger Middleware
app.use((req, res, next) => {
  res.setHeader('X-Api-Version', APP_VERSION);
  console.log(`[${new Date().toISOString()}] [v${APP_VERSION}] ${req.method} ${req.url}`);
  next();
});

// Root Information
app.get('/', (req, res) => {
  res.json({
    name: 'IrengCloud Universal API',
    semver: SEMVER_INFO,
    status: 'online',
    documentation: 'https://apiku.irengcloud.com',
    modules: {
      hadits: '/api/v1/hadits',
      instagram: '/api/v1/instagram?url={link_ig}',
    },
  });
});

// Register All V1 API Routes
app.use('/api/v1', apiRouter);

// Compatibility fallback for legacy /api/hadits
app.use('/api/hadits', (req, res) => {
  res.redirect(301, `/api/v1/hadits${req.url}`);
});

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 IrengCloud Universal API (v${APP_VERSION}) berjalan di port ${PORT}`);
});
