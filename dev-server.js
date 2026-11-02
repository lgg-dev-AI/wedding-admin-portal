const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 5178;
const BASE_DIR = __dirname;

// Load environment variables from .env.local if present
const envLocalPath = path.join(BASE_DIR, '.env.local');
if (fs.existsSync(envLocalPath)) {
    const envLines = fs.readFileSync(envLocalPath, 'utf8').split('\n');
    envLines.forEach(line => {
        const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (m) {
            const key = m[1];
            let val = (m[2] || '').trim();
            if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
            if (!process.env[key]) process.env[key] = val;
        }
    });
}

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    // 1. API Route Execution (Vercel Serverless Function Simulator)
    if (pathname.startsWith('/api/')) {
        const endpoint = pathname.replace('/api/', '').split('?')[0];
        const apiFile = path.join(BASE_DIR, 'api', `${endpoint}.js`);

        if (fs.existsSync(apiFile)) {
            let bodyData = '';
            req.on('data', chunk => bodyData += chunk);
            req.on('end', async () => {
                try {
                    req.query = parsedUrl.query;
                    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
                        try { req.body = JSON.parse(bodyData); } catch (e) { req.body = bodyData; }
                    } else {
                        req.body = bodyData;
                    }

                    // Mock Vercel response helper methods
                    res.status = (code) => { res.statusCode = code; return res; };
                    res.json = (data) => {
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(data));
                        return res;
                    };
                    res.send = (data) => { res.end(data); return res; };

                    // Delete require cache for live reload of APIs during dev
                    delete require.cache[require.resolve(apiFile)];
                    const handler = require(apiFile);
                    await handler(req, res);
                } catch (err) {
                    console.error(`[API Error in ${endpoint}]:`, err);
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: err.message }));
                }
            });
            return;
        } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: `Endpoint ${endpoint} not found` }));
            return;
        }
    }

    // 2. Static File Serving
    if (pathname === '/') pathname = '/index.html';
    const filePath = path.join(BASE_DIR, pathname);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
    } else {
        // Fallback for SPA routing if needed
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`🚀 [PaseBoda Staging Dev] Servidor local de pruebas corriendo en: http://localhost:${PORT}`);
    console.log(`   - Branch activa: staging-5178`);
    console.log(`   - Producción intacta: https://paseboda.com`);
});
