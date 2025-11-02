import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import MultiSelectSearchDropdown from '@/components/UI/MultiSelectSearchDropdown';

interface VehicleSearchResponse {
  id: string;
  fleetNo: string;
  plateNo: string;
}

interface AddVehiclesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVehiclesSelected: (vehicles: VehicleSearchResponse[]) => void;
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

const ModalOption = styled.button`
  width: 100%;
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  border: 2px solid #374151;
  background: #111827;
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  text-align: left;

  h3 {
    margin: 0 0 4px 0;
    color: #f3f4f6;
    font-size: 14px;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: #9ca3af;
    font-size: 12px;
  }

  &:hover {
    border-color: ${theme.colors.primary};
    background: #1f2937;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 24px;
  padding: 0;
  position: absolute;
  top: ${theme.spacing.md};
  right: ${theme.spacing.md};
  transition: color ${theme.transitions.fast};

  &:hover {
    color: #f3f4f6;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
  position: relative;
`;

const SearchContainer = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const AddVehiclesModal: React.FC<AddVehiclesModalProps> = ({
  isOpen,
  onClose,
  onVehiclesSelected,
}) => {
  const [modalMode, setModalMode] = useState<'select' | 'search' | null>(null);
  const [modalSearchFleets, setModalSearchFleets] = useState<VehicleSearchResponse[]>([]);
  const [totalVehiclesCount, setTotalVehiclesCount] = useState(0);

  // Reset modal state when closing
  useEffect(() => {
    if (!isOpen) {
      setModalMode(null);
      setModalSearchFleets([]);
    }
  }, [isOpen]);

  // Search function for vehicles - directly call API
  const handleVehicleSearch = useCallback(async (searchTerm: string): Promise<VehicleSearchResponse[]> => {
    try {
      const { apiService } = await import('@/services/apiService');
      const vehicles = await apiService.searchVehicles(searchTerm);
      return vehicles.map((v: any) => ({ id: v.id, fleetNo: v.fleetNo, plateNo: v.plateNo }));
    } catch (error) {
      console.error('Error searching vehicles:', error);
      // Fallback to empty results
      return [];
    }
  }, []);

  const closeModal = () => {
    onClose();
    setModalMode(null);
    setModalSearchFleets([]);
  };

  const handleAddAllVehicles = async () => {
    try {
      const { apiService } = await import('@/services/apiService');
      const allVehicles = await apiService.getAllVehicles();

      onVehiclesSelected(allVehicles.map((v: any) => ({ id: v.id, fleetNo: v.fleetNo, plateNo: v.plateNo })));
      
      closeModal();
    } catch (error) {
      console.error('Error fetching all vehicles:', error);
    }
  };

  const handleModalVehicleSelect = (vehicles: VehicleSearchResponse[]) => {
    setModalSearchFleets(vehicles);
  };

  const confirmModalSelections = () => {
    onVehiclesSelected(modalSearchFleets);
    
    closeModal();
  };

  const handleOpenAddAll = async () => {
    setModalMode(null);
    try {
      const { apiService } = await import('@/services/apiService');
      const allVehicles = await apiService.getAllVehicles();
      setModalSearchFleets(allVehicles.map((v: any) => ({ id: v.id, fleetNo: v.fleetNo, plateNo: v.plateNo })));
      onVehiclesSelected(allVehicles.map((v: any) => ({ id: v.id, fleetNo: v.fleetNo, plateNo: v.plateNo })));
    
      closeModal();
  
      setTotalVehiclesCount(allVehicles.length);
    } catch (error) {
      console.error('Error fetching vehicle count:', error);
      setTotalVehiclesCount(0);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClick={closeModal}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>Add Vehicles</h2>
          <CloseButton onClick={closeModal}>✕</CloseButton>
        </ModalHeader>

        {modalMode === null && (
          <>
            <ModalOption onClick={() => handleOpenAddAll()}>
              <h3>📋 Add All Vehicles</h3>
              <p>Add all available vehicles from the system</p>
            </ModalOption>

            <ModalOption onClick={() => setModalMode('search')}>
              <h3>🔍 Multi-Select Search</h3>
              <p>Search and select specific vehicles</p>
            </ModalOption>
          </>
        )}

        {modalMode === 'select' && (
          <div>
            <p style={{ color: theme.colors.textMuted, marginBottom: theme.spacing.md }}>
              This will add all {totalVehiclesCount} available vehicles to your tracking list.
            </p>
            <div style={{ display: 'flex', gap: theme.spacing.md }}>
              <button
                onClick={handleAddAllVehicles}
                style={{
                  flex: 1,
                  padding: theme.spacing.md,
                  background: theme.colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: theme.borderRadius.md,
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Add All
              </button>
              <button
                onClick={() => {
                  setModalMode(null);
                  setTotalVehiclesCount(0);
                }}
                style={{
                  flex: 1,
                  padding: theme.spacing.md,
                  background: theme.colors.border,
                  color: theme.colors.textPrimary,
                  border: 'none',
                  borderRadius: theme.borderRadius.md,
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Back
              </button>
            </div>
          </div>
        )}

        {modalMode === 'search' && (
          <div>
            <SearchContainer>
              <MultiSelectSearchDropdown<VehicleSearchResponse>
                values={modalSearchFleets}
                onChange={handleModalVehicleSelect}
                onSearch={handleVehicleSearch}
                displayValue={(fleet: VehicleSearchResponse) => `${fleet.fleetNo} - ${fleet.plateNo}`}
                renderItem={(fleet: VehicleSearchResponse) => <span>🚗 {fleet.fleetNo}</span>}
                placeholder="Search vehicles..."
                minSearchLength={0}
              />
            </SearchContainer>
            <div style={{ display: 'flex', gap: theme.spacing.md }}>
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
                onClick={confirmModalSelections}
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
                Confirm
              </button>
            </div>
          </div>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default AddVehiclesModal;
