const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const root = __dirname;
const port = process.env.PORT || 5173;

const mime = {
  '.html':'text/html; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.js':'application/javascript; charset=utf-8',
  '.mjs':'application/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.svg':'image/svg+xml; charset=utf-8',
  '.ico':'image/x-icon',
  '.png':'image/png',
  '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg',
  '.gif':'image/gif',
  '.webp':'image/webp',
  '.map':'application/json; charset=utf-8',
  '.woff':'font/woff',
  '.woff2':'font/woff2',
  '.ttf':'font/ttf',
  '.otf':'font/otf',
  '.mp3':'audio/mpeg',
  '.wav':'audio/wav'
};

const server = http.createServer((req, res) => {
  try{
    const parsed = url.parse(req.url);
    let pathname = decodeURI(parsed.pathname || '/');

    if (pathname === '/') pathname = '/index.html';

    const filePath = path.join(root, pathname);
    const normalized = path.normalize(filePath);

    if (!normalized.startsWith(root)) {
      res.writeHead(403); res.end('Forbidden'); return;
    }

    fs.stat(normalized, (err, stat) => {
      if (err || !stat.isFile()) {
        // Fallback: try index.html for SPA routes
        const fallback = path.join(root, 'index.html');
        fs.readFile(fallback, (e2, data2) => {
          if (e2) { res.writeHead(404); res.end('Not Found'); return; }
          res.writeHead(200, {'Content-Type': mime['.html']});
          res.end(data2);
        });
        return;
      }

      const ext = path.extname(normalized).toLowerCase();
      const type = mime[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
      const stream = fs.createReadStream(normalized);
      stream.pipe(res);
      stream.on('error', ()=>{ res.end(); });
    });
  }catch(e){
    res.writeHead(500); res.end('Server Error');
  }
});

server.listen(port, () => {
  const url = `http://localhost:${port}/`;
  console.log(`Static server running at ${url}`);
});