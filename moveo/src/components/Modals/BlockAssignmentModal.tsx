import React, { useState } from 'react';
import styled from 'styled-components';
import { FiX, FiTruck } from 'react-icons/fi';
import { theme } from '../../styles/theme';
import { Button } from '../../styles/GlobalStyles';
import MultiSelectSearchDropdown from '../UI/DropDowns/MultiSelectSearchDropdown';
import { Vehicle } from '../../types';
import { dataService } from '../../services/dataService';

const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.modal};
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: ${theme.colors.card};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${theme.shadows.xl};
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.lg};
`;

const ModalTitle = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.textSecondary};
  cursor: pointer;
  padding: ${theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.md};
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.surfaceHover};
    color: ${theme.colors.textPrimary};
  }
`;

const BlockInfo = styled.div<{ color?: string }>`
  background: ${props => props.color ? `color-mix(in srgb, ${props.color} 15%, transparent)` : theme.colors.surface};
  border-left: 4px solid ${props => props.color || theme.colors.primary};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const BlockCode = styled.div`
  font-family: monospace;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${props => props.color || theme.colors.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const DutyCount = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
`;

const FormGroup = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const Label = styled.label`
  display: block;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.sm};
`;

const CurrentAssignment = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
`;

const AssignmentLabel = styled.div`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.xs};
  margin-bottom: ${theme.spacing.xs};
`;

const AssignmentValue = styled.div`
  color: ${theme.colors.textPrimary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const ModalFooter = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${theme.spacing.xl};
`;

interface BlockAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockCode?: string;
  blockColor?: string;
  currentVehicle?: string;
  dutyCount: number;
  onAssign: (vehicleId: string | null) => void;
}

const BlockAssignmentModal: React.FC<BlockAssignmentModalProps> = ({
  isOpen,
  onClose,
  blockCode,
  blockColor,
  currentVehicle,
  dutyCount,
  onAssign
}) => {
  const [selectedVehicles, setSelectedVehicles] = useState<Vehicle[]>([]);

  const searchVehicles = async (searchTerm: string): Promise<Vehicle[]> => {
    try {
      if (!searchTerm.trim()) {
        return [];
      }
      return await dataService.getVehicles({
        search: searchTerm.trim(),
        limit: 50
      });
    } catch (error) {
      console.error('Error searching vehicles:', error);
      return [];
    }
  };

  const handleVehicleChange = (vehicles: Vehicle[]) => {
    // Only allow single selection
    if (vehicles.length > 0) {
      setSelectedVehicles([vehicles[vehicles.length - 1]]);
    } else {
      setSelectedVehicles([]);
    }
  };

  const handleAssign = () => {
    onAssign(selectedVehicles[0]?.id || null);
    setSelectedVehicles([]);
    onClose();
  };

  const handleCancel = () => {
    setSelectedVehicles([]);
    onClose();
  };

  if (!isOpen || !blockCode) return null;

  return (
    <ModalOverlay isOpen={isOpen} onClick={handleCancel}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <FiTruck />
            Assign Vehicle to Block
          </ModalTitle>
          <CloseButton onClick={handleCancel}>
            <FiX size={24} />
          </CloseButton>
        </ModalHeader>

        <BlockInfo color={blockColor}>
          <BlockCode color={blockColor}>{blockCode}</BlockCode>
          <DutyCount>{dutyCount} {dutyCount === 1 ? 'duty' : 'duties'} will be assigned</DutyCount>
        </BlockInfo>

        {currentVehicle && (
          <CurrentAssignment>
            <AssignmentLabel>Currently assigned:</AssignmentLabel>
            <AssignmentValue>{currentVehicle}</AssignmentValue>
          </CurrentAssignment>
        )}

        <FormGroup>
          <Label>Select Vehicle</Label>
          <MultiSelectSearchDropdown
            values={selectedVehicles}
            onChange={handleVehicleChange}
            onSearch={searchVehicles}
            displayValue={(vehicle) => `${vehicle.plateNo} - ${vehicle.fleetNo}`}
            renderItem={(vehicle) => (
              <div style={{ padding: '4px 0' }}>
                <div style={{ fontWeight: '500', fontSize: '14px' }}>
                  {vehicle.plateNo}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                  Fleet: {vehicle.fleetNo} • {vehicle.model?.make || 'Unknown'} {vehicle.model?.year || ''}
                </div>
              </div>
            )}
            placeholder="Search vehicles..."
          />
        </FormGroup>

        <ModalFooter>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAssign}>
            {selectedVehicles.length > 0 ? 'Assign Vehicle' : 'Clear Assignment'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default BlockAssignmentModal;

