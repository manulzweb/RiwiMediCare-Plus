// app/src/types/express.d.ts

import { AccessTokenPayload } from './auth.types.js';

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export {};
