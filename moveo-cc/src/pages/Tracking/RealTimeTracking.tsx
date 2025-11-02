import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import { useLocation } from 'react-router-dom';
import polyline from '@mapbox/polyline';
import { theme } from '../../styles/theme';
import Sidebar from '../../components/Sidebar/Sidebar';
import 'leaflet/dist/leaflet.css';

const PageContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: ${theme.colors.background};
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
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

const RealTimeTracking: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const [pathCoordinates, setPathCoordinates] = useState<[number, number][]>([]);
  
  // Default center (you can change this to your preferred location)
  const defaultCenter: [number, number] = [31.9454, 35.9284]; // Amman, Jordan
  const defaultZoom = 13;

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
          </MapContainer>
        </MapWrapper>
      </MainContent>
    </PageContainer>
  );
};

export default RealTimeTracking;

