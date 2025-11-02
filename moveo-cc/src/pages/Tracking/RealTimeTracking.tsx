import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MapContainer, TileLayer, Polyline, useMap, Marker, Popup } from 'react-leaflet';
import { useLocation } from 'react-router-dom';
import polyline from '@mapbox/polyline';
import L from 'leaflet';
import { theme } from '../../styles/theme';
import Sidebar from '../../components/Sidebar/Sidebar';
import { useVehicleTracking } from '@/hooks/useVehicleTracking';
import AddVehiclesModal from './AddVehiclesModal';
import AddRoutesModal from './AddRoutesModal';
import 'leaflet/dist/leaflet.css';
import type { VehicleTelemetry } from '@/types';

const PageContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: ${theme.colors.background};
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
`;

const MapWrapper = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;

  .leaflet-container {
    height: 100%;
    width: 100%;
    background: ${theme.colors.surface};
  }
`;

const TrackingPanel = styled.div`
  width: 350px;
  background: ${theme.colors.surface};
  border-left: 1px solid ${theme.colors.border};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
`;

const PanelHeader = styled.div`
  padding: 18px 18px;
  background: linear-gradient(180deg, #1a1f35 0%, #0f172a 100%);
  color: #f1f5f9;
  border-bottom: 1px solid rgba(30, 41, 59, 0.8);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

  h2 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.8px;
    color: #cbd5e1;
    text-transform: uppercase;
    text-align: center;
  }

  .status {
    font-size: 11px;
    font-weight: 500;
    opacity: 0.7;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    letter-spacing: 0.4px;
    color: #94a3b8;
    text-transform: uppercase;
    margin-top: 8px;
  }
`;

const PanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${theme.spacing.md};
`;

const ToggleButton = styled.button`
  position: absolute;
  top: ${theme.spacing.lg};
  left: ${theme.spacing.lg};
  z-index: 1000;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.textPrimary};
  box-shadow: ${theme.shadows.md};
  transition: all ${theme.transitions.fast};

  &:hover {
    background-color: ${theme.colors.surfaceHover};
    color: ${theme.colors.primary};
    box-shadow: ${theme.shadows.lg};
  }
`;

const VehicleList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-bottom: ${theme.spacing.md};
  max-height: 300px; /* Added max-height */
  overflow-y: auto; /* Added overflow-y */
`;

const VehicleTag = styled.div<{ hidden?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  color: #e2e8f0;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: normal;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(100, 150, 200, 0.2);
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: ${props => props.hidden ? 0.5 : 1};

  &:hover {
    background: linear-gradient(135deg, #334155, #1e293b);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
    transform: translateY(-2px);
  }

  .status-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #10b981;
    flex-shrink: 0;
  }

  .vehicle-info {
    flex: 1;
    overflow: hidden;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;

    .fleet-number {
      font-weight: 600;
      color: #fbbf24;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .details {
      font-size: 10px;
      color: #cbd5e1;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.2;
    }
  }

  button {
    background: rgba(255, 255, 255, 0.15);
    border: none;
    color: #cbd5e1;
    cursor: pointer;
    padding: 0;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    transition: all 0.2s ease;
    flex-shrink: 0;

    &:hover {
      background: rgba(239, 68, 68, 0.6);
      color: #fecaca;
    }
  }

  /* Tooltip */
  &::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #1f2937;
    color: #f3f4f6;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 400;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease;
    z-index: 1000;
    border: 1px solid #4b5563;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    margin-bottom: 8px;
    font-family: monospace;
    letter-spacing: 0.3px;
  }

  &:hover::after {
    opacity: 1;
    visibility: visible;
  }
`;

const VehicleCount = styled.span`
  display: inline-block;
  background: ${theme.colors.primary};
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
`;

const RouteList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: ${theme.spacing.md};
`;

