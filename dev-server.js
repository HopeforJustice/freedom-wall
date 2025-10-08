#!/usr/bin/env node

// Simple development server to run our API endpoints locally
import { neon } from '@neondatabase/serverless';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import http from 'http';
import url from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env.local') });

// Simulate Vercel serverless function environment
function simulateVercelHandler(handlerModule) {
  return async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    try {
      const parsedUrl = new URL(req.url, `http://localhost:3001`);
      
      // Handle POST requests with body
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', async () => {
          try {
            const vercelReq = {
              method: req.method,
              url: req.url,
              query: Object.fromEntries(parsedUrl.searchParams),
              body: body ? JSON.parse(body) : null
            };

            const vercelRes = {
              status: (code) => {
                res.statusCode = code;
                return vercelRes;
              },
              json: (data) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              }
            };

            await handlerModule.default(vercelReq, vercelRes);
          } catch (error) {
            console.error('API Error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Internal server error', details: error.message }));
          }
        });
      } else {
        // Handle GET requests immediately
        const vercelReq = {
          method: req.method,
          url: req.url,
          query: Object.fromEntries(parsedUrl.searchParams),
          body: null
        };

        const vercelRes = {
          status: (code) => {
            res.statusCode = code;
            return vercelRes;
          },
          json: (data) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          }
        };

        await handlerModule.default(vercelReq, vercelRes);
      }
    } catch (error) {
      console.error('Handler Error:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Internal server error', details: error.message }));
    }
  };
}

// Start server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  try {
    // Route to different API endpoints
    if (pathname === '/api/setup-db') {
      const setupDb = await import('./api/setup-db.js');
      await simulateVercelHandler(setupDb)(req, res);
    } else if (pathname === '/api/seed-db') {
      const seedDb = await import('./api/seed-db.js');
      await simulateVercelHandler(seedDb)(req, res);
    } else if (pathname === '/api/locks') {
      const locks = await import('./api/locks.js');
      await simulateVercelHandler(locks)(req, res);
    } else if (pathname.startsWith('/api/lock')) {
      // Extract ID from path like /api/lock?id=123
      req.query = parsedUrl.query;
      const lock = await import('./api/lock.js');
      await simulateVercelHandler(lock)(req, res);
    } else if (pathname === '/api/stories') {
      const stories = await import('./api/stories.js');
      await simulateVercelHandler(stories)(req, res);
    } else if (pathname === '/api/admin/locks') {
      const adminLocks = await import('./api/admin/locks.js');
      await simulateVercelHandler(adminLocks)(req, res);
    } else if (pathname === '/api/admin/stories') {
      const adminStories = await import('./api/admin/stories.js');
      await simulateVercelHandler(adminStories)(req, res);
    } else {
      res.statusCode = 404;
      res.end('Not found');
    }
  } catch (error) {
    console.error('Server Error:', error);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Development API server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST /api/setup-db         - Set up database tables');
  console.log('  POST /api/seed-db          - Seed database with data');
  console.log('  GET  /api/locks            - Get all locks');
  console.log('  GET  /api/lock?id=123      - Get specific lock');
  console.log('  GET  /api/stories          - Get all story locks');
  console.log('');
  console.log('Admin endpoints:');
  console.log('  GET/POST/PUT/DELETE /api/admin/locks   - Manage locks');
  console.log('  GET/POST/PUT/DELETE /api/admin/stories - Manage stories');
  console.log('');
  console.log('Admin interface: http://localhost:5173/admin/ (after running npm run dev)');
});
