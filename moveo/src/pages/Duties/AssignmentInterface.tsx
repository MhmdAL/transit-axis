import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiMap, FiCheck, FiUsers, FiTruck, FiRefreshCw, FiPlus } from 'react-icons/fi';
import { Button } from '../../styles/GlobalStyles';
import { 
  PageContainer,
  PageHeader,
  PageTitle,
  HeaderActions,
  SearchContainer,
  SearchInput,
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell
} from '../../components/Common/CommonStyles';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import AssignmentModal from '../../components/Modals/AssignmentModal';
import BlockAssignmentModal from '../../components/Modals/BlockAssignmentModal';
import RunAssignmentModal from '../../components/Modals/RunAssignmentModal';
import MultiSelectSearchDropdown from '../../components/UI/DropDowns/MultiSelectSearchDropdown';
import { dataService } from '../../services/dataService';
import { Route, Duty, Driver, Vehicle } from '../../types';

const AssignmentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const SelectionControls = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  flex-wrap: nowrap;
  align-items: center;
  
  @media (max-width: 1200px) {
    flex-wrap: wrap;
  }
`;

const DateSelector = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  min-width: 300px;
`;

const DateRangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const DateInput = styled.input`
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

const SearchDropdownWrapper = styled.div`
  min-width: 200px;
  flex: 1;
  max-width: 250px;
`;

const RouteSelect = styled.select`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.card};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: ${theme.colors.primary};
`;

const FloatingActionBar = styled.div<{ visible: boolean }>`
  position: fixed;
  bottom: ${theme.spacing.xl};
  right: ${theme.spacing.xl};
  background: ${theme.colors.card};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.lg};
  display: ${({ visible }) => visible ? 'flex' : 'none'};
  align-items: center;
  gap: ${theme.spacing.md};
  z-index: ${theme.zIndex.modal};
  transition: all 0.3s ease;
`;

const SelectionCount = styled.div`
  color: ${theme.colors.textPrimary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const AssignButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing['3xl']};
  color: ${theme.colors.textSecondary};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.textSecondary};
`;

const UnsavedChangesWarning = styled.div`
  background: ${theme.colors.warning}20;
  border: 1px solid ${theme.colors.warning};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.md};
`;

const WarningText = styled.div`
  color: ${theme.colors.warning};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const SaveButton = styled.button`
  background: ${theme.colors.primary};
  color: white;
  border: none;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  &:hover:not(:disabled) {
    background: ${theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DiscardButton = styled.button`
  background: transparent;
  color: ${theme.colors.textSecondary};
  border: 1px solid ${theme.colors.border};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.surfaceHover};
    border-color: ${theme.colors.textSecondary};
  }
`;

const ModifiedRow = styled.tr<{ isModified: boolean; isNewlyAssigned: boolean }>`
  background: ${props => {
    if (props.isNewlyAssigned) return `${theme.colors.success}15`;
    if (props.isModified) return `${theme.colors.warning}15`;
    return 'transparent';
  }};
  border-left: 3px solid ${props => {
    if (props.isNewlyAssigned) return theme.colors.success;
    if (props.isModified) return theme.colors.warning;
    return 'transparent';
  }};
`;

const StatusIndicator = styled.span<{ isModified: boolean; isNewlyAssigned: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => {
      if (props.isNewlyAssigned) return theme.colors.success;
      if (props.isModified) return theme.colors.warning;
      return 'transparent';
    }};
  }
`;

const ColoredTableCell = styled(TableCell)<{ $bgColor?: string; $clickable?: boolean }>`
  background: ${props => props.$bgColor ? `color-mix(in srgb, ${props.$bgColor} 15%, transparent)` : 'transparent'};
  border-left: ${props => props.$bgColor ? `3px solid ${props.$bgColor}` : 'none'};
  transition: all 0.2s ease;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  
  ${props => props.$bgColor && `
    &:hover {
      background: color-mix(in srgb, ${props.$bgColor} 25%, transparent);
    }
  `}
  
  ${props => props.$clickable && !props.$bgColor && `
    &:hover {
      background: ${theme.colors.surfaceHover};
    }
  `}
`;

