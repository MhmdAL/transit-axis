import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Card } from '../../styles/GlobalStyles';

const TrackingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`;

const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const MapPlaceholder = styled(Card)`
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.colors.surface};
  border: 2px dashed ${theme.colors.border};
`;

const Tracking: React.FC = () => {
  return (
    <TrackingContainer className="fade-in">
      <PageTitle>Live Tracking</PageTitle>
      <MapPlaceholder>
        <div style={{ textAlign: 'center', color: theme.colors.textMuted }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
          <h3>Map Integration Coming Soon</h3>
          <p>Real-time vehicle tracking will be displayed here</p>
        </div>
      </MapPlaceholder>
    </TrackingContainer>
  );
};

export default Tracking;


