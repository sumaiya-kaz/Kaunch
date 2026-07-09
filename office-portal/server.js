import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT) || 8080;
const KAUNCH_FRONTEND_URL = process.env.KAUNCH_FRONTEND_URL || 'http://localhost:3000';
const KAUNCH_API_URL = process.env.KAUNCH_API_URL || 'http://localhost:5000';
const ATTENDA_FRONTEND_URL = process.env.ATTENDA_FRONTEND_URL || 'http://localhost:5173';
const ATTENDA_API_URL = process.env.ATTENDA_API_URL || 'http://localhost:5280';

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use(
  '/lunch/api',
  createProxyMiddleware({
    target: KAUNCH_API_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api${path}`,
  })
);

app.use(
  '/attendance/api',
  createProxyMiddleware({
    target: ATTENDA_API_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api${path}`,
  })
);

app.use(
  '/attendance/health',
  createProxyMiddleware({
    target: ATTENDA_API_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/health${path}`,
  })
);

const mountFrontendProxy = (mountPath, target) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    ws: true,
    pathRewrite: (path) => `${mountPath}${path}`,
  });

app.use('/lunch', mountFrontendProxy('/lunch', KAUNCH_FRONTEND_URL));
app.use('/attendance', mountFrontendProxy('/attendance', ATTENDA_FRONTEND_URL));

app.get('/lunch', (_req, res) => res.redirect('/lunch/'));
app.get('/attendance', (_req, res) => res.redirect('/attendance/'));

app.listen(PORT, () => {
  console.log(`Office portal running at http://localhost:${PORT}`);
  console.log(`  Lunch (Kaunch):    http://localhost:${PORT}/lunch/`);
  console.log(`  Attendance:        http://localhost:${PORT}/attendance/`);
});
