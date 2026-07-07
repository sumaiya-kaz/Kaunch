import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import lunchRoutes from './routes/lunchRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import fineRoutes from './routes/fineRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import { sendDailyReminders } from './services/notificationService.js';
import { scheduleCutoffJobs } from './services/cronScheduler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { loadCutoffTime, getCutoffTime, formatCutoffDisplay } from './utils/cutoffTime.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/lunch', lunchRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Kaunch Backend is running' });
});

// Error handler
app.use(errorHandler);

// Scheduled Jobs
// Daily reminder at 10:00 AM
cron.schedule('0 10 * * *', async () => {
  console.log('Running daily reminder job at 10:00 AM');
  await sendDailyReminders();
}, {
  timezone: process.env.TIMEZONE || 'Asia/Dhaka'
});

// Start server
async function startServer() {
  await loadCutoffTime();
  scheduleCutoffJobs();

  app.listen(PORT, () => {
    console.log(`🚀 Kaunch Backend server running on port ${PORT}`);
    console.log(`📧 Email notifications: ${process.env.EMAIL_USER ? 'Enabled' : 'Disabled'}`);
    console.log(`⏰ Cutoff time: ${formatCutoffDisplay()} (${getCutoffTime()})`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
