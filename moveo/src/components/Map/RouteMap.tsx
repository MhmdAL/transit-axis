import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Stop } from '../../types';
import { RoutingService, RouteResponse, RouteCoordinate } from '../../services/routingService';
import polyline from '@mapbox/polyline';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom colored markers
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 25px;
        height: 25px;
        border-radius: 50% 50% 50% 0;
        border: 3px solid white;
        transform: rotate(-45deg);
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 12px;
        "></div>
      </div>
    `,
    iconSize: [25, 25],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  });
};

// Default blue marker for available stops
const defaultIcon = createCustomIcon('#3b82f6');

// Green marker for selected stops in route
const selectedIcon = createCustomIcon('#10b981');

const MapWrapper = styled.div<{ height?: string }>`
  width: 100%;
  height: ${({ height }) => height || '500px'};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  position: relative;
  
  .leaflet-container {
    height: 100%;
    width: 100%;
    background: ${theme.colors.surface};
  }
  
  .leaflet-control-container {
    .leaflet-control-zoom {
      background: ${theme.colors.card};
      border: 1px solid ${theme.colors.border};
      
      a {
        background: ${theme.colors.card};
        color: ${theme.colors.textPrimary};
        border-bottom: 1px solid ${theme.colors.border};
        
        &:hover {
          background: ${theme.colors.cardHover};
        }
        
        &:last-child {
          border-bottom: none;
        }
      }
    }
    
    .leaflet-control-attribution {
      background: rgba(0, 0, 0, 0.8);
      color: white;
      font-size: 11px;
      
      a {
        color: #3b82f6;
      }
    }
  }
  
  .leaflet-popup-content-wrapper {
    background: ${theme.colors.card};
    color: ${theme.colors.textPrimary};
    border-radius: ${theme.borderRadius.md};
    box-shadow: ${theme.shadows.lg};
  }
  
  .leaflet-popup-tip {
    background: ${theme.colors.card};
  }

  /* Custom marker styles for interactive stops */
  .leaflet-marker-icon {
    cursor: pointer;
    transition: transform 0.2s ease-in-out, filter 0.2s ease-in-out;
    
    &:hover {
      transform: scale(1.1);
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
    }
  }

  /* Custom marker styling */
  .custom-marker {
    background: transparent !important;
    border: none !important;
  }
`;

const MapSidebar = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  background: ${theme.colors.card};
  border-left: 1px solid ${theme.colors.border};
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const SidebarHeader = styled.div`
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border};
  background: ${theme.colors.surface};
`;

const SidebarTitle = styled.h3`
  margin: 0;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const SidebarContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ControlSection = styled.div`
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border};
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const ToggleButton = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${({ active }) => active ? theme.colors.primary : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background: ${({ active }) => active ? theme.colors.primary : theme.colors.surface};
  color: ${({ active }) => active ? 'white' : theme.colors.textPrimary};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  
  &:hover {
    background: ${({ active }) => active ? theme.colors.primary : theme.colors.surfaceHover};
    transform: translateY(-1px);
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.surface};
  color: ${theme.colors.textPrimary};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  
  &:hover {
    background: ${theme.colors.surfaceHover};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const SearchSection = styled.div`
  display: flex;
  flex-direction: column;
  overflow: visible;
`;

const SearchContainer = styled.div`
  position: relative;
  padding: ${theme.spacing.lg} ${theme.spacing.lg} ${theme.spacing.md};
  overflow: visible;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.surface};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
  transition: all 0.2s ease-in-out;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: ${theme.colors.textMuted};
  }
`;

const SearchDropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  border-top: none;
  border-radius: 0 0 ${theme.borderRadius.md} ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.lg};
  z-index: 1000;
  max-height: 200px;
  min-height: 40px;
  overflow-y: auto;
  display: ${({ isOpen }) => isOpen ? 'block' : 'none'};
  transition: all 0.2s ease-in-out;
`;

const DropdownItem = styled.div<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border-bottom: 1px solid ${theme.colors.border};
  
  background: ${theme.colors.surface};
    
  &:hover {
    background: ${theme.colors.surfaceHover};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const DropdownItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const DropdownItemName = styled.div`
  font-weight: ${theme.typography.fontWeight.medium};
  color: inherit;
  font-size: ${theme.typography.fontSize.sm};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DropdownItemCode = styled.div`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.xs};
  margin-top: ${theme.spacing.xs};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NoResults = styled.div`
  padding: ${theme.spacing.md};
  text-align: center;
  color: ${theme.colors.textMuted};
  font-size: ${theme.typography.fontSize.sm};
`;

const SelectedStopsSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const SelectedStopsHeader = styled.div`
  padding: 0 ${theme.spacing.lg} ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textSecondary};
`;

const SelectedStopsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
`;

const SelectedStopItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xs};
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  transition: all 0.2s ease-in-out;
  
  &:hover {
    background: ${theme.colors.surfaceHover};
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.sm};
  }
`;

const StopOrder = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: ${theme.typography.fontSize.xs};
  flex-shrink: 0;
`;

const StopInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const StopName = styled.div`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StopCode = styled.div`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.xs};
  margin-top: ${theme.spacing.xs};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RemoveButton = styled.button`
  color: ${theme.colors.error};
  padding: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.sm};
  transition: all 0.2s ease-in-out;
  
  &:hover {
    background: rgba(239, 68, 68, 0.1);
    transform: scale(1.1);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.textMuted};
`;

const MapInfo = styled.div`
  position: absolute;
  top: ${theme.spacing.md};
  left: ${theme.spacing.md};
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  z-index: 1000;
  pointer-events: none;
  max-width: 250px;
`;

const RouteInfo = styled.div`
  position: absolute;
  top: ${theme.spacing.md};
  right: ${theme.spacing.md};
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  z-index: 1000;
  pointer-events: none;
  min-width: 150px;
`;

const RouteInfoItem = styled.div`
  margin: 2px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const PopupContent = styled.div`
  min-width: 200px;
`;

const PopupTitle = styled.h4`
  margin: 0 0 ${theme.spacing.sm} 0;
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
`;

const PopupDetail = styled.div`
  margin: ${theme.spacing.xs} 0;
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
`;

// Component to handle map bounds fitting
const MapBoundsHandler: React.FC<{ selectedStops: Stop[] }> = ({ selectedStops }) => {
  // const map = useMap();

  // useEffect(() => {
  //   if (selectedStops.length > 0) {
  //     // Create bounds from selected stops
  //     const bounds = L.latLngBounds(
  //       selectedStops.map(stop => [stop.location.lat, stop.location.lon])
  //     );

  //     // Fit the map to show all selected stops with some padding
  //     if (selectedStops.length === 1) {
  //       // For single stop, just center on it with a reasonable zoom
  //       map.setView([selectedStops[0].location.lat, selectedStops[0].location.lon], 14);
  //     } else {
  //       // For multiple stops, fit bounds with padding
  //       map.fitBounds(bounds, { 
  //         padding: [20, 20],
  //         maxZoom: 16 
  //       });
  //     }
  //   }
  // }, [map, selectedStops]);

  return null;
};

// Component to fit all available stops into view
const FitAllStopsHandler: React.FC<{ stops: Stop[] }> = ({ stops }) => {
  const map = useMap();

  useEffect(() => {
    if (stops.length > 0) {
      const bounds = L.latLngBounds(
        stops.map(stop => [stop.location.lat, stop.location.lon])
      );
      map.fitBounds(bounds, { padding: [20, 20], maxZoom: 16 });
    }
  }, [map, stops]);

  return null;
};

