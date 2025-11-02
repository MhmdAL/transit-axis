import express from 'express';
import cors from 'cors';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import telemetryRoutes from './routes/telemetry';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'telemetry-service' });
});

// Routes
app.use('/api/telemetry', telemetryRoutes);

// Error handler
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`TelemetryService running on port ${config.port}`);
});

export default app;

