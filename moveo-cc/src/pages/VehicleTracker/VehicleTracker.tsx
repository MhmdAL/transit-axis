import { useState, useEffect } from 'react';
import { useVehicleTracking } from '@/hooks/useVehicleTracking';
import type { VehicleTelemetry } from '@/types/index';
import styles from './VehicleTracker.module.css';

export const VehicleTracker = () => {
  const {
    isConnected,
    subscriptions,
    latestBatch,
    serverStats,
    error,
    subscribeVehicle,
    unsubscribeVehicle,
    requestStats,
  } = useVehicleTracking();

  const [vehicleIdInput, setVehicleIdInput] = useState('truck_001');
  const [batchCount, setBatchCount] = useState(0);
  const [fleetNumber, setFleetNumber] = useState('fleet_001');

  // Track batch count when latestBatch changes
  useEffect(() => {
    if (latestBatch) {
      setBatchCount((prev) => prev + 1);
    }
  }, [latestBatch?.batchId]); // Only depend on batchId to avoid infinite loop

  const handleSubscribe = () => {
    if (vehicleIdInput.trim()) {
      subscribeVehicle(vehicleIdInput);
      setVehicleIdInput('');
    }
  };

  const handleUnsubscribe = (vehicleId: string) => {
    unsubscribeVehicle(vehicleId);
  };

  const handleGetStats = () => {
    requestStats();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🚗 Vehicle Live Tracking</h1>
        <p>Real-time fleet tracking powered by MoveoCC-API</p>
      </div>

      <div className={styles.grid}>
        {/* Connection Panel */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>📡 Connection Status</h2>
            <div className={`${styles.statusBadge} ${isConnected ? styles.connected : styles.disconnected}`}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.cardBody}>
            <div className={styles.stat}>
              <span className={styles.label}>Server Status:</span>
              <span className={styles.value}>{isConnected ? 'Ready' : 'Not Connected'}</span>
            </div>

            <div className={styles.stat}>
              <span className={styles.label}>Batches Received:</span>
              <span className={styles.value}>{batchCount}</span>
            </div>

            {serverStats && (
              <>
                <div className={styles.stat}>
                  <span className={styles.label}>Connected Clients:</span>
                  <span className={styles.value}>{serverStats.connectedClients}</span>
                </div>

                <div className={styles.stat}>
                  <span className={styles.label}>Active Vehicles:</span>
                  <span className={styles.value}>{serverStats.activeVehicles}</span>
                </div>

                <div className={styles.stat}>
                  <span className={styles.label}>Total Subscriptions:</span>
                  <span className={styles.value}>{serverStats.totalSubscriptions}</span>
                </div>

                <div className={styles.stat}>
                  <span className={styles.label}>Uptime:</span>
                  <span className={styles.value}>{(serverStats.uptime / 60).toFixed(2)}m</span>
                </div>
              </>
            )}

            <button
              className={styles.button}
              onClick={handleGetStats}
              disabled={!isConnected}
            >
              📊 Refresh Stats
            </button>
          </div>
        </div>

        {/* Subscription Panel */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>📍 Subscribe to Vehicles</h2>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="e.g., truck_001"
                value={vehicleIdInput}
                onChange={(e) => setVehicleIdInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubscribe()}
                disabled={!isConnected}
              />
              <button
                className={styles.button}
                onClick={handleSubscribe}
                disabled={!isConnected || !vehicleIdInput.trim()}
              >
                + Subscribe
              </button>
            </div>

            <div className={styles.subscriptionList}>
              {subscriptions.length === 0 ? (
                <p className={styles.empty}>No subscriptions yet</p>
              ) : (
                subscriptions.map((vehicleId: string) => (
                  <div key={vehicleId} className={styles.subscriptionItem}>
                    <span className={styles.vehicleId}>🚗 {vehicleId}</span>
                    <button
                      className={`${styles.button} ${styles.buttonSmall} ${styles.buttonDanger}`}
                      onClick={() => handleUnsubscribe(vehicleId)}
                    >
                      ✕ Unsubscribe
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Fleet Configuration Panel */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>🏭 Fleet Configuration</h2>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.stat}>
              <span className={styles.label}>Current Fleet Number:</span>
              <div style={{ marginTop: '8px' }}>
                <select
                  value={fleetNumber}
                  onChange={(e) => setFleetNumber(e.target.value)}
                  disabled={!isConnected}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    cursor: isConnected ? 'pointer' : 'not-allowed',
                    backgroundColor: isConnected ? '#fff' : '#f5f5f5',
                    color: isConnected ? '#000' : '#999',
                  }}
                >
                  <option value="fleet_001">Fleet 001 - Main</option>
                  <option value="fleet_002">Fleet 002 - Secondary</option>
                  <option value="fleet_003">Fleet 003 - Regional</option>
                  <option value="fleet_004">Fleet 004 - Express</option>
                  <option value="fleet_005">Fleet 005 - Custom</option>
                </select>
              </div>
            </div>

            <div className={styles.stat} style={{ marginTop: '16px' }}>
              <span className={styles.label}>Selected Fleet:</span>
              <span className={styles.value}>{fleetNumber}</span>
            </div>

            <div className={styles.stat} style={{ marginTop: '16px' }}>
              <span className={styles.label}>Info:</span>
              <p style={{ fontSize: '12px', color: '#666', margin: '8px 0 0 0' }}>
                Select a fleet number. Vehicles within this fleet will be receiving telemetry data when you send them through the system.
              </p>
            </div>
          </div>
        </div>

        {/* Latest Telemetry Panel */}
        <div className={`${styles.card} ${styles.cardWide}`}>
          <div className={styles.cardHeader}>
            <h2>📦 Latest Telemetry Data</h2>
            {latestBatch && (
              <span className={styles.batchId}>Batch: {latestBatch.batchId.slice(0, 20)}...</span>
            )}
          </div>

          <div className={styles.cardBody}>
            {!latestBatch || latestBatch.count === 0 ? (
              <p className={styles.empty}>Waiting for telemetry data...</p>
            ) : (
              <div className={styles.telemetryGrid}>
                {latestBatch.dataPoints.map((point: VehicleTelemetry, idx: number) => (
                  <div key={`${point.vehicleId}-${idx}`} className={styles.telemetryCard}>
                    <div className={styles.telemetryHeader}>
                      <h3>🚗 {point.vehicleId}</h3>
                      <span className={styles.timestamp}>
                        {new Date(point.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className={styles.telemetryData}>
                      <div className={styles.dataRow}>
                        <span className={styles.dataLabel}>📍 Position:</span>
                        <span className={styles.dataValue}>
                          {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                        </span>
                      </div>

                      <div className={styles.dataRow}>
                        <span className={styles.dataLabel}>💨 Speed:</span>
                        <span className={styles.dataValue}>{point.speed.toFixed(1)} km/h</span>
                      </div>

                      <div className={styles.dataRow}>
                        <span className={styles.dataLabel}>🧭 Bearing:</span>
                        <span className={styles.dataValue}>{point.bearing.toFixed(0)}°</span>
                      </div>

                      {point.altitude && (
                        <div className={styles.dataRow}>
                          <span className={styles.dataLabel}>⬆️ Altitude:</span>
                          <span className={styles.dataValue}>{point.altitude.toFixed(0)}m</span>
                        </div>
                      )}

                      {point.accuracy && (
                        <div className={styles.dataRow}>
                          <span className={styles.dataLabel}>📐 Accuracy:</span>
                          <span className={styles.dataValue}>{point.accuracy.toFixed(0)}m</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleTracker;
