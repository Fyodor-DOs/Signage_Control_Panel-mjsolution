import 'dotenv/config';
import http from 'http';
import app from './app';
import { initWsServer, resetAllDevicesOffline } from './websocket/wsServer';

const PORT = parseInt(process.env.PORT ?? '4000', 10);

const httpServer = http.createServer(app);

// Reset all device statuses to offline on fresh start
resetAllDevicesOffline().then(() => {
  // Attach the WebSocket server to the HTTP server
  initWsServer(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`[Server] HTTP + WebSocket server listening on port ${PORT}`);
  });
});