// Component to handle map clicks for adding new stops
const MapAddingModeHandler: React.FC<{ isAddingMode: boolean; onMapClick: (lat: number, lng: number) => void }> = ({ isAddingMode, onMapClick }) => {
  const map = useMap();

  useEffect(() => {
    if (isAddingMode) {
      map.on('click', (e) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }
    return () => {
      map.off('click');
    };
  }, [isAddingMode, onMapClick, map]);

  return null;
};

interface RouteMapProps {
  stops: Stop[];
  selectedStops: Stop[];
  center?: { lat: number; lng: number };
  zoom?: number;
  showRoute?: boolean;
  height?: string;
  onStopClick?: (stop: Stop) => void;
  onFitRoute?: () => void;
  showAllStops?: boolean;
  onToggleShowAllStops?: () => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  filteredStops?: Stop[];
  onAddStop?: (stop: Stop) => void;
  onRemoveStop?: (stopOrder: number) => void;
  isAddingMode?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  onToggleAddingMode?: () => void;
}

const RouteMap: React.FC<RouteMapProps> = ({ 
  stops,
  selectedStops,
  center,
  zoom = 12,
  showRoute = true,
  height,
  onStopClick,
  onFitRoute,
  showAllStops = false,
  onToggleShowAllStops,
  searchTerm = '',
  onSearchChange,
  filteredStops = [],
  onAddStop,
  onRemoveStop,
  isAddingMode,
  onMapClick,
  onToggleAddingMode
}) => {
  // Default center - Qatar (Doha) if no center provided
  const defaultCenter = center || { lat: 25.2854, lng: 51.5310 };
  
  // State for route data
  const [routeData, setRouteData] = useState<RouteResponse | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);

  // Decode segment paths from selected stops
  useEffect(() => {
    if (selectedStops.length >= 2 && showRoute) {
      try {
        const allCoordinates: RouteCoordinate[] = [];
        
        // Decode and concatenate all segment paths from selectedStops
        for (let i = 0; i < selectedStops.length; i++) {
          const stop = selectedStops[i] as any;
          if (stop._segmentPath) {
            const decodedSegment = polyline.decode(stop._segmentPath);
            decodedSegment.forEach((coord: [number, number]) => {
              allCoordinates.push({ lat: coord[0], lng: coord[1] });
            });
          }
        }

        console.log('route data:', allCoordinates);
        
        // Set route data with decoded coordinates
        if (allCoordinates.length > 0) {
          setRouteData({
            coordinates: allCoordinates,
            distance: 0,
            duration: 0
          });
          setIsCalculatingRoute(false);
        } else {
          // No paths available, use straight line between stops
          const waypoints: RouteCoordinate[] = selectedStops.map(stop => ({
            lat: stop.location.lat,
            lng: stop.location.lon
          }));
          setRouteData({
            coordinates: waypoints,
            distance: 0,
            duration: 0
          });
          setIsCalculatingRoute(false);
        }
      } catch (error) {
        console.error('Error decoding paths:', error);
        // Fallback to straight line
        const waypoints: RouteCoordinate[] = selectedStops.map(stop => ({
          lat: stop.location.lat,
          lng: stop.location.lon
        }));
        setRouteData({
          coordinates: waypoints,
          distance: 0,
          duration: 0
        });
        setIsCalculatingRoute(false);
      }
    } else {
      setRouteData(null);
      setIsCalculatingRoute(false);
    }
  }, [selectedStops, showRoute]);

  // Create route line coordinates for Leaflet Polyline
  const routeCoordinates: [number, number][] = routeData 
    ? routeData.coordinates.map(coord => [coord.lat, coord.lng])
    : selectedStops.map(stop => [stop.location.lat, stop.location.lon]);

  // Search handlers
  const handleSearchChange = (value: string) => {
    onSearchChange?.(value);
    const shouldOpen = value.length > 0;
    console.log('Search change:', value, 'Should open:', shouldOpen, 'Filtered stops:', filteredStops.length);
    setIsSearchDropdownOpen(shouldOpen);
  };

  const handleSearchFocus = () => {
    console.log('Search focus, searchTerm:', searchTerm, 'length:', searchTerm.length);
    if (searchTerm.length > 0) {
      setIsSearchDropdownOpen(true);
    }
  };

  const handleSearchBlur = () => {
    // Delay closing to allow for click on dropdown item
    setTimeout(() => {
      setIsSearchDropdownOpen(false);
    }, 200);
  };

  const handleDropdownItemClick = (stop: Stop) => {
    onAddStop?.(stop);
    onSearchChange?.('');
    setIsSearchDropdownOpen(false);
  };

  return (
    <MapWrapper>
      {onStopClick && (
        <MapInfo>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            📍 Click stops to add to route
          </div>
          {isCalculatingRoute && (
            <div style={{ marginTop: '4px', fontSize: '12px', opacity: 0.8, color: '#3b82f6' }}>
              🛣️ Calculating road route...
            </div>
          )}
          {selectedStops.length === 1 && (
            <div style={{ marginTop: '4px', fontSize: '12px', opacity: 0.8 }}>
              Add another stop to see route
            </div>
          )}
        </MapInfo>
      )}
      
      
      {/* Map Sidebar */}
      <MapSidebar>
        <SidebarHeader>
          <SidebarTitle>
            🗺️ Route Builder
          </SidebarTitle>
        </SidebarHeader>
        
        <SidebarContent>
          {/* Controls Section */}
          <ControlSection>
            <ControlGroup>
              {onToggleShowAllStops && (
                <ToggleButton
                  active={showAllStops}
                  onClick={onToggleShowAllStops}
                >
                  📍 {showAllStops ? 'Hide Available Stops' : 'Show Available Stops'}
                </ToggleButton>
              )}

              {onToggleAddingMode && (
                <ToggleButton
                  active={!!isAddingMode}
                  onClick={onToggleAddingMode}
                >
                  🖱️ Add Stops
                </ToggleButton>
              )}

              
              {/* {selectedStops.length >= 2 && onFitRoute && (
                <ActionButton onClick={onFitRoute}>
                  🎯 Fit Route to View
                </ActionButton>
              )} */}
            </ControlGroup>
          </ControlSection>
          
          {/* Search Section */}
          <SearchSection>
            <SearchContainer>
              <SearchInput
                type="text"
                placeholder="Search stops to add..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
              />
              
              {/* Search Dropdown */}
              <SearchDropdown isOpen={isSearchDropdownOpen}>
                {filteredStops.length > 0 ? (
                  filteredStops.map((stop) => {
                    const isSelected = selectedStops.some(s => String(s.id) === String(stop.id));
                    return (
                      <DropdownItem
                        key={stop.id}
                        selected={isSelected}
                        onClick={() => !isSelected && handleDropdownItemClick(stop)}
                      >
                        <DropdownItemInfo>
                          <DropdownItemName>{stop.name}</DropdownItemName>
                          <DropdownItemCode>{stop.code}</DropdownItemCode>
                        </DropdownItemInfo>
                        {!isSelected && (
                          <div style={{ color: theme.colors.primary, fontSize: '16px' }}>+</div>
                        )}
                      </DropdownItem>
                    );
                  })
                ) : (
                  <NoResults>
                    No stops found for "{searchTerm}"
                  </NoResults>
                )}
              </SearchDropdown>
            </SearchContainer>
          </SearchSection>
          
          {/* Selected Stops Section */}
          <SelectedStopsSection>
            <SelectedStopsHeader>
              Selected Stops ({selectedStops.length})
            </SelectedStopsHeader>
            
            <SelectedStopsList>
              {selectedStops.length > 0 ? (
                selectedStops.map((stop, index) => (
                  <SelectedStopItem key={stop.id}>
                    <StopOrder>{index + 1}</StopOrder>
                    <StopInfo>
                      <StopName>{stop.name}</StopName>
                      <StopCode>{stop.code}</StopCode>
                    </StopInfo>
                    <RemoveButton onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onRemoveStop?.((stop as any).order);
                        }}>
                      ×
                    </RemoveButton>
                  </SelectedStopItem>
                ))
              ) : (
                <EmptyState>
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>📍</div>
                  <div style={{ fontSize: '12px', fontWeight: '500' }}>No stops selected</div>
                  <div style={{ fontSize: '10px', marginTop: '4px', color: theme.colors.textMuted }}>
                    Search and add stops to build your route
                  </div>
                </EmptyState>
              )}
            </SelectedStopsList>
          </SelectedStopsSection>
        </SidebarContent>
      </MapSidebar>
      
      <MapContainer
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Handle automatic bounds fitting when stops change */}
        <MapBoundsHandler selectedStops={selectedStops} />
        
        {/* Handle map clicks for adding new stops */}
        {isAddingMode && onMapClick && (
          <MapAddingModeHandler 
            isAddingMode={isAddingMode} 
            onMapClick={onMapClick}
          />
        )}
        
        {/* Show all available stops */}
        {selectedStops.map((stop) => {
          // const isSelected = selectedStops.some(s => String(s.id) === String(stop.id));
          // const selectedStop = selectedStops.find(s => String(s.id) === String(stop.id)) as any;
          
          // Only show non-selected stops if showAllStops is true
          // if (!isSelected && !showAllStops) {
          //   return null;
          // }

          return (
            <Marker
              key={stop.id}
              position={[stop.location.lat, stop.location.lon]}
              icon={selectedIcon}
              eventHandlers={{
                click: () => {
                  if (onStopClick) {
                    onStopClick(stop);
                  }
                }
              }}
            >
              <Popup>
                <PopupContent>
                  <PopupTitle>{stop.name}</PopupTitle>
                  <PopupDetail><strong>Code:</strong> {stop.code}</PopupDetail>
                  <PopupDetail><strong>Order:</strong> #{(stop as any).order + 1} in route</PopupDetail>
                  {/* {onStopClick && !isSelected && (
                    <PopupDetail style={{ color: theme.colors.primary, fontWeight: 'bold', marginTop: '8px' }}>
                      Click to add to route
                    </PopupDetail>
                  )} */}
                  {onRemoveStop && (
                    <div style={{ marginTop: '12px' }}>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onRemoveStop((stop as any).order);
                        }}
                        style={{
                          width: '100%',
                          padding: '6px 12px',
                          backgroundColor: theme.colors.error,
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500',
                          transition: 'all 0.2s ease-in-out',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#dc2626';
                          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = theme.colors.error;
                          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                        }}
                      >
                        🗑️ Remove from Route
                      </button>
                    </div>
                  )}
                </PopupContent>
              </Popup>
            </Marker>
          );
        })}
        
        {/* Show route line */}
        {showRoute && selectedStops.length > 1 && routeCoordinates.length > 0 && (
          <>
            {/* Glow/shadow effect layer */}
            <Polyline
              positions={routeCoordinates}
              color={theme.colors.primary}
              weight={4}
              opacity={0.2}
              dashArray={routeData ? undefined : "10, 5"}
              lineCap="round"
              lineJoin="round"
            />
            {/* Main route line */}
            <Polyline
              positions={routeCoordinates}
              color={routeData ? theme.colors.primary : theme.colors.info}
              weight={routeData ? 4 : 6}
              opacity={1}
              dashArray={routeData ? undefined : "10, 5"}
              lineCap="round"
              lineJoin="round"
            />
          </>
        )}
      </MapContainer>
    </MapWrapper>
  );
};

export default RouteMap;
