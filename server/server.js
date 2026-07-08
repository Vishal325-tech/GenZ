import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { connectDB } from './config/db.js';
import { initDatabase } from './services/dbService.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import adminAuthRoutes from './routes/adminAuthRoutes.js';
import adminDashboardRoutes from './routes/adminDashboardRoutes.js';
import uiRoutes from './routes/uiRoutes.js';
import { runScheduler } from './controllers/storyController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploads Folder
const __dirname = path.resolve();
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Mount Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/ui', uiRoutes);

// Serve story uploads
app.use('/uploads/stories', express.static(path.join(__dirname, 'uploads', 'stories')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'running', timestamp: new Date() });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// Bootup routine
async function startServer() {
  // Connect to DB (Mongo / fallbacks automatically logged)
  await connectDB();
  
  // Seed database
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 Gajanana Server floating on port ${PORT}`);
    
    // Story auto-publish & auto-expire scheduler (runs immediately + every 60s)
    runScheduler(); // Run immediately on boot to catch any pending stories
    setInterval(runScheduler, 60 * 1000);
    console.log('📅 Story scheduler started (immediate + 60s interval)');
  });
}

startServer();
