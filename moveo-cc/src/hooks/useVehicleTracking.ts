import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { VehicleTelemetry, BatchedTelemetry, ServerStats } from '@/types/index';

interface UseVehicleTrackingOptions {
  serverUrl?: string;
  autoConnect?: boolean;
}

export const useVehicleTracking = (options: UseVehicleTrackingOptions = {}) => {
  const {
    serverUrl = import.meta.env.VITE_VEHICLE_TRACKING_URL || 'http://localhost:3004',
    autoConnect = true,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Set<string>>(new Set());
  const [latestBatch, setLatestBatch] = useState<BatchedTelemetry | null>(null);
  const [serverStats, setServerStats] = useState<ServerStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Connect to vehicle tracking server
   */
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      console.warn('Already connected');
      return;
    }

    try {
      socketRef.current = io(serverUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to vehicle tracking server');
        setIsConnected(true);
        setError(null);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from vehicle tracking server');
        setIsConnected(false);
      });

      socketRef.current.on('subscription:confirmed', (data: { vehicleId: string; subscribedAt: number }) => {
        setSubscriptions((prev) => new Set([...prev, data.vehicleId]));
      });

      socketRef.current.on('subscription:removed', (data: { vehicleId: string }) => {
        setSubscriptions((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data.vehicleId);
          return newSet;
        });
      });

      socketRef.current.on('vehicle:telemetry:batch', (batch: BatchedTelemetry) => {
        console.log('Received telemetry batch:', batch);
        setLatestBatch(batch);
      });

      socketRef.current.on('error', (error: any) => {
        console.error('Socket.IO error:', error);
        setError(error.message || 'Connection error');
      });

      socketRef.current.on('connect_error', (error: any) => {
        console.error('Connection error:', error);
        setError(error.message || 'Failed to connect');
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect';
      console.error('Connection error:', err);
      setError(errorMsg);
    }
  }, [serverUrl]);

  /**
   * Disconnect from server
   */
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setSubscriptions(new Set());
    }
  }, []);

  /**
   * Subscribe to a vehicle
   */
  const subscribeVehicle = useCallback(
    (vehicleId: string) => {
      if (!socketRef.current?.connected) {
        setError('Not connected to server');
        return;
      }

      socketRef.current.emit('subscribe:vehicle', { vehicleId }, (response: any) => {
        if (!response.success) {
          setError(response.error || 'Failed to subscribe');
        }

        console.log('Subscribed to vehicle:', response);
      });
    },
    [],
  );

  /**
   * Unsubscribe from a vehicle
   */
  const unsubscribeVehicle = useCallback(
    (vehicleId: string) => {
      if (!socketRef.current?.connected) {
        setError('Not connected to server');
        return;
      }

      socketRef.current.emit('unsubscribe:vehicle', { vehicleId }, (response: any) => {
        if (!response.success) {
          setError(response.error || 'Failed to unsubscribe');
        }
      });
    },
    [],
  );

  /**
   * Send vehicle telemetry
   */
  const sendTelemetry = useCallback(
    (telemetry: VehicleTelemetry) => {
      if (!socketRef.current?.connected) {
        setError('Not connected to server');
        return;
      }

      socketRef.current.emit('vehicle:telemetry', telemetry);
    },
    [],
  );

  /**
   * Request server statistics
   */
  const requestStats = useCallback(
    (callback?: (stats: ServerStats) => void) => {
      if (!socketRef.current?.connected) {
        setError('Not connected to server');
        return;
      }

      socketRef.current.emit('request:stats', {}, (stats: ServerStats) => {
        setServerStats(stats);
        callback?.(stats);
      });
    },
    [],
  );

  /**
   * Auto-connect on mount if enabled
   */
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    subscriptions: Array.from(subscriptions),
    latestBatch,
    serverStats,
    error,
    connect,
    disconnect,
    subscribeVehicle,
    unsubscribeVehicle,
    sendTelemetry,
    requestStats,
  };
};

export default useVehicleTracking;
