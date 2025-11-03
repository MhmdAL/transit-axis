import express, { Express } from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import config from '@/config/config';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';
import { vehicleTracking } from '@/services/vehicleTracking';
import { subscriptionManager } from '@/services/subscriptionManager';
import { routeSubscriptionManager } from '@/services/routeSubscriptionManager';
import { telemetryBatcher } from '@/services/telemetryBatcher';
import { cacheService } from '@/services/cacheService';
import { VehicleTelemetry, SocketEvents, TripEvent } from '@/types';

// Import routes
import healthRoutes from '@/routes/health';
import statsRoutes from '@/routes/stats';

const app: Express = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingInterval: config.socketIO.pingInterval,
  pingTimeout: config.socketIO.pingTimeout,
  maxHttpBufferSize: config.socketIO.maxHttpBufferSize,
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Configuration endpoint
app.get('/config', (req, res) => {
  res.status(200).json({
    environment: config.nodeEnv,
    port: config.port,
    batchIntervalMs: config.batchIntervalMs,
    batchMaxSize: config.batchMaxSize,
    socketIO: {
      pingInterval: config.socketIO.pingInterval,
      pingTimeout: config.socketIO.pingTimeout,
      maxHttpBufferSize: config.socketIO.maxHttpBufferSize,
    },
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/health', healthRoutes);
app.use('/stats', statsRoutes);

/**
 * Telemetry API Endpoint
 * Receive telemetry from external services (e.g., telemetry-service)
 */
app.post('/api/telemetry', (req, res) => {
  try {
    const telemetry = req.body as VehicleTelemetry;

    // Validate required fields
    if (!telemetry.vehicleId || telemetry.latitude == null || telemetry.longitude == null) {
      return res.status(400).json({
        success: false,
        message: 'vehicleId, latitude, and longitude are required',
      });
    }

    // Add telemetry to batcher
    telemetryBatcher.addTelemetry(telemetry);

    // logger.debug(`Received telemetry for vehicle ${telemetry.vehicleId}`, {
    //   lat: telemetry.latitude,
    //   lon: telemetry.longitude,
    //   speed: telemetry.speed,
    // });

    return res.status(201).json({
      success: true,
      message: 'Telemetry received',
      data: telemetry,
    });
  } catch (error) {
    logger.error('Error receiving telemetry:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process telemetry',
    });
  }
});

/**
 * Trip Event API Endpoint
 * Receive trip start/end events from tripController
 */
app.post('/api/trip-events', (req, res) => {
  try {
    const tripEvent = req.body as TripEvent;
    logger.debug(`Received trip event: ${tripEvent.eventType} for trip ${tripEvent.id} on route ${tripEvent.routeId}`);

    // Validate required fields
    if (!tripEvent.id || !tripEvent.routeId || !tripEvent.eventType) {
      return res.status(400).json({
        success: false,
        message: 'Trip event must include id, routeId, and eventType',
      });
    }


    // Get subscribers for this route
    const subscribers = routeSubscriptionManager.getSubscribers(tripEvent.routeId);

    if (subscribers.size === 0) {
      logger.debug(`No subscribers for route ${tripEvent.routeId}`);
      return res.status(200).json({
        success: true,
        message: 'Trip event received but no subscribers',
      });
    }

    // Emit to all subscribers
    for (const socketId of subscribers) {
      io.to(socketId).emit(tripEvent.eventType, tripEvent as SocketEvents.TripEventPayload);
      logger.debug(`Emitted ${tripEvent.eventType} to client ${socketId}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Trip event broadcasted',
      subscribersNotified: subscribers.size,
    });
  } catch (error) {
    logger.error('Error processing trip event:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process trip event',
    });
  }
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Configure telemetry batcher with environment settings
 */
telemetryBatcher.setBatchInterval(5000);
logger.info(`TelemetryBatcher configured with ${config.batchIntervalMs}ms interval`);

/**
 * Socket.IO Event Handlers
 */

// Set batch emission callback
// Each batch contains latest points from multiple vehicles
vehicleTracking.setOnBatchEmission((batch) => {
  // Group vehicles by client for efficient emission
  // Map of socketId -> VehicleTelemetry[]
  const clientBatches: Map<string, VehicleTelemetry[]> = new Map();

  // For each vehicle in the batch
  for (const dataPoint of batch.dataPoints) {
    // Get all clients subscribed to this vehicle
    const subscribers = subscriptionManager.getSubscribers(dataPoint.vehicleId);

    if (subscribers.size === 0) {
      logger.debug(`No subscribers for vehicle ${dataPoint.vehicleId}, skipping`);
      continue;
    }

    // Add this vehicle to each subscriber's batch
    for (const socketId of subscribers) {
      if (!clientBatches.has(socketId)) {
        clientBatches.set(socketId, []);
      }
      clientBatches.get(socketId)!.push(dataPoint);
    }
  }

  // Emit one optimized batch per client
  for (const [socketId, dataPoints] of clientBatches.entries()) {
    io.to(socketId).emit('vehicle:telemetry:batch', {
      batchId: batch.batchId,
      timestamp: batch.timestamp,
      dataPoints,  // All subscribed vehicles in one array
      count: dataPoints.length,
    } as SocketEvents.TelemetryBatchPayload);

    logger.debug(`Sent batch to client ${socketId} with ${dataPoints.length} vehicles`);
  }

  logger.debug(`Batch distributed to ${clientBatches.size} clients`, {
    batchId: batch.batchId,
    vehiclesInBatch: batch.pointCount,
  });
});

io.on('connection', (socket: Socket) => {
  logger.info(`Client connected: ${socket.id}`);

  /**
   * Client subscribes to a vehicle
   */
  socket.on('subscribe:vehicle', (payload: SocketEvents.SubscribeVehiclePayload, callback) => {
    try {
      const { vehicleId } = payload;

      if (!vehicleId || typeof vehicleId !== 'string') {
        callback?.({
          success: false,
          error: 'Invalid vehicleId',
        });
        return;
      }

      const isNewSubscription = vehicleTracking.subscribeClient(vehicleId, socket.id);

      socket.emit('subscription:confirmed', {
        vehicleId,
        subscribedAt: Date.now(),
      } as SocketEvents.SubscriptionConfirmedPayload);

      callback?.({
        success: true,
        isNewSubscription,
      });

      logger.debug(`Client ${socket.id} subscribed to vehicle ${vehicleId}`);
    } catch (error) {
      logger.error('Error in subscribe handler', error);
      callback?.({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  /**
   * Client unsubscribes from a vehicle
   */
  socket.on('unsubscribe:vehicle', (payload: SocketEvents.UnsubscribeVehiclePayload, callback) => {
    try {
      const { vehicleId } = payload;

      if (!vehicleId || typeof vehicleId !== 'string') {
        callback?.({
          success: false,
          error: 'Invalid vehicleId',
        });
        return;
      }

      const wasSubscribed = vehicleTracking.unsubscribeClient(vehicleId, socket.id);

      if (wasSubscribed) {
        socket.emit('subscription:removed', {
          vehicleId,
        } as SocketEvents.SubscriptionRemovedPayload);
      }

      callback?.({
        success: true,
        wasSubscribed,
      });

      logger.debug(`Client ${socket.id} unsubscribed from vehicle ${vehicleId}`);
    } catch (error) {
      logger.error('Error in unsubscribe handler', error);
      callback?.({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  /**
   * Client subscribes to a route for trip events
   */
  socket.on('subscribe:route', (payload: SocketEvents.SubscribeRoutePayload, callback) => {
    try {
      console.log('Subscribing to route 1:', payload);
      const { routeId } = payload;

      if (!routeId || typeof routeId !== 'string') {
        callback?.({
          success: false,
          error: 'Invalid routeId',
        });
        return;
      }

      const isNewSubscription = routeSubscriptionManager.subscribe(routeId, socket.id);

      socket.emit('route:subscription:confirmed', {
        routeId,
        subscribedAt: Date.now(),
      } as SocketEvents.RouteSubscriptionConfirmedPayload);

      callback?.({
        success: true,
        isNewSubscription,
      });

      logger.debug(`Client ${socket.id} subscribed to route ${routeId}`);
    } catch (error) {
      logger.error('Error in route subscribe handler', error);
      callback?.({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  /**
   * Client unsubscribes from a route
   */
  socket.on('unsubscribe:route', (payload: SocketEvents.UnsubscribeRoutePayload, callback) => {
    try {
      const { routeId } = payload;

      if (!routeId || typeof routeId !== 'string') {
        callback?.({
          success: false,
          error: 'Invalid routeId',
        });
        return;
      }

      const wasSubscribed = routeSubscriptionManager.unsubscribe(routeId, socket.id);

      if (wasSubscribed) {
        socket.emit('route:subscription:removed', {
          routeId,
        } as SocketEvents.RouteSubscriptionRemovedPayload);
      }

      callback?.({
        success: true,
        wasSubscribed,
      });

      logger.debug(`Client ${socket.id} unsubscribed from route ${routeId}`);
    } catch (error) {
      logger.error('Error in route unsubscribe handler', error);
      callback?.({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  /**
   * Vehicle sends telemetry
   */
  socket.on('vehicle:telemetry', (payload: VehicleTelemetry) => {
    try {
      vehicleTracking.receiveTelemetry(payload);
    } catch (error) {
      logger.error('Error processing vehicle telemetry', error);
      socket.emit('error', {
        message: 'Error processing telemetry',
        code: 'TELEMETRY_PROCESSING_ERROR',
        timestamp: Date.now(),
      } as SocketEvents.ErrorPayload);
    }
  });

  /**
   * Client requests server statistics
   */
  socket.on('request:stats', (payload: SocketEvents.StatsRequestPayload | undefined, callback) => {
    try {
      const stats = vehicleTracking.getStats();

      const response: SocketEvents.StatsResponsePayload = {
        timestamp: Date.now(),
        connectedClients: io.engine.clientsCount,
        activeVehicles: stats.subscriptions.totalVehicles,
        totalSubscriptions: stats.subscriptions.totalSubscriptions,
        vehicleSubscriptions: stats.subscriptions.vehicleSubscriptions,
        telemetryBatches: {
          total: stats.batcher.totalBatches,
          pending: stats.batcher.pendingBatches,
        },
        uptime: process.uptime(),
      };

      callback?.(response);
    } catch (error) {
      logger.error('Error generating stats', error);
      callback?.({
        timestamp: Date.now(),
        connectedClients: 0,
        activeVehicles: 0,
        totalSubscriptions: 0,
        vehicleSubscriptions: {},
        telemetryBatches: { total: 0, pending: 0 },
        uptime: process.uptime(),
      });
    }
  });

  /**
   * Client disconnect handler
   */
  socket.on('disconnect', () => {
    const vehicleIds = vehicleTracking.removeClient(socket.id);
    const routeIds = routeSubscriptionManager.removeClient(socket.id);
    logger.info(`Client disconnected: ${socket.id} (vehicles: ${vehicleIds.length}, routes: ${routeIds.length})`);
  });

  /**
   * Error handler
   */
  socket.on('error', (error) => {
    logger.error(`Socket error for ${socket.id}`, error);
  });
});

/**
 * Graceful shutdown
 */
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  cacheService.shutdown();
  io.close();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down gracefully...');
  cacheService.shutdown();
  io.close();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Start server
const PORT = config.port || 3004;

// Initialize cache service before starting server
(async () => {
  try {
    await cacheService.initialize(config.moveoCore.baseUrl);
    logger.info('✅ Cache service initialized');
  } catch (error) {
    logger.error('Failed to initialize cache service', error);
    logger.warn('Proceeding with empty cache - on-demand loading will be used');
  }

  server.listen(PORT, () => {
    logger.info(`🚀 MoveoCC-API running on port ${PORT}`);
    logger.info(`📊 Server is ready for vehicle telemetry and client connections`);
    logger.info(`🔌 Socket.IO listening on http://localhost:${PORT}`);
    logger.info(`⚙️  Batch interval: ${config.batchIntervalMs}ms`);
    logger.info(`📋 Configuration available at http://localhost:${PORT}/config`);
    logger.info(`💾 Cache stats: ${JSON.stringify(cacheService.getStats())}`);
  });
})();

export default app;
