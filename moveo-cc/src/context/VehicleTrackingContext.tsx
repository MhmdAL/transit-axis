import React, { createContext, useContext } from 'react';
import { useVehicleTracking } from '../hooks/useVehicleTracking';
import type { BatchedTelemetry, ServerStats, VehicleTelemetry } from '@/types';

interface VehicleTrackingContextType {
  isConnected: boolean;
  subscriptions: string[];
  latestBatch: BatchedTelemetry | null;
  serverStats: ServerStats | null;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  subscribeVehicle: (vehicleId: string) => void;
  unsubscribeVehicle: (vehicleId: string) => void;
  subscribeRoute: (routeId: string) => void;
  unsubscribeRoute: (routeId: string) => void;
  onTripEvent: (eventType: 'trip:start' | 'trip:end', callback: (event: any) => void) => void;
  offTripEvent: (eventType: 'trip:start' | 'trip:end', callback: (event: any) => void) => void;
  onVehicleTelemetry: (callback: (telemetry: VehicleTelemetry) => void) => void;
  offVehicleTelemetry: (callback: (telemetry: VehicleTelemetry) => void) => void;
  sendTelemetry: (telemetry: any) => void;
  requestStats: (callback?: (stats: ServerStats) => void) => void;
  onVehicleMessage: (callback: (message: any) => void) => void;
  offVehicleMessage: (callback: (message: any) => void) => void;
}

const VehicleTrackingContext = createContext<VehicleTrackingContextType | undefined>(undefined);

interface VehicleTrackingProviderProps {
  children: React.ReactNode;
}

/**
 * Provider that establishes SignalR connection on app load
 * Makes vehicle tracking available globally without needing useVehicleTracking hook
 */
export const VehicleTrackingProvider: React.FC<VehicleTrackingProviderProps> = ({ children }) => {
  const tracking = useVehicleTracking({
    autoConnect: true, // Connect automatically on app load
  }) as VehicleTrackingContextType;

  return (
    <VehicleTrackingContext.Provider value={tracking}>
      {children}
    </VehicleTrackingContext.Provider>
  );
};

/**
 * Hook to use global vehicle tracking context
 * Use this instead of useVehicleTracking to get the global connection
 */
export const useGlobalVehicleTracking = (): VehicleTrackingContextType => {
  const context = useContext(VehicleTrackingContext);
  if (context === undefined) {
    throw new Error('useGlobalVehicleTracking must be used within VehicleTrackingProvider');
  }
  return context;
};

export default VehicleTrackingContext;
