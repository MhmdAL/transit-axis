import React, { useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import MultiSelectSearchDropdown from './MultiSelectSearchDropdown';

export interface Route {
  id: string;
  name: string;
  code: string;
}

interface RouteSelectorProps {
  selectedRoutes: Route[];
  onRoutesChange: (routes: Route[]) => void;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
}

const Container = styled.div`
  width: 100%;
`;

const Label = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: ${theme.spacing.sm};
`;

const RouteSelector: React.FC<RouteSelectorProps> = ({
  selectedRoutes,
  onRoutesChange,
  placeholder = 'Search routes by name or code...',
  disabled = false,
  hasError = false,
}) => {
  // Format route for display
  const formatRouteDisplay = useCallback((route: Route) => {
    return `${route.code} - ${route.name}`;
  }, []);

  // Render route item in dropdown
  const renderRouteItem = useCallback((route: Route) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontWeight: 600, color: theme.colors.primary }}>
          {route.code}
        </span>
        <span>{route.name}</span>
      </div>
    );
  }, []);

  // API search handler - internal logic
  const handleSearchRoutes = useCallback(async (searchTerm: string): Promise<Route[]> => {
    try {
      const { apiService } = await import('@/services/apiService');
      const routes = await apiService.searchRoutes(searchTerm);
      return routes.map((r: any) => ({
        id: r.id,
        name: r.name,
        code: r.code,
      }));
    } catch (error) {
      console.error('Error searching routes:', error);
      return [];
    }
  }, []);

  return (
    <Container>
      <Label htmlFor="route-selector">Select Routes</Label>
      <MultiSelectSearchDropdown<Route>
        values={selectedRoutes}
        onChange={onRoutesChange}
        onSearch={handleSearchRoutes}
        displayValue={formatRouteDisplay}
        renderItem={renderRouteItem}
        placeholder={placeholder}
        disabled={disabled}
        hasError={hasError}
        searchPromptMessage="Type to search routes by name or code"
        noResultsMessage="No routes found"
        minSearchLength={1}
        debounceMs={300}
      />
    </Container>
  );
};

export default RouteSelector;
