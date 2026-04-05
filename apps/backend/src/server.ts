import 'dotenv/config';
import app from './app.js';
import { wsServer } from './ws/wsServer.js';
import { seedDefaultFlags } from '@services/featureFlags.service.js';
import { startScheduler } from '@services/scheduler.service.js';

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
  // Seed default feature flags
  seedDefaultFlags().catch(err => {
    // eslint-disable-next-line no-console
    console.error('Failed to seed feature flags:', err);
  });
  // Start notification scheduler if enabled
  startScheduler().catch(err => {
    // eslint-disable-next-line no-console
    console.error('Failed to start notification scheduler:', err);
  });
});

wsServer.init(server);
