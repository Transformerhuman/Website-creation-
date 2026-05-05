import app, { setupStatic } from './app.js';
import db from './config/db.js';
import { initDatabase } from './config/init-db.js';

const PORT = Number(process.env.PORT) || 3000;

async function bootstrap() {
  await initDatabase();
  setupStatic(app);

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 API active on port ${PORT}`);
  });

  process.on('SIGTERM', () => {
    server.close(async () => {
      await db.destroy();
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    server.close(async () => {
      await db.destroy();
      process.exit(0);
    });
  });
}

bootstrap();
