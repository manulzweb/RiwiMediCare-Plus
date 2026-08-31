// app/src/index.ts
// Auth template entrypoint

import app from './server.js';
import sequelize from './config/database.js';
import './models/index.js';
import { envConfig } from './config/env.js';

const PORT = envConfig.PORT;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established...');

    await sequelize.sync({ alter: true });

    // Optional seed: uncomment and create app/src/seed/seed.ts
    // await runSeed();

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
      console.log(`Docs available at http://localhost:${PORT}/api/docs`);
    });
  } catch (error) {
    console.error('Error starting the app:', error);
    process.exit(1);
  }
};

start();
