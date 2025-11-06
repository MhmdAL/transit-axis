import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import { config } from './config/config';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
// Import BigInt serializer globally
import './utils/bigIntSerializer';

// Import routes
import authRoutes from './routes/auth';
import vehicleRoutes from './routes/vehicles';
import driverRoutes from './routes/drivers';
import routeRoutes from './routes/routes';
import stopRoutes from './routes/stops';
import vehicleModelRoutes from './routes/vehicleModels';
import tripRoutes from './routes/trips';
import trackingRoutes from './routes/tracking';
import serviceScheduleRoutes from './routes/serviceSchedules';
import dutyRoutes from './routes/duties';
import incidentRoutes from './routes/incidents';
import vehicleMessageRoutes from './routes/vehicleMessages';

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/vehicle-models', vehicleModelRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/stops', stopRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/service-schedules', serviceScheduleRoutes);
app.use('/api/duties', dutyRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/vehicle-messages', vehicleMessageRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

const PORT = config.port || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Fleet Management API running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}${config.apiDocsPath}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});

export default app;
