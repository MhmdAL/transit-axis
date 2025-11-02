import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import MultiSelectSearchDropdown from '@/components/UI/MultiSelectSearchDropdown';

interface RouteSearchResponse {
  id: string;
  name: string;
  code: string;
}

interface AddRoutesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoutesSelected: (routes: RouteSearchResponse[]) => void;
}

// Styled Components
const ModalOverlay = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 2000;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  background: #1f2937;
  color: #f3f4f6;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  h2 {
    margin: 0 0 ${theme.spacing.lg} 0;
    color: #f3f4f6;
    font-size: 18px;
  }

  p {
    color: #d1d5db;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
  position: relative;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 24px;
  padding: 0;
  transition: color ${theme.transitions.fast};

  &:hover {
    color: #f3f4f6;
  }
`;

const SearchContainer = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const AddRoutesModal: React.FC<AddRoutesModalProps> = ({
  isOpen,
  onClose,
  onRoutesSelected,
}) => {
  const [selectedRoutes, setSelectedRoutes] = useState<RouteSearchResponse[]>([]);

  // Reset modal state when closing
  useEffect(() => {
    if (!isOpen) {
      setSelectedRoutes([]);
    }
  }, [isOpen]);

  // Search function for routes - directly call API
  const handleRouteSearch = useCallback(async (searchTerm: string): Promise<RouteSearchResponse[]> => {
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

  const closeModal = () => {
    onClose();
    setSelectedRoutes([]);
  };

  const handleRouteSelect = (routes: RouteSearchResponse[]) => {
    setSelectedRoutes(routes);
  };

  const confirmSelection = () => {
    onRoutesSelected(selectedRoutes);
    closeModal();
  };

  return (
    <ModalOverlay isOpen={isOpen} onClick={closeModal}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>🛣️ Select Routes</h2>
          <CloseButton onClick={closeModal}>✕</CloseButton>
        </ModalHeader>

        <p style={{ color: theme.colors.textMuted, marginBottom: theme.spacing.md }}>
          Search and select routes to track on the map
        </p>

        <SearchContainer>
          <MultiSelectSearchDropdown<RouteSearchResponse>
            values={selectedRoutes}
            onChange={handleRouteSelect}
            onSearch={handleRouteSearch}
            displayValue={(route: RouteSearchResponse) => `${route.name} (${route.code})`}
            renderItem={(route: RouteSearchResponse) => (
              <span>
                🛣️ {route.name} ({route.code})
              </span>
            )}
            placeholder="Search routes..."
            minSearchLength={0}
          />
        </SearchContainer>

        <div style={{ display: 'flex', gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
          <button
            onClick={closeModal}
            style={{
              flex: 1,
              padding: theme.spacing.md,
              background: '#374151',
              color: '#f3f4f6',
              border: 'none',
              borderRadius: theme.borderRadius.md,
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background = '#4b5563';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = '#374151';
            }}
          >
            Cancel
          </button>
          <button
            onClick={confirmSelection}
            style={{
              flex: 1,
              padding: theme.spacing.md,
              background: theme.colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: theme.borderRadius.md,
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
            Confirm ({selectedRoutes.length})
          </button>
        </div>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AddRoutesModal;
