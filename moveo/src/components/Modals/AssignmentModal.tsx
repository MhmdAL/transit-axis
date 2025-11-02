import React, { useState, useEffect } from 'react';
import { FiX, FiUsers, FiTruck, FiSettings, FiRefreshCw } from 'react-icons/fi';
import { Button } from '../../styles/GlobalStyles';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import MultiSelectSearchDropdown from '../UI/DropDowns/MultiSelectSearchDropdown';
import { dataService } from '../../services/dataService';
import { Driver, Vehicle } from '../../types';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.modal};
`;

const ModalContainer = styled.div`
  background: ${theme.colors.card};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border};
`;

const ModalTitle = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.textSecondary};
  cursor: pointer;
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  
  &:hover {
    background: ${theme.colors.surfaceHover};
    color: ${theme.colors.textPrimary};
  }
`;

const ModalContent = styled.div`
  padding: ${theme.spacing.lg};
`;

const Section = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const SectionTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
  margin: 0 0 ${theme.spacing.md} 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const OptionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  
  &:hover {
    background: ${theme.colors.surfaceHover};
  }
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: ${theme.colors.primary};
`;

const CheckboxLabel = styled.span`
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
`;

const SelectGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const Select = styled.select`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.card};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const MultiSelectContainer = styled.div`
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.card};
  max-height: 200px;
  overflow-y: auto;
`;

const MultiSelectItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  cursor: pointer;
  border-bottom: 1px solid ${theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: ${theme.colors.surfaceHover};
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border};
  gap: ${theme.spacing.md};
`;

const CancelButton = styled(Button)`
  flex: 1;
`;

const AssignButton = styled(Button)`
  flex: 2;
`;

const SummaryText = styled.div`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.sm};
  margin-bottom: ${theme.spacing.md};