interface Trip {
  id: string;
  tripNumber: string;
  routeName: string;
  date: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  status: 'planned' | 'in-progress' | 'completed';
  assignedDriver?: string;
  assignedVehicle?: string;
  dutyType: string;
  // Assignment tracking
  originalAssignedDriver?: string;
  originalAssignedVehicle?: string;
  isModified?: boolean;
  isNewlyAssigned?: boolean;
  // Duty-specific fields
  dutyId: string;
  driverId?: string;
  vehicleId?: string;
  driver?: any; // Will be the actual driver object from API
  vehicle?: any; // Will be the actual vehicle object from API
  // Block and Run codes
  vehicleBlockCode?: string;
  vehicleBlockColor?: string;
  driverRunCode?: string;
  driverRunColor?: string;
}

const AssignmentInterface: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDateRange, setSelectedDateRange] = useState(() => {
    const today = new Date();
    return {
      startDate: today.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    };
  });
  const [selectedRoutes, setSelectedRoutes] = useState<Route[]>([]);
  const [selectedDrivers, setSelectedDrivers] = useState<Driver[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<Vehicle[]>([]);
  const [selectedDutyTypes, setSelectedDutyTypes] = useState<string[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [selectedTrips, setSelectedTrips] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  
  // State management for changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalTrips, setOriginalTrips] = useState<Trip[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Block and Run assignment modals
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showRunModal, setShowRunModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<{
    code: string;
    color?: string;
    currentVehicle?: string;
    dutyIds: string[];
  } | null>(null);
  const [selectedRun, setSelectedRun] = useState<{
    code: string;
    color?: string;
    currentDriver?: string;
    dutyIds: string[];
  } | null>(null);
  
  // Routes state
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load routes on component mount
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        setRoutesLoading(true);
        setError(null);
        const routesData = await dataService.getRoutes();
        setRoutes(routesData);
      } catch (error) {
        console.error('Error loading routes:', error);
        setError('Failed to load routes. Please try again.');
      } finally {
        setRoutesLoading(false);
      }
    };

    loadRoutes();
  }, []);

  useEffect(() => {
    // Check if at least one filter is selected
    const hasFilter = selectedDateRange.startDate && selectedDateRange.endDate && 
      (selectedRoutes.length > 0 || selectedDrivers.length > 0 || selectedVehicles.length > 0 || selectedDutyTypes.length > 0);
    
    if (hasFilter) {
      loadTrips();
    } else {
      setTrips([]);
      setFilteredTrips([]);
    }
  }, [selectedDateRange, selectedRoutes, selectedDrivers, selectedVehicles, selectedDutyTypes]);

  useEffect(() => {
    setSelectedTrips(new Set()); // Clear selection when trips change
  }, [trips]);

  // Search functions for SearchDropdown components
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

  const loadTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters for backend filtering
      const queryParams: any = {
        startDate: selectedDateRange.startDate,
        endDate: selectedDateRange.endDate
      };
      
      // Add duty type filter
      if (selectedDutyTypes.length > 0) {
        queryParams.dutyType = selectedDutyTypes[0]; // Backend currently supports single duty type
      } else {
        queryParams.dutyType = 'TRIP'; // Default to TRIP if no duty type selected
      }
      
      // Add multi-select filters to backend query
      if (selectedRoutes.length > 0) {
        queryParams.routeIds = selectedRoutes.map(route => route.id);
      }
      
      if (selectedDrivers.length > 0) {
        queryParams.driverIds = selectedDrivers.map(driver => driver.id);
      }
      
      if (selectedVehicles.length > 0) {
        queryParams.vehicleIds = selectedVehicles.map(vehicle => vehicle.id);
      }
      
      const duties = await dataService.getDuties(queryParams);
      
      // Convert duties to trips format and sort by start time
      const tripsData: Trip[] = duties
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()) // Sort duties by start time first
        .map((duty, index) => {
          const routeName = duty.dutyType === 'TRIP' 
            ? (duty.tripDuties?.[0]?.route?.name || 'Unknown Route')
            : '-';
          const driverName = (duty.driver as any)?.user ? `${(duty.driver as any).user.name}` : undefined;
          const vehicleName = duty.vehicle ? `${(duty.vehicle as any).fleetNo || ''} - ${(duty.vehicle as any).plateNo || ''}`.trim() : undefined;
          
          // Extract block and run codes
          const block = (duty as any).block;
          const run = (duty as any).run;
          const vehicleBlockCode = block?.code; // Remove date suffix
          const driverRunCode = run?.code; // Remove date suffix
          
          return {
            id: duty.id,
            dutyId: duty.id,
            tripNumber: `T-${String(index + 1).padStart(3, '0')}`,
            routeName,
            date: new Date(duty.startTime).toLocaleDateString(),
            scheduledStartTime: new Date(duty.startTime).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            }),
            scheduledEndTime: new Date(duty.endTime).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            }),
            status: 'planned' as const,
            assignedDriver: driverName,
            assignedVehicle: vehicleName,
            dutyType: duty.dutyType,
            driverId: duty.driverId,
            vehicleId: duty.vehicleId,
            driver: duty.driver,
            vehicle: duty.vehicle,
            vehicleBlockCode: vehicleBlockCode,
            vehicleBlockColor: (block as any)?.vehicleBlockTemplate?.color,
            driverRunCode: driverRunCode,
            driverRunColor: (run as any)?.driverRunTemplate?.color,
            // Initialize tracking fields
            originalAssignedDriver: driverName,
            originalAssignedVehicle: vehicleName,
            isModified: false,
            isNewlyAssigned: false
          };
        });
      
      setTrips(tripsData);
      setFilteredTrips(tripsData);
      setOriginalTrips([...tripsData]); // Store original data
      setHasUnsavedChanges(false); // Reset change tracking
    } catch (error) {
      console.error('Error loading trips:', error);
      setError('Failed to load trip duties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTrip = (tripId: string) => {
    const newSelected = new Set(selectedTrips);
    if (newSelected.has(tripId)) {
      newSelected.delete(tripId);
    } else {
      newSelected.add(tripId);
    }
    setSelectedTrips(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTrips.size === filteredTrips.length) {
      setSelectedTrips(new Set());
    } else {
      setSelectedTrips(new Set(filteredTrips.map(trip => trip.id)));
    }
  };

  const handleAssign = () => {
    setShowAssignmentModal(true);
  };

  const handleCreateDuty = () => {
    navigate('/duties/create');
  };

  const handleAssignmentComplete = (assignmentData: any) => {
    console.log('Assignment data:', assignmentData);
    console.log('Selected trips:', Array.from(selectedTrips));
    console.log('Selected drivers:', assignmentData.selectedDrivers?.map((d: any) => d.name) || []);
    console.log('Selected vehicles:', assignmentData.selectedVehicles?.map((v: any) => `${v.plateNo} - ${v.fleetNo}`) || []);
    
    // Apply assignments to selected trips
    const updatedTrips = trips.map(trip => {
      if (selectedTrips.has(trip.id)) {
        const tripIndex = Array.from(selectedTrips).indexOf(trip.id);
        
        // Handle driver assignment (if drivers are selected)
        let assignedDriver = null;
        let driverId = trip.driverId;
        let driver = trip.driver;
        let assignedDriverName = trip.assignedDriver;
        
        if (assignmentData.selectedDrivers.length > 0) {
          const driverIndex = tripIndex % assignmentData.selectedDrivers.length;
          assignedDriver = assignmentData.selectedDrivers[driverIndex];
          driverId = assignedDriver.id;
          driver = assignedDriver;
          assignedDriverName = assignedDriver.name;
        }
        
        // Handle vehicle assignment (if vehicles are selected)
        let assignedVehicle = null;
        let vehicleId = trip.vehicleId;
        let vehicle = trip.vehicle;
        let assignedVehicleName = trip.assignedVehicle;
        
        if (assignmentData.selectedVehicles.length > 0) {
          const vehicleIndex = tripIndex % assignmentData.selectedVehicles.length;
          assignedVehicle = assignmentData.selectedVehicles[vehicleIndex];
          vehicleId = assignedVehicle.id;
          vehicle = assignedVehicle;
          assignedVehicleName = `${assignedVehicle.plateNo} - ${assignedVehicle.fleetNo}`;
        }
        
        return {
          ...trip,
          assignedDriver: assignedDriverName,
          assignedVehicle: assignedVehicleName,
          driverId: driverId,
          vehicleId: vehicleId,
          driver: driver,
          vehicle: vehicle,
          isModified: true,
          isNewlyAssigned: !trip.assignedDriver && !trip.assignedVehicle
        };
      }
      return trip;
    });
    
    setTrips(updatedTrips);
    setFilteredTrips(updatedTrips);
    setHasUnsavedChanges(true);
    setSelectedTrips(new Set()); // Clear selection after assignment
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      
      // Get modified trips
      const modifiedTrips = trips.filter(trip => trip.isModified);
      
      if (modifiedTrips.length === 0) {
        console.log('No changes to save');
        return;
      }
      
      // Prepare assignments for bulk update
      const assignments = modifiedTrips.map(trip => ({
        dutyId: trip.dutyId,
        driverId: trip.driverId,
        vehicleId: trip.vehicleId
      }));
      
      // Call bulk update API
      await dataService.bulkUpdateDutyAssignments({ assignments });
      
      // Update all trips to reflect saved state
      const updatedTrips = trips.map(trip => ({
        ...trip,
        originalAssignedDriver: trip.assignedDriver,
        originalAssignedVehicle: trip.assignedVehicle,
        isModified: false,
        isNewlyAssigned: false
      }));
      
      setTrips(updatedTrips);
      setFilteredTrips(updatedTrips);
      setOriginalTrips(updatedTrips);
      setHasUnsavedChanges(false);
      
      console.log('Changes saved successfully');
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    if (window.confirm('Are you sure you want to discard all unsaved changes?')) {
      setTrips([...originalTrips]);
      setFilteredTrips([...originalTrips]);
      setHasUnsavedChanges(false);
      setSelectedTrips(new Set());
    }
  };

  const handleBlockClick = (blockCode: string, blockColor?: string) => {
    // Find all duties with this block code
    const dutiesWithBlock = trips.filter(trip => trip.vehicleBlockCode === blockCode);
    
    if (dutiesWithBlock.length === 0) return;
    
    // Get current vehicle assignment (they should all be the same for a block)
    const currentVehicle = dutiesWithBlock[0]?.assignedVehicle;
    
    setSelectedBlock({
      code: blockCode,
      color: blockColor,
      currentVehicle,
      dutyIds: dutiesWithBlock.map(t => t.dutyId)
    });
    setShowBlockModal(true);
  };

  const handleRunClick = (runCode: string, runColor?: string) => {
    // Find all duties with this run code
    const dutiesWithRun = trips.filter(trip => trip.driverRunCode === runCode);
    
    if (dutiesWithRun.length === 0) return;
    
    // Get current driver assignment (they should all be the same for a run)
    const currentDriver = dutiesWithRun[0]?.assignedDriver;
    
    setSelectedRun({
      code: runCode,
      color: runColor,
      currentDriver,
      dutyIds: dutiesWithRun.map(t => t.dutyId)
    });
    setShowRunModal(true);
  };

  const handleBlockAssignment = async (vehicleId: string | null) => {
    if (!selectedBlock) return;

    try {
      // Find the vehicle object if an ID was provided
      let vehicle: Vehicle | null = null;
      let vehicleName: string | undefined = undefined;
      
      if (vehicleId) {
        const allVehicles = await dataService.getVehicles({ limit: 1000 });
        const foundVehicle = allVehicles.find(v => v.id === vehicleId);
        if (foundVehicle) {
          vehicle = foundVehicle;
          vehicleName = `${foundVehicle.plateNo} - ${foundVehicle.fleetNo}`;
        }
      }

      // Update all trips with this block code
      const updatedTrips = trips.map(trip => {
        if (selectedBlock.dutyIds.includes(trip.dutyId)) {
          return {
            ...trip,
            assignedVehicle: vehicleName,
            vehicleId: vehicleId || undefined,
            vehicle: vehicle,
            isModified: true,
            isNewlyAssigned: !trip.assignedVehicle && vehicleName !== undefined
          };
        }
        return trip;
      });

      setTrips(updatedTrips);
      setFilteredTrips(updatedTrips);
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error('Error assigning vehicle to block:', error);
      alert('Failed to assign vehicle. Please try again.');
    }
  };

  const handleRunAssignment = async (driverId: string | null) => {
    if (!selectedRun) return;

    try {
      // Find the driver object if an ID was provided
      let driver: Driver | null = null;
      let driverName: string | undefined = undefined;
      
      if (driverId) {
        const allDrivers = await dataService.getDrivers({ limit: 1000 });
        const foundDriver = allDrivers.find(d => d.id === driverId);
        if (foundDriver) {
          driver = foundDriver;
          driverName = foundDriver.name;
        }
      }

      // Update all trips with this run code
      const updatedTrips = trips.map(trip => {
        if (selectedRun.dutyIds.includes(trip.dutyId)) {
          return {
            ...trip,
            assignedDriver: driverName,
            driverId: driverId || undefined,
            driver: driver,
            isModified: true,
            isNewlyAssigned: !trip.assignedDriver && driverName !== undefined
          };
        }
        return trip;
      });

      setTrips(updatedTrips);
      setFilteredTrips(updatedTrips);
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error('Error assigning driver to run:', error);
      alert('Failed to assign driver. Please try again.');
    }
  };

  const formatTime = (time: string) => {
    return time;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return 'Planned';
    }
  };

  const isAllSelected = filteredTrips.length > 0 && selectedTrips.size === filteredTrips.length;
  const isIndeterminate = selectedTrips.size > 0 && selectedTrips.size < filteredTrips.length;


  return (
    <PageContainer className="fade-in">
      <PageHeader>
        <PageTitle>Duty Assignment</PageTitle>
        <HeaderActions>
          <Button onClick={handleCreateDuty} variant="primary">
            <FiPlus style={{ marginRight: '8px' }} />
            Generate Duties
          </Button>
        </HeaderActions>
      </PageHeader>

      <AssignmentContainer>
      <SelectionControls>
        <DateSelector>
          <FiCalendar size={20} color={theme.colors.primary} />
          <DateRangeContainer>
            <DateInput
              type="date"
              value={selectedDateRange.startDate}
              onChange={(e) => setSelectedDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              placeholder="Start Date"
            />
            <span style={{ color: theme.colors.textMuted }}>to</span>
            <DateInput
              type="date"
              value={selectedDateRange.endDate}
              onChange={(e) => setSelectedDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              placeholder="End Date"
            />
          </DateRangeContainer>
        </DateSelector>

        <SearchDropdownWrapper>
          <MultiSelectSearchDropdown
            values={selectedRoutes}
            onChange={setSelectedRoutes}
            onSearch={async (searchTerm) => {
              if (!searchTerm.trim()) return routes;
              return routes.filter(route => 
                route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                route.code.toLowerCase().includes(searchTerm.toLowerCase())
              );
            }}
            displayValue={(route) => route.name}
            renderItem={(route) => (
              <div style={{ padding: '4px 0' }}>
                <div style={{ fontWeight: '500', fontSize: '14px' }}>
                  {route.name}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                  {route.code}
                </div>
              </div>
            )}
            placeholder="Search routes..."
            disabled={routesLoading}
          />
        </SearchDropdownWrapper>

        <SearchDropdownWrapper>
          <MultiSelectSearchDropdown
            values={selectedDrivers}
            onChange={setSelectedDrivers}
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
        </SearchDropdownWrapper>

        <SearchDropdownWrapper>
          <MultiSelectSearchDropdown
            values={selectedVehicles}
            onChange={setSelectedVehicles}
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
        </SearchDropdownWrapper>

        <SearchDropdownWrapper>
          <MultiSelectSearchDropdown
            values={selectedDutyTypes.map(type => ({ id: type, name: type }))}
            onChange={(types) => setSelectedDutyTypes(types.map(t => t.id))}
            onSearch={async (searchTerm) => {
              const dutyTypes = ['TRIP', 'WASHING', 'MAINTENANCE'];
              if (!searchTerm.trim()) return dutyTypes.map(type => ({ id: type, name: type }));
              return dutyTypes
                .filter(type => type.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(type => ({ id: type, name: type }));
            }}
            displayValue={(type) => type.name}
            renderItem={(type) => (
              <div style={{ padding: '4px 0' }}>
                <div style={{ fontWeight: '500', fontSize: '14px' }}>
                  {type.name}
                </div>
              </div>
            )}
            placeholder="Search duty types..."
          />
        </SearchDropdownWrapper>
      </SelectionControls>

      {hasUnsavedChanges && (
        <UnsavedChangesWarning>
          <WarningText>
            <FiRefreshCw size={16} />
            You have unsaved changes. Save your changes to keep them.
          </WarningText>
          <ActionButtons>
            <DiscardButton onClick={handleDiscardChanges}>
              Discard Changes
            </DiscardButton>
            <SaveButton onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? (
                <>
                  <div style={{ width: 12, height: 12, border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  Saving...
                </>
              ) : (
                <>
                  <FiRefreshCw size={14} />
                  Save Changes
                </>
              )}
            </SaveButton>
          </ActionButtons>
        </UnsavedChangesWarning>
      )}

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

      {loading ? (
        <LoadingState>
          <p>Loading trips...</p>
        </LoadingState>
      ) : !(selectedRoutes.length > 0 || selectedDrivers.length > 0 || selectedVehicles.length > 0 || selectedDutyTypes.length > 0) ? (
        <EmptyState>
          <FiMap size={48} color={theme.colors.textMuted} style={{ marginBottom: theme.spacing.lg }} />
          <h3 style={{ color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }}>
            Select a Filter
          </h3>
          <p>Please select a route, driver, vehicle, or duty type to view and manage assignments</p>
        </EmptyState>
      ) : filteredTrips.length === 0 ? (
        <EmptyState>
          <FiMap size={48} color={theme.colors.textMuted} style={{ marginBottom: theme.spacing.lg }} />
          <h3 style={{ color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }}>
            No Trips Found
          </h3>
          <p>No trips found for the selected filters from {new Date(selectedDateRange.startDate).toLocaleDateString()} to {new Date(selectedDateRange.endDate).toLocaleDateString()}</p>
        </EmptyState>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableHeaderCell>
                <Checkbox
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={handleSelectAll}
                />
              </TableHeaderCell>
              <TableHeaderCell>Date</TableHeaderCell>
              <TableHeaderCell>Time</TableHeaderCell>
              <TableHeaderCell>Trip #</TableHeaderCell>
              <TableHeaderCell>Route</TableHeaderCell>
              <TableHeaderCell>Duty Type</TableHeaderCell>
              <TableHeaderCell>Vehicle Block</TableHeaderCell>
              <TableHeaderCell>Driver Run</TableHeaderCell>
              <TableHeaderCell>Driver</TableHeaderCell>
              <TableHeaderCell>Vehicle</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {filteredTrips.map((trip) => (
                <ModifiedRow 
                  key={trip.id} 
                  isModified={trip.isModified || false} 
                  isNewlyAssigned={trip.isNewlyAssigned || false}
                >
                  <TableCell>
                    <Checkbox
                      type="checkbox"
                      checked={selectedTrips.has(trip.id)}
                      onChange={() => handleSelectTrip(trip.id)}
                    />
                  </TableCell>
                  <TableCell>{trip.date}</TableCell>
                  <TableCell>
                    {formatTime(trip.scheduledStartTime)} - {formatTime(trip.scheduledEndTime)}
                  </TableCell>
                  <TableCell>{trip.tripNumber}</TableCell>
                  <TableCell>{trip.routeName}</TableCell>
                  <TableCell>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: trip.dutyType === 'TRIP' ? '#e3f2fd' : trip.dutyType === 'WASHING' ? '#f3e5f5' : '#fff3e0',
                      color: trip.dutyType === 'TRIP' ? '#1976d2' : trip.dutyType === 'WASHING' ? '#7b1fa2' : '#f57c00'
                    }}>
                      {trip.dutyType}
                    </span>
                  </TableCell>
                  <ColoredTableCell 
                    $bgColor={trip.vehicleBlockCode ? trip.vehicleBlockColor : undefined}
                    $clickable={true}
                    onClick={() => trip.vehicleBlockCode && handleBlockClick(trip.vehicleBlockCode, trip.vehicleBlockColor)}
                  >
                    {trip.vehicleBlockCode ? (
                      <span style={{ 
                        fontFamily: 'monospace', 
                        fontWeight: '600',
                        color: trip.vehicleBlockColor || theme.colors.primary
                      }}>
                        {trip.vehicleBlockCode}
                      </span>
                    ) : (
                      <span style={{ color: theme.colors.textMuted, fontStyle: 'italic' }}>
                        -
                      </span>
                    )}
                  </ColoredTableCell>
                  <ColoredTableCell 
                    $bgColor={trip.driverRunCode ? trip.driverRunColor : undefined}
                    $clickable={true}
                    onClick={() => trip.driverRunCode && handleRunClick(trip.driverRunCode, trip.driverRunColor)}
                  >
                    {trip.driverRunCode ? (
                      <span style={{ 
                        fontFamily: 'monospace', 
                        fontWeight: '600',
                        color: trip.driverRunColor || theme.colors.primary
                      }}>
                        {trip.driverRunCode}
                      </span>
                    ) : (
                      <span style={{ color: theme.colors.textMuted, fontStyle: 'italic' }}>
                        -
                      </span>
                    )}
                  </ColoredTableCell>
                  <TableCell>
                    <StatusIndicator isModified={trip.isModified || false} isNewlyAssigned={trip.isNewlyAssigned || false}>
                      {trip.assignedDriver ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
                          <FiUsers size={14} color={theme.colors.success} />
                          {trip.assignedDriver}
                        </div>
                      ) : (
                        <span style={{ color: theme.colors.textMuted }}>Unassigned</span>
                      )}
                    </StatusIndicator>
                  </TableCell>
                  <TableCell>
                    <StatusIndicator isModified={trip.isModified || false} isNewlyAssigned={trip.isNewlyAssigned || false}>
                      {trip.assignedVehicle ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
                          <FiTruck size={14} color={theme.colors.success} />
                          {trip.assignedVehicle}
                        </div>
                      ) : (
                        <span style={{ color: theme.colors.textMuted }}>Unassigned</span>
                      )}
                    </StatusIndicator>
                  </TableCell>
                </ModifiedRow>
              ))}
            </TableBody>
          </Table>

          <FloatingActionBar visible={selectedTrips.size > 0}>
            <SelectionCount>
              {selectedTrips.size} trip{selectedTrips.size !== 1 ? 's' : ''} selected
            </SelectionCount>
            <AssignButton variant="primary" onClick={handleAssign}>
              <FiUsers />
              Assign
            </AssignButton>
          </FloatingActionBar>
        </>
      )}

      <AssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        selectedTrips={Array.from(selectedTrips)}
        onAssign={handleAssignmentComplete}
      />

      <BlockAssignmentModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        blockCode={selectedBlock?.code}
        blockColor={selectedBlock?.color}
        currentVehicle={selectedBlock?.currentVehicle}
        dutyCount={selectedBlock?.dutyIds.length || 0}
        onAssign={handleBlockAssignment}
      />

      <RunAssignmentModal
        isOpen={showRunModal}
        onClose={() => setShowRunModal(false)}
        runCode={selectedRun?.code}
        runColor={selectedRun?.color}
        currentDriver={selectedRun?.currentDriver}
        dutyCount={selectedRun?.dutyIds.length || 0}
        onAssign={handleRunAssignment}
      />
      </AssignmentContainer>
    </PageContainer>
  );
};

export default AssignmentInterface;
