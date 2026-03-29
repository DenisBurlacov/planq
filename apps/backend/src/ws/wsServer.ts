import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage, Server } from 'node:http';
import { wsAuth } from './wsAuth.js';
import logger from '@utils/logger.js';

class WsServer {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, Set<WebSocket>> = new Map();

  init(server: Server): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      const host = req.headers.host ?? 'localhost';
      const url = new URL(req.url ?? '', `http://${host}`);
      const token = url.searchParams.get('token') ?? '';

      const userId = wsAuth(token);
      if (!userId) {
        ws.close(4001, 'Unauthorized');
        return;
      }

      if (!this.clients.has(userId)) {
        this.clients.set(userId, new Set());
      }
      this.clients.get(userId)?.add(ws);

      logger.info({ message: 'WS client connected', userId });

      ws.on('close', () => {
        const sockets = this.clients.get(userId);
        sockets?.delete(ws);
        if (!sockets || sockets.size === 0) {
          this.clients.delete(userId);
        }
        logger.info({ message: 'WS client disconnected', userId });
      });

      ws.on('error', err => {
        logger.error({ message: 'WS client error', userId, error: err.message });
      });
    });

    logger.info({ message: 'WebSocket server initialized on /ws' });
  }

  sendToUser(userId: string, event: string, payload: unknown): void {
    const sockets = this.clients.get(userId);
    if (!sockets || sockets.size === 0) return;

    const message = JSON.stringify({ event, payload });
    for (const ws of sockets) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    }
  }

  getConnectedUserIds(): string[] {
    return Array.from(this.clients.keys());
  }
}

export const wsServer = new WsServer();
