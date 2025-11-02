import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapWrapper = styled.div`
  width: 100%;
  height: 400px;
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  
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
`;

const CoordinatesDisplay = styled.div`
  position: absolute;
  bottom: ${theme.spacing.md};
  right: ${theme.spacing.md};
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.xs};
  font-family: ${theme.typography.fontFamily.mono.join(', ')};
  z-index: 1000;
  pointer-events: none;
`;

interface InteractiveMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
  selectedLocation?: { lat: number; lng: number } | null;
  center?: { lat: number; lng: number };
  zoom?: number;
}

// Component to handle map clicks
const MapClickHandler: React.FC<{ onLocationSelect: (lat: number, lng: number) => void }> = ({ 
  onLocationSelect 
}) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  
  return null;
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  onLocationSelect, 
  selectedLocation,
  center: propCenter,
  zoom = 13
}) => {
  const [center, setCenter] = useState<{ lat: number; lng: number }>(
    propCenter || { lat: 25.2854, lng: 51.5310 } // Default to Doha, Qatar
  );
  const [isLoadingLocation, setIsLoadingLocation] = useState(!propCenter);

  useEffect(() => {
    // Only get user location if no center was provided as prop
    if (!propCenter) {
      if (navigator.geolocation) {
        setIsLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCenter({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            setIsLoadingLocation(false);
          },
          (error) => {
            console.warn('Error getting user location:', error);
            // Keep default NYC location
            setIsLoadingLocation(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      } else {
        console.warn('Geolocation is not supported by this browser');
        setIsLoadingLocation(false);
      }
    }
  }, [propCenter]);

  if (isLoadingLocation) {
    return (
      <MapWrapper>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          color: theme.colors.textSecondary,
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ fontSize: '24px' }}>📍</div>
          <div>Getting your location...</div>
        </div>
      </MapWrapper>
    );
  }

  return (
    <MapWrapper>
      <MapInfo>
        Click anywhere on the map to select a location
      </MapInfo>
      
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        whenReady={() => {
          // Map is ready
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onLocationSelect={onLocationSelect} />
        
        {selectedLocation && (
          <Marker 
            position={[selectedLocation.lat, selectedLocation.lng]}
          />
        )}
      </MapContainer>
      
      {selectedLocation && (
        <CoordinatesDisplay>
          Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
        </CoordinatesDisplay>
      )}
    </MapWrapper>
  );
};

export default InteractiveMap;