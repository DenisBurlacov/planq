import 'dotenv/config';
import app from './app.js';
import { wsServer } from './ws/wsServer.js';

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});

wsServer.init(server);
