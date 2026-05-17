import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { createReadStream, existsSync, statSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import { handleConnection } from './connectionHandler.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '3001', 10);
const STATIC_DIR = join(__dirname, '../../client/dist');

const MIME: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

const httpServer = createServer((req, res) => {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  let filePath = join(STATIC_DIR, url.pathname === '/' ? 'index.html' : url.pathname);

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    filePath = join(STATIC_DIR, 'index.html');
  }

  const mime = MIME[extname(filePath)] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': mime });
  createReadStream(filePath).pipe(res);
});

const wss = new WebSocketServer({ server: httpServer });
wss.on('connection', (ws) => {
  handleConnection(ws);
});

httpServer.listen(PORT, () => {
  console.log(`Color Battle running on port ${PORT}`);
});
