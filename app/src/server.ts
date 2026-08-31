// app/src/server.ts
// Express configuration for auth template

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';
import cors from 'cors';
import { corsOptions } from './config/cors.js';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { envConfig } from './config/env.js';
import router from './routes/index.js';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  rateLimit({
    windowMs: envConfig.RATE_LIMIT.WINDOW_MS,
    max: envConfig.RATE_LIMIT.MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use(cors(corsOptions));

app.use('/api/v1', router);

// Swagger docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 fallback
app.use((_req, res) => res.status(404).json({ message: 'Not found' }));

export default app;