`;

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTrips: string[];
  onAssign: (assignmentData: AssignmentData) => void;
}

interface AssignmentData {
  selectedDrivers: Driver[];
  selectedVehicles: Vehicle[];
  ignoreAssigned: boolean;
  algorithm: 'round-robin' | 'continuous';
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  onClose,
  selectedTrips,
  onAssign
}) => {
  const [selectedDrivers, setSelectedDrivers] = useState<Driver[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<Vehicle[]>([]);
  const [ignoreAssigned, setIgnoreAssigned] = useState(false);
  const [algorithm, setAlgorithm] = useState<'round-robin' | 'continuous'>('round-robin');
  const [error, setError] = useState<string | null>(null);

  // Search functions for MultiSelectSearchDropdown
  const searchDrivers = async (searchTerm: string): Promise<Driver[]> => {
    try {
      if (!searchTerm.trim()) {
        return [];
      }
      
      const drivers = await dataService.getDrivers({
        search: searchTerm.trim(),
        limit: 50 // Limit results for better performance
      });
      
      return drivers;
    } catch (error) {
      console.error('Error searching drivers:', error);
      setError('Failed to search drivers');
      return [];
    }
  };

  const searchVehicles = async (searchTerm: string): Promise<Vehicle[]> => {
    try {
      if (!searchTerm.trim()) {
        return [];
      }
      
      const vehicles = await dataService.getVehicles({
        search: searchTerm.trim(),
        limit: 50 // Limit results for better performance
      });
      
      return vehicles;
    } catch (error) {
      console.error('Error searching vehicles:', error);
      setError('Failed to search vehicles');
      return [];
    }
  };

  const handleAssign = () => {
    const assignmentData: AssignmentData = {
      selectedDrivers,
      selectedVehicles,
      ignoreAssigned,
      algorithm
    };
    
    onAssign(assignmentData);
    onClose();
  };

  const handleClose = () => {
    // Reset form when closing
    setSelectedDrivers([]);
    setSelectedVehicles([]);
    setIgnoreAssigned(false);
    setAlgorithm('round-robin');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Assign Trips</ModalTitle>
          <CloseButton onClick={handleClose}>
            <FiX size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalContent>
          <SummaryText>
            Assigning {selectedTrips.length} trip{selectedTrips.length !== 1 ? 's' : ''}
            <br />
            <small style={{ fontSize: '12px', color: theme.colors.textMuted }}>
              You can assign drivers only, vehicles only, or both. At least one type must be selected.
            </small>
          </SummaryText>

          {error && (
            <div style={{
              padding: theme.spacing.md,
              backgroundColor: theme.colors.error + '20',
              border: `1px solid ${theme.colors.error}`,
              borderRadius: theme.borderRadius.md,
              color: theme.colors.error,
              marginBottom: theme.spacing.lg
            }}>
              {error}
            </div>
          )}

          <Section>
            <SectionTitle>
              <FiUsers />
              Select Drivers (Optional)
            </SectionTitle>
            <MultiSelectSearchDropdown
              values={selectedDrivers}
              onChange={setSelectedDrivers}
              onSearch={searchDrivers}
              displayValue={(driver) => driver.name}
              renderItem={(driver) => (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: theme.colors.textPrimary, fontWeight: '500' }}>
                      {driver.name}
                    </span>
                    <span style={{ 
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.textSecondary
                    }}>
                      {driver.email}
                    </span>
                  </div>
                  <span style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.textMuted
                  }}>
                    {driver.phone}
                  </span>
                </div>
              )}
              placeholder="Search for drivers..."
              maxHeight="150px"
            />
          </Section>

          <Section>
            <SectionTitle>
              <FiTruck />
              Select Vehicles (Optional)
            </SectionTitle>
            <MultiSelectSearchDropdown
              values={selectedVehicles}
              onChange={setSelectedVehicles}
              onSearch={searchVehicles}
              displayValue={(vehicle) => `${vehicle.plateNo} - ${vehicle.fleetNo}`}
              renderItem={(vehicle) => (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: theme.colors.textPrimary, fontWeight: '500' }}>
                      {vehicle.plateNo}
                    </span>
                    <span style={{ 
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.textSecondary
                    }}>
                      Fleet: {vehicle.fleetNo}
                    </span>
                  </div>
                  <span style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.textMuted
                  }}>
                    {vehicle.model?.make || 'Unknown'} {vehicle.model?.year || ''}
                  </span>
                </div>
              )}
              placeholder="Search for vehicles..."
              maxHeight="150px"
            />
          </Section>

          <Section>
            <SectionTitle>
              <FiSettings />
              Assignment Options
            </SectionTitle>
            <OptionGroup>
              <CheckboxItem>
                <Checkbox
                  type="checkbox"
                  checked={ignoreAssigned}
                  onChange={(e) => setIgnoreAssigned(e.target.checked)}
                />
                <CheckboxLabel>
                  Ignore already assigned trips
                </CheckboxLabel>
              </CheckboxItem>
            </OptionGroup>
          </Section>

          <Section>
            <SectionTitle>
              <FiRefreshCw />
              Assignment Algorithm
            </SectionTitle>
            <SelectGroup>
              <Select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as 'round-robin' | 'continuous')}
              >
                <option value="round-robin">Round Robin</option>
                <option value="continuous">Continuous</option>
              </Select>
              <div style={{ 
                fontSize: theme.typography.fontSize.xs, 
                color: theme.colors.textSecondary,
                marginTop: theme.spacing.xs 
              }}>
                {algorithm === 'round-robin' 
                  ? 'Distributes assignments evenly across selected drivers/vehicles'
                  : 'Assigns trips continuously to the same driver/vehicle until capacity is reached'
                }
              </div>
            </SelectGroup>
          </Section>
        </ModalContent>

        <ModalFooter>
          <CancelButton variant="secondary" onClick={handleClose}>
            Cancel
          </CancelButton>
          <AssignButton 
            variant="primary" 
            onClick={handleAssign}
            disabled={selectedDrivers.length === 0 && selectedVehicles.length === 0}
          >
            Assign {selectedTrips.length} Trip{selectedTrips.length !== 1 ? 's' : ''}
          </AssignButton>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default AssignmentModal;