const RouteTag = styled(VehicleTag)`
  width: 100%;
  padding: 6px 10px;
  font-size: 11px;
  border-left: 4px solid; /* Added colored left border */
  
  .vehicle-info {
    gap: 0;
    
    .fleet-number {
      font-size: 11px;
    }
    
    .details {
      display: none;
    }
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${theme.colors.border};
  border-radius: 6px;
  background: ${theme.colors.surface};
  color: ${theme.colors.textPrimary};
  font-size: 12px;
  outline: none;
  transition: all 0.2s ease;
  margin-bottom: ${theme.spacing.md};

  &::placeholder {
    color: ${theme.colors.textMuted};
  }

  &:focus {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  &:hover {
    border-color: ${theme.colors.primaryHover};
  }
`;

// Custom vehicle marker icon with better styling
const createVehicleIcon = (bearing: number) => {
  const svgString = `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
        </filter>
      </defs>
      <g transform="rotate(${bearing} 20 20)" filter="url(#shadow)">
        <!-- Vehicle body -->
        <rect x="8" y="6" width="24" height="28" rx="4" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>
        <!-- Front windshield -->
        <polygon points="12,8 28,8 26,14 14,14" fill="#60a5fa" opacity="0.8"/>
        <!-- Rear window -->
        <rect x="12" y="22" width="16" height="6" rx="1" fill="#60a5fa" opacity="0.6"/>
        <!-- Door line -->
        <line x1="20" y1="14" x2="20" y2="26" stroke="#1e40af" stroke-width="1"/>
        <!-- Front indicator -->
        <circle cx="20" cy="4" r="2" fill="#fbbf24"/>
      </g>
    </svg>
  `;
  
  const encoded = encodeURIComponent(svgString);
  
  return L.icon({
    iconUrl: `data:image/svg+xml,${encoded}`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

// Component to fit map bounds to polyline
const FitBounds: React.FC<{ coordinates: [number, number][] }> = ({ coordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      map.fitBounds(coordinates, { padding: [50, 50] });
    }
  }, [coordinates, map]);

  return null;
};

interface VehicleSearchResponse {
  id: string;
  fleetNo: string;
  plateNo: string;
}

const RealTimeTracking: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const [pathCoordinates, setPathCoordinates] = useState<[number, number][]>([]);
  const { isConnected, latestBatch, subscribeVehicle, unsubscribeVehicle } = useVehicleTracking();
  const [vehicleLocations, setVehicleLocations] = useState<Record<string, VehicleTelemetry>>({});
  const [selectedFleets, setSelectedFleets] = useState<VehicleSearchResponse[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoutes, setSelectedRoutes] = useState<any[]>([]);
  const [isRoutesModalOpen, setIsRoutesModalOpen] = useState(false);
  const [routePaths, setRoutePaths] = useState<Record<string, Array<{ coordinates: [number, number][]; color: string }>>>({});
  const [routeStops, setRouteStops] = useState<Record<string, any[]>>({});
  const [vehicleSearchFilter, setVehicleSearchFilter] = useState('');
  const [hiddenVehicles, setHiddenVehicles] = useState<string[]>([]);

  // Default center (you can change this to your preferred location)
  const defaultCenter: [number, number] = [25.3548, 51.1839]; // Doha, Qatar
  const defaultZoom = 13;

  // Color palette for routes
  const routeColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899', '#6366f1'];
  
  const getRouteColor = (index: number) => {
    return routeColors[index % routeColors.length];
  };

  useEffect(() => {
    // Check if we have a polyline path from route state
    if (location.state && (location.state as any).polyline) {
      const encodedPath = (location.state as any).polyline;
      try {
        const decoded = polyline.decode(encodedPath);
        setPathCoordinates(decoded as [number, number][]);
      } catch (error) {
        console.error('Failed to decode polyline:', error);
      }
    }
  }, [location]);

  // Update vehicle locations from telemetry batches
  useEffect(() => {
    if (latestBatch && latestBatch.dataPoints) {
      setVehicleLocations((prev) => {
        const updated = { ...prev };
        for (const point of latestBatch.dataPoints) {
          updated[point.vehicleId] = {
            ...point,
            lastUpdate: new Date(),
          };
        }
        return updated;
      });
    }
  }, [latestBatch?.batchId]);

  // Fetch and decode route paths when selected routes change
  useEffect(() => {
    const fetchRoutePaths = async () => {
      try {
        const { apiService } = await import('@/services/apiService');
        const paths: Record<string, Array<{ coordinates: [number, number][]; color: string }>> = {};
        const stops: Record<string, any[]> = {};

        for (let i = 0; i < selectedRoutes.length; i++) {
          const route = selectedRoutes[i];
          const routeStops = await apiService.getRouteStops(route.id);
          const routePathSegments = [];
          const color = getRouteColor(i);

          // Store stops with color info
          stops[route.id] = routeStops.map(stop => ({
            ...stop,
            color: color
          }));

          // Decode each stop's path and collect segments
          for (const stop of routeStops) {
            if (stop.path) {
              try {
                const decodedPath = polyline.decode(stop.path) as [number, number][];
                routePathSegments.push({
                  coordinates: decodedPath,
                  color: color,
                });
              } catch (error) {
                console.error(`Failed to decode path for stop ${stop.id}:`, error);
              }
            }
          }

          paths[route.id] = routePathSegments;
        }

        setRoutePaths(paths);
        setRouteStops(stops);
      } catch (error) {
        console.error('Error fetching route paths:', error);
      }
    };

    if (selectedRoutes.length > 0) {
      fetchRoutePaths();
    } else {
      setRoutePaths({});
      setRouteStops({});
    }
  }, [selectedRoutes]);

  // Remove a vehicle
  const handleRemoveVehicle = (vehicle: VehicleSearchResponse) => {
    unsubscribeVehicle(vehicle.id);
    setSelectedFleets(selectedFleets.filter(v => v.id !== vehicle.id));
  };

  // Handle vehicles selected from modal
  const handleVehiclesSelected = (newFleets: VehicleSearchResponse[]) => {
    // Filter out vehicles that are already selected
    const uniqueFleets = newFleets.filter(
      fleet => !selectedFleets.some(selected => selected.id === fleet.id)
    );
    
    uniqueFleets.forEach(fleet => subscribeVehicle(fleet.id));

    const newSelectedFleets = [...selectedFleets, ...uniqueFleets];
    setSelectedFleets(newSelectedFleets);

    const fetchTelemetry = async () => {
      try {
        const { apiService } = await import('@/services/apiService');
        const vehicleIds = newSelectedFleets.map(fleet => fleet.id);
        const telemetry = await apiService.getVehiclesTelemetry(vehicleIds);
        console.log('telemetry', telemetry);

        setVehicleLocations((prev) => {
          const updated = { ...prev };
          telemetry.forEach((data: any) => {
            updated[data.vehicleId] = {
              ...data,
              lastUpdate: new Date(),
            };
          });
          return updated;
        });
      } catch (error) {
        console.error('Error fetching telemetry for selected vehicles:', error);
      }
    };
      
    fetchTelemetry();
  };

  // Handle routes selected from modal
  const handleRoutesSelected = (newRoutes: any[]) => {
    // Filter out routes that are already selected
    const uniqueRoutes = newRoutes.filter(
      route => !selectedRoutes.some(selected => selected.id === route.id)
    );
    
    setSelectedRoutes([...selectedRoutes, ...uniqueRoutes]);
  };

  // Remove a route
  const handleRemoveRoute = (route: any) => {
    setSelectedRoutes(selectedRoutes.filter(r => r.id !== route.id));
  };

  return (
    <PageContainer>
      <Sidebar isCollapsed={isSidebarCollapsed} />

      <MainContent>
        <ToggleButton onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </ToggleButton>

        <MapWrapper>
          <MapContainer
            center={defaultCenter}
            zoom={defaultZoom}
            zoomControl={true}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {pathCoordinates.length > 0 && (
              <>
                <Polyline
                  positions={pathCoordinates}
                  color={theme.colors.primary}
                  weight={4}
                  opacity={0.8}
                />
                <FitBounds coordinates={pathCoordinates} />
              </>
            )}

            {/* Route Polylines */}
            {Object.entries(routePaths).map(([routeId, pathSegments]) =>
              pathSegments.map((segment, index) => (
                <Polyline
                  key={`${routeId}-${index}`}
                  positions={segment.coordinates}
                  color={segment.color}
                  weight={6}
                  opacity={0.9}
                  dashArray="5, 5"
                />
              ))
            )}

            {/* Route Stop Markers */}
            {Object.entries(routeStops).map(([routeId, stops]) =>
              stops.map((stop, index) => {
                // Extract coordinates from stop - handles various possible property names
                const lat = stop.stop.location?.lat;
                const lng = stop.stop.location?.lon;
                
                if (!lat || !lng) return null;

                return (
                  <Marker
                    key={`stop-${routeId}-${index}`}
                    position={[lat, lng]}
                    icon={L.divIcon({
                      html: `
                        <div style="
                          width: 24px;
                          height: 24px;
                          background: ${stop.color};
                          border: 3px solid white;
                          border-radius: 50%;
                          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          font-size: 10px;
                          font-weight: bold;
                          color: white;
                        ">${index + 1}</div>
                      `,
                      className: '',
                      iconSize: [24, 24],
                      iconAnchor: [12, 12],
                    })}
                  >
                    <Popup>
                      <div style={{ fontSize: '12px' }}>
                        <strong style={{ color: stop.color }}>Stop {index + 1}</strong>
                        <div style={{ marginTop: '4px', color: '#666' }}>
                          {stop.name && <div>📍 {stop.name}</div>}
                          {stop.address && <div>📮 {stop.address}</div>}
                          {stop.longitude && stop.latitude && <div>🧭 {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}</div>}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })
            )}

            {/* Vehicle markers */}
            {selectedFleets.map((fleet: VehicleSearchResponse) => {
              const vehicleData = vehicleLocations[fleet.id];
              if (!vehicleData || hiddenVehicles.includes(fleet.id)) return null;

              return (
                <Marker
                  key={fleet.id}
                  position={[vehicleData.latitude, vehicleData.longitude]}
                  icon={createVehicleIcon(vehicleData.bearing)}
                >
                  <Popup>
                    <div style={{ fontSize: '12px', minWidth: '280px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                      {/* Vehicle Information */}
                      <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '2px solid #e0e7ff', backgroundColor: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e40af', marginBottom: '4px' }}>
                          🚗 {vehicleData.vehicleFleetNo || fleet.fleetNo}
                        </div>
                        {vehicleData.vehiclePlateNo && (
                          <div style={{ fontSize: '11px', color: '#3730a3', fontWeight: 500 }}>
                            📋 {vehicleData.vehiclePlateNo}
                          </div>
                        )}
                        {vehicleData.vehicleMake && vehicleData.vehicleModel && (
                          <div style={{ fontSize: '11px', color: '#4c1d95', marginTop: '2px' }}>
                            {vehicleData.vehicleMake} {vehicleData.vehicleModel}
                          </div>
                        )}
                      </div>

                      {/* Real-time Data */}
                      <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '2px solid #fef3c7', backgroundColor: '#fffbeb', padding: '8px', borderRadius: '6px' }}>
                        <div style={{ fontSize: '12px', color: '#92400e', fontWeight: 600, marginBottom: '3px' }}>
                          ⚡ Speed: <span style={{ color: '#dc2626', fontSize: '13px' }}>{vehicleData.speed?.toFixed(1) || 0}</span> <span style={{ fontSize: '11px' }}>km/h</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#92400e', fontWeight: 600 }}>
                          🧭 Bearing: <span style={{ color: '#dc2626', fontSize: '13px' }}>{vehicleData.bearing?.toFixed(0) || 0}</span> <span style={{ fontSize: '11px' }}>°</span>
                        </div>
                      </div>

                      {/* Driver Information */}
                      {vehicleData.driverName && (
                        <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '2px solid #d1fae5', backgroundColor: '#ecfdf5', padding: '8px', borderRadius: '6px' }}>
                          <div style={{ fontSize: '12px', color: '#065f46', fontWeight: 600 }}>
                            👤 Driver: <span style={{ color: '#059669', fontWeight: 700 }}>{vehicleData.driverName}</span>
                          </div>
                        </div>
                      )}

                      {/* Route Information */}
                      {vehicleData.routeName && (
                        <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '2px solid #cffafe', backgroundColor: '#ecf9fd', padding: '8px', borderRadius: '6px' }}>
                          <div style={{ fontSize: '12px', color: '#0e5a8a', fontWeight: 600 }}>
                            🛣️ Route: <span style={{ color: '#0369a1', fontWeight: 700 }}>{vehicleData.routeName}</span>
                          </div>
                        </div>
                      )}

                      {/* Trip Information */}
                      {vehicleData.tripId && (
                        <div style={{ marginBottom: '8px', padding: '8px', backgroundColor: '#f3f4f6', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                          {vehicleData.tripStartTime && (
                            <div style={{ fontSize: '11px', color: '#374151', marginBottom: '4px', fontWeight: 500 }}>
                              🕐 Start: <span style={{ color: '#1f2937', fontWeight: 600 }}>{new Date(vehicleData.tripStartTime).toLocaleTimeString()}</span>
                            </div>
                          )}
                          {vehicleData.tripEndTime && (
                            <div style={{ fontSize: '11px', color: '#374151', marginBottom: '4px', fontWeight: 500 }}>
                              🏁 End: <span style={{ color: '#1f2937', fontWeight: 600 }}>{new Date(vehicleData.tripEndTime).toLocaleTimeString()}</span>
                            </div>
                          )}
                          {vehicleData.tripStatus && (
                            <div style={{ fontSize: '11px', color: '#374151', fontWeight: 500 }}>
                              Status: 
                              <span style={{ 
                                marginLeft: '6px',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontWeight: 700,
                                display: 'inline-block',
                                fontSize: '10px',
                                backgroundColor: vehicleData.tripStatus === 'active' ? '#dcfce7' : vehicleData.tripStatus === 'completed' ? '#e0e7ff' : '#fecaca',
                                color: vehicleData.tripStatus === 'active' ? '#166534' : vehicleData.tripStatus === 'completed' ? '#3730a3' : '#7c2d12'
                              }}>
                                {vehicleData.tripStatus.toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Last Update */}
                      <div style={{ marginTop: '8px', fontSize: '10px', color: '#6b7280', textAlign: 'center', paddingTop: '6px', borderTop: '1px solid #e5e7eb', fontStyle: 'italic' }}>
                        ↻ {vehicleData.lastUpdate?.toLocaleTimeString() || 'N/A'}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </MapWrapper>

        {/* Tracking Panel */}
        <TrackingPanel>
          <PanelHeader>
            <h2>Live Tracking</h2>
            <div className="status">
              {isConnected ? '● Connected' : '● Disconnected'}
            </div>
          </PanelHeader>

          <PanelContent>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
              <span style={{ fontWeight: 600, color: theme.colors.textPrimary }}>
                Vehicles: <VehicleCount>{selectedFleets.length}</VehicleCount>
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedFleets.length > 0 && (
                  <button
                    onClick={() => {
                      selectedFleets.forEach(fleet => unsubscribeVehicle(fleet.id));
                      setSelectedFleets([]);
                    }}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: 500,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.background = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.background = '#ef4444';
                    }}
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setIsModalOpen(true)}
                  style={{
                    background: theme.colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.background = theme.colors.primaryHover;
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.background = theme.colors.primary;
                  }}
                >
                  + Add
                </button>
              </div>
            </div>

            <SearchInput
              type="text"
              placeholder="Search vehicles..."
              value={vehicleSearchFilter}
              onChange={(e) => setVehicleSearchFilter(e.target.value)}
            />

            <VehicleList>
              {selectedFleets.length === 0 ? (
                <div style={{ color: theme.colors.textMuted, fontSize: '12px', width: '100%', textAlign: 'center', padding: theme.spacing.lg, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60px' }}>
                  No vehicles selected
                </div>
              ) : (
                selectedFleets
                  .filter((fleet: VehicleSearchResponse) => {
                    const filterLower = vehicleSearchFilter.toLowerCase();
                    const data = vehicleLocations[fleet.id];
                    return fleet.fleetNo.toLowerCase().includes(filterLower) || 
                           (data?.driverName && data.driverName.toLowerCase().includes(filterLower));
                  })
                  .sort((a, b) => a.fleetNo.localeCompare(b.fleetNo))
                  .map((fleet: VehicleSearchResponse) => {
                  const data = vehicleLocations[fleet.id];
                  const tooltipText = `${data?.driverName || 'N/A'} | ${data?.routeName || 'N/A'} | ${data?.tripStatus || 'N/A'}`;
                  
                  return (
                    <VehicleTag
                      key={fleet.id}
                      data-tooltip={tooltipText}
                      onClick={() => {
                        if (hiddenVehicles.includes(fleet.id)) {
                          setHiddenVehicles(hiddenVehicles.filter(id => id !== fleet.id));
                        } else {
                          setHiddenVehicles([...hiddenVehicles, fleet.id]);
                        }
                      }}
                      hidden={hiddenVehicles.includes(fleet.id)}
                    >
                      <div className="status-indicator"></div>
                      <div className="vehicle-info">
                        <span className="fleet-number">{fleet.fleetNo}</span>
                        <div className="details">
                          {data?.driverName && <span>👤 {data.driverName}</span>}
                          {data?.routeName && <span>🛣️ {data.routeName}</span>}
                          {data?.tripStatus && <span>📍 {data.tripStatus.toUpperCase()}</span>}
                        </div>
                      </div>
                      <button onClick={() => handleRemoveVehicle(fleet)}>✕</button>
                    </VehicleTag>
                  );
                })
              )}
            </VehicleList>

            {/* Routes Section */}
            <div style={{ marginTop: theme.spacing.lg, paddingTop: theme.spacing.lg, borderTop: `1px solid ${theme.colors.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
                <span style={{ fontWeight: 600, color: theme.colors.textPrimary }}>
                  Routes: <VehicleCount>{selectedRoutes.length}</VehicleCount>
                </span>
                <button
                  onClick={() => setIsRoutesModalOpen(true)}
                  style={{
                    background: theme.colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.background = theme.colors.primaryHover;
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.background = theme.colors.primary;
                  }}
                >
                  + Add Route
                </button>
              </div>

              <RouteList>
                {selectedRoutes.length === 0 ? (
                  <div style={{ color: theme.colors.textMuted, fontSize: '12px', width: '100%', textAlign: 'center', padding: theme.spacing.lg, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60px' }}>
                    No routes selected
                  </div>
                ) : (
                  selectedRoutes.sort((a, b) => a.name.localeCompare(b.name)).map((route: any) => {
                    const color = getRouteColor(selectedRoutes.indexOf(route));
                    return (
                      <RouteTag
                        key={route.id}
                        style={{ borderLeftColor: color }}
                      >
                        <div className="status-indicator" style={{ background: color }}></div>
                        <div className="vehicle-info">
                          <span className="fleet-number">🛣️ {route.name} ({route.code})</span>
                        </div>
                        <button onClick={() => handleRemoveRoute(route)}>✕</button>
                      </RouteTag>
                    );
                  })
                )}
              </RouteList>
            </div>
          </PanelContent>
        </TrackingPanel>

        {/* Add Vehicles Modal */}
        <AddVehiclesModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onVehiclesSelected={handleVehiclesSelected}
        />

        {/* Add Routes Modal */}
        <AddRoutesModal
          isOpen={isRoutesModalOpen}
          onClose={() => setIsRoutesModalOpen(false)}
          onRoutesSelected={handleRoutesSelected}
        />
      </MainContent>
    </PageContainer>
  );
};

export default RealTimeTracking;

