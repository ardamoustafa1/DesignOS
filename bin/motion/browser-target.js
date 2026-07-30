'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');

async function serveTarget(target, cwd = process.cwd()) {
  if (/^https?:\/\//i.test(target)) return { url: target, close: async () => {} };
  const file = path.resolve(cwd, target);
  if (!fs.existsSync(file)) throw new Error(`Motion target not found: ${target}`);
  const root = path.dirname(file);
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    const requested = pathname === '/' ? `/${path.basename(file)}` : pathname;
    const resolved = path.resolve(root, `.${requested}`);
    if (!resolved.startsWith(`${root}${path.sep}`) && resolved !== file) {
      response.statusCode = 403;
      return response.end('forbidden');
    }
    if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
      response.statusCode = 404;
      return response.end('not found');
    }
    const types = {
      '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
      '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
    };
    response.setHeader('content-type', types[path.extname(resolved)] || 'application/octet-stream');
    fs.createReadStream(resolved).pipe(response);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  return {
    url: `http://127.0.0.1:${address.port}/${path.basename(file)}`,
    close: () => new Promise(resolve => server.close(resolve)),
  };
}

module.exports = { serveTarget };
