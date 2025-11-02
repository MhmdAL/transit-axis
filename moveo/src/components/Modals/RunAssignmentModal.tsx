import React, { useState } from 'react';
import styled from 'styled-components';
import { FiX, FiUsers } from 'react-icons/fi';
import { theme } from '../../styles/theme';
import { Button } from '../../styles/GlobalStyles';
import MultiSelectSearchDropdown from '../UI/DropDowns/MultiSelectSearchDropdown';
import { Driver } from '../../types';
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

const RunInfo = styled.div<{ color?: string }>`
  background: ${props => props.color ? `color-mix(in srgb, ${props.color} 15%, transparent)` : theme.colors.surface};
  border-left: 4px solid ${props => props.color || theme.colors.primary};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const RunCode = styled.div`
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

interface RunAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  runCode?: string;
  runColor?: string;
  currentDriver?: string;
  dutyCount: number;
  onAssign: (driverId: string | null) => void;
}

const RunAssignmentModal: React.FC<RunAssignmentModalProps> = ({
  isOpen,
  onClose,
  runCode,
  runColor,
  currentDriver,
  dutyCount,
  onAssign
}) => {
  const [selectedDrivers, setSelectedDrivers] = useState<Driver[]>([]);

  const searchDrivers = async (searchTerm: string): Promise<Driver[]> => {
    try {
      if (!searchTerm.trim()) {
        return [];
      }
      return await dataService.getDrivers({
        search: searchTerm.trim(),
        limit: 50
      });
    } catch (error) {
      console.error('Error searching drivers:', error);
      return [];
    }
  };

  const handleDriverChange = (drivers: Driver[]) => {
    // Only allow single selection
    if (drivers.length > 0) {
      setSelectedDrivers([drivers[drivers.length - 1]]);
    } else {
      setSelectedDrivers([]);
    }
  };

  const handleAssign = () => {
    onAssign(selectedDrivers[0]?.id || null);
    setSelectedDrivers([]);
    onClose();
  };

  const handleCancel = () => {
    setSelectedDrivers([]);
    onClose();
  };

  if (!isOpen || !runCode) return null;

  return (
    <ModalOverlay isOpen={isOpen} onClick={handleCancel}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <FiUsers />
            Assign Driver to Run
          </ModalTitle>
          <CloseButton onClick={handleCancel}>
            <FiX size={24} />
          </CloseButton>
        </ModalHeader>

        <RunInfo color={runColor}>
          <RunCode color={runColor}>{runCode}</RunCode>
          <DutyCount>{dutyCount} {dutyCount === 1 ? 'duty' : 'duties'} will be assigned</DutyCount>
        </RunInfo>

        {currentDriver && (
          <CurrentAssignment>
            <AssignmentLabel>Currently assigned:</AssignmentLabel>
            <AssignmentValue>{currentDriver}</AssignmentValue>
          </CurrentAssignment>
        )}

        <FormGroup>
          <Label>Select Driver</Label>
          <MultiSelectSearchDropdown
            values={selectedDrivers}
            onChange={handleDriverChange}
            onSearch={searchDrivers}
            displayValue={(driver) => driver.name}
            renderItem={(driver) => (
              <div style={{ padding: '4px 0' }}>
                <div style={{ fontWeight: '500', fontSize: '14px' }}>
                  {driver.name}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                  QID: {driver.qid || 'N/A'}
                </div>
              </div>
            )}
            placeholder="Search drivers..."
          />
        </FormGroup>

        <ModalFooter>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAssign}>
            {selectedDrivers.length > 0 ? 'Assign Driver' : 'Clear Assignment'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default RunAssignmentModal;

