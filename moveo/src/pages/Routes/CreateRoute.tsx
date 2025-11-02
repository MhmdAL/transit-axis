import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FiMap, 
  FiSave, 
  FiArrowLeft, 
  FiPlus, 
  FiX, 
  FiSearch,
  FiMove,
  FiMapPin
} from 'react-icons/fi';
import { theme } from '../../styles/theme';
import { Card, Button, Input, Select } from '../../styles/GlobalStyles';
import RouteMap from '../../components/Map/RouteMap';
import { Route, Stop } from '../../types';
import { dataService } from '../../services/dataService';
import { RoutingService } from '../../services/routingService';

const CreateRouteContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const BackButton = styled(Button)`
  padding: ${theme.spacing.sm};
`;

const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const ContentLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  height: calc(100vh - 120px);
`;

const RouteInfoCard = styled(Card)`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.md};
`;

const MapContainer = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${theme.shadows.lg};
`;


const RouteSummary = styled.div`
  position: absolute;
  bottom: 80px;
  left: ${theme.spacing.lg};
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  backdrop-filter: blur(10px);
  z-index: 1000;
  min-width: 200px;
  max-width: calc(100% - ${theme.spacing.xl} - 320px - ${theme.spacing.lg});
  max-height: calc(100% - ${theme.spacing.xl} * 2);
  overflow-y: auto;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: ${theme.spacing.xs} 0;
  font-size: ${theme.typography.fontSize.sm};
`;

const SummaryLabel = styled.span`
  opacity: 0.8;
`;

const SummaryValue = styled.span`
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const Label = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
`;

const RequiredIndicator = styled.span`
  color: ${theme.colors.error};
`;

const SectionTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;


const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  padding-top: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.textMuted};
`;

const ModeIndicator = styled.div<{ $isAddingMode: boolean }>`
  position: absolute;
  top: ${theme.spacing.md};
  right: ${theme.spacing.md};
  background-color: ${theme.colors.primary};
  color: white;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  z-index: 1000;
  box-shadow: ${theme.shadows.md};
  opacity: 0.9;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }
`;


const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const ModalContent = styled.div`
  background-color: ${theme.colors.card};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  width: 90%;
  max-width: 400px;
  box-shadow: ${theme.shadows.lg};
`;

const ModalTitle = styled.h3`
  margin: 0 0 ${theme.spacing.md} 0;
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.textPrimary};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const ModalFormGroup = styled.div`
  margin-bottom: ${theme.spacing.md};
`;

const ModalLabel = styled.label`
  display: block;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.xs};
`;

const ModalInput = styled(Input)`
  width: 100%;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${theme.spacing.lg};
`;

const CreateRoute: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });
  const [availableStops, setAvailableStops] = useState<Stop[]>([]);
  const [selectedStops, setSelectedStops] = useState<Stop[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStops, setFilteredStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllStops, setShowAllStops] = useState(false);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [manualStopCounter, setManualStopCounter] = useState(1);
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const [isManualStopModalOpen, setIsManualStopModalOpen] = useState(false);
  const [tempManualStop, setTempManualStop] = useState<Stop | null>(null);

  useEffect(() => {
    const loadRouteAndStops = async () => {
      try {
        if (id) {
          const route = await dataService.getRouteById(id);
          if (route) {
            const routeData = route as any;
            setFormData({
              name: routeData.name,
              code: routeData.code,
              description: routeData.description || ''
            });
            // Extract stops from routeStops structure (backend format)
            const stopsFromRoute = (routeData.routeStops || routeData.stops || [])
              .map((item: any) => {
                // Handle both direct stops and nested stop structure
                const stopData = item.stop || item;
                return {
                  id: stopData.id,
                  name: stopData.name,
                  code: stopData.code,
                  location: {
                    lat: stopData.location?.lat || stopData.location?.latitude,
                    lon: stopData.location?.lon || stopData.location?.longitude
                  },
                  order: item.stopOrder || 0,
                  _segmentPath: item.path // Store segment path for later use
                };
              })
              // Sort by stopOrder from backend
              .sort((a: any, b: any) => a.order - b.order);
            
            setSelectedStops(stopsFromRoute);
            
            // If we have segment paths stored, pass them as precalculated route data
            // This prevents RouteMap from recalculating via ORS
            const segmentPaths = (routeData.routeStops || []).map((item: any) => item.path).filter((p: any) => p);
            if (segmentPaths.length > 0) {
              // For now, store segment paths - RouteMap will use them to skip recalculation
              // setPrecalculatedRouteData({
              //   hasSegments: true,
              //   segmentPaths: segmentPaths,
              //   segments: routeData.routeStops
              // });
            }
          } else {
            throw new Error('Route not found');
          }
        } else {
          setIsAddingMode(true);
        }

        const stops = await dataService.getStops();
        setAvailableStops(stops);
        setFilteredStops(stops);
      } catch (error) {
        console.error('Error loading route or stops:', error);
        alert('Error loading route or stops. Please try again.');
        navigate('/routes');
      } finally {
        setLoading(false);
      }
    };

    loadRouteAndStops();
  }, [id, navigate]);

  // Handler for when user clicks the map in adding mode
  const handleMapClickForAddingStop = (lat: number, lng: number) => {
    console.log('✅ Map clicked at:', { lat, lng });
    const manualStop: Stop = {
      id: `0`,
      name: `Stop ${selectedStops.length + 1}`,
      code: `STOP-${manualStopCounter}`,
      order: selectedStops.length,
      location: {
        lat: parseFloat(lat.toFixed(6)),
        lon: parseFloat(lng.toFixed(6))
      }
    };
    setTempManualStop(manualStop);
    setIsManualStopModalOpen(true);
  };

  const handleManualStopModalChange = (field: string, value: string) => {
    if (!tempManualStop) return;
    setTempManualStop(prev =>
      prev ? { ...prev, [field]: value } : null
    );
  };

  const handleConfirmManualStop = () => {
    if (!tempManualStop || !tempManualStop.name || !tempManualStop.code) {
      alert('Please enter both name and code for the stop.');
      return;
    }
    
    // Calculate segment path from previous stop if exists
    const addManualStop = async () => {
      let segmentPath: string | null = null;
      const newStopOrder = selectedStops.length; // Add at end
      
      if (selectedStops.length > 0) {
        try {
          const prevStop = selectedStops[selectedStops.length - 1];
          const waypoints = [
            { lat: prevStop.location.lat, lng: prevStop.location.lon },
            { lat: tempManualStop.location.lat, lng: tempManualStop.location.lon }
          ];
          const routeData = await RoutingService.calculateRoute(waypoints) as any;
          segmentPath = routeData?.geometry || null;
        } catch (error) {
          console.error('Error calculating segment path:', error);
        }
      }
      
      setSelectedStops(prev => [...prev, { ...tempManualStop, _segmentPath: segmentPath, order: newStopOrder } as any]);
    setManualStopCounter(prev => prev + 1);
    setIsManualStopModalOpen(false);
    setTempManualStop(null);
    };
    
    addManualStop();
  };

  const handleCancelManualStop = () => {
    setIsManualStopModalOpen(false);
    setTempManualStop(null);
  };

  useEffect(() => {
    const filtered = availableStops.filter(stop =>
      stop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stop.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStops(filtered);
  }, [availableStops, searchTerm]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddStop = (stop: Stop) => {
    if (!selectedStops.find(s => String(s.id) === String(stop.id))) {
      // Calculate segment path from previous stop if exists
      const calculateSegmentPath = async () => {
        let segmentPath: string | null = null;
        const newStopOrder = selectedStops.length; // Add at end
        
        if (selectedStops.length > 0) {
          try {
            const prevStop = selectedStops[selectedStops.length - 1];
            const waypoints = [
              { lat: prevStop.location.lat, lng: prevStop.location.lon },
              { lat: stop.location.lat, lng: stop.location.lon }
            ];
            const routeData = await RoutingService.calculateRoute(waypoints) as any;
            segmentPath = routeData?.geometry || null;
          } catch (error) {
            console.error('Error calculating segment path:', error);
          }
        }
        
        // Add stop with its stopOrder
        setSelectedStops(prev => [...prev, { ...stop, _segmentPath: segmentPath, order: newStopOrder } as any]);
      };
      
      calculateSegmentPath();
    }
  };

  const handleMapStopClick = (stop: Stop) => {
    handleAddStop(stop);
  };

  const handleFitRoute = () => {
    setSelectedStops(prev => [...prev]);
  };

  const handleToggleShowAllStops = () => {
    setShowAllStops(prev => !prev);
  };

  const handleRemoveStop = async (stopOrder: number) => {
    // Create a new list by filtering out the stop
    let newStops = selectedStops.filter((stop: any) => stop.order !== stopOrder);
    
    if (newStops.length === 0) {
      setSelectedStops(newStops);
      return;
    }
    
    // If first stop was deleted, clear the path of the new first stop
    if (stopOrder === 0) {
      newStops = newStops.map((stop: any, idx) => ({ 
        ...stop, 
        order: idx, 
        _segmentPath: idx === 0 ? null : stop._segmentPath 
      } as any));
      setSelectedStops(newStops);
      return;
    }
    
    // If there's a stop that needs recalculation (stopOrder N-1 connecting to N+1)
    if (stopOrder > 0) {
      // Find stops by their order property in the ORIGINAL array
      const fromStop = selectedStops.find((s: any) => s.order === stopOrder - 1) as any;
      const toStop = selectedStops.find((s: any) => s.order === stopOrder + 1) as any;
      
      if (fromStop && toStop) {
        try {
          const waypoints = [
            { lat: fromStop.location.lat, lng: fromStop.location.lon },
            { lat: toStop.location.lat, lng: toStop.location.lon }
          ];
          
          const routeData = await RoutingService.calculateRoute(waypoints) as any;
          const segmentPath = routeData?.geometry || null;
          
          // Update the specific stop with the recalculated path
          newStops = newStops.map((stop: any) => 
            stop.order === stopOrder + 1 
              ? { ...stop, _segmentPath: segmentPath }
              : stop
          );
        } catch (error) {
          console.error('Error recalculating segment path:', error);
        }
      }
    }
    
    // Reassign order to all remaining stops
    newStops = newStops.map((stop: any, idx) => ({ ...stop, order: idx } as any));
    
    // Single setSelectedStops call with all updates
    setSelectedStops(newStops);
  };

  const handleMoveStop = (fromIndex: number, toIndex: number) => {
    const newStops = [...selectedStops];
    const [movedStop] = newStops.splice(fromIndex, 1);
    newStops.splice(toIndex, 0, movedStop);
    setSelectedStops(newStops);
  };

  const handleToggleAddingMode = () => {
    setIsAddingMode(prev => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code) {
      alert('Please fill in all required fields and select at least 2 stops.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Use pre-calculated segment paths if available, otherwise calculate them
      const segmentPaths: (string | null)[] = [];
      
      if (selectedStops.length >= 2) {
        // For each stop, use its pre-calculated _segmentPath if available
        for (let i = 0; i < selectedStops.length; i++) {
          const stop = selectedStops[i] as any;
          // stopOrder should equal i, segment path is stored on the stop
          if (stop._segmentPath !== undefined) {
            // Use pre-calculated path
            segmentPaths.push(stop._segmentPath);
          } else if (i > 0) {
            // Calculate if not pre-calculated
            try {
              const fromStop = selectedStops[i - 1];
              const toStop = selectedStops[i];
              
              const waypoints = [
                { lat: fromStop.location.lat, lng: fromStop.location.lon },
                { lat: toStop.location.lat, lng: toStop.location.lon }
              ];
              
              const routeData = await RoutingService.calculateRoute(waypoints) as any;
              segmentPaths.push(routeData?.geometry || null);
            } catch (segmentError) {
              console.error(`Error calculating segment ${i}:`, segmentError);
              segmentPaths.push(null);
            }
          } else {
            // First stop has no incoming path
            segmentPaths.push(null);
          }
        }
      }

      const newRoute = {
        name: formData.name,
        code: formData.code,
        stops: selectedStops.map((stop, idx) => ({...stop, stopOrder: idx})),
        segmentPaths: segmentPaths
      };

      console.log('Creating/Updating route:', newRoute);
      
      if (id) {
        await dataService.updateRoute(id, { ...newRoute, id });
        // alert('Route updated successfully!');
      } else {
      await dataService.createRoute(newRoute);
        // alert('Route created successfully!');
      }

      navigate('/routes');
    } catch (error) {
      console.error('Error creating/updating route:', error);
      alert('Error creating/updating route. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/routes');
  };

  if (loading) {
    return <div>Loading stops...</div>;
  }

  return (
    <CreateRouteContainer className="fade-in">
      <PageHeader>
        <BackButton variant="secondary" onClick={handleCancel}>
          <FiArrowLeft />
        </BackButton>
        <PageTitle>{id ? 'Edit Route' : 'Create New Route'}</PageTitle>
      </PageHeader>

      <ContentLayout>
        {/* Route Information - Compact Header */}
        <RouteInfoCard>
          <FormGroup>
            <Label>
              Route Name <RequiredIndicator>*</RequiredIndicator>
            </Label>
            <Input
              type="text"
              placeholder="Enter route name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>
              Route Code <RequiredIndicator>*</RequiredIndicator>
            </Label>
            <Input
              type="text"
              placeholder="Enter route code (e.g., RT001)"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              required
            />
          </FormGroup>
        </RouteInfoCard>

        {/* Map - Two Modes */}
        <MapContainer ref={mapContainerRef}>
          <RouteMap
            stops={isAddingMode ? selectedStops : [...availableStops, ...selectedStops]}
            selectedStops={selectedStops}
            showRoute={true}
            height="100%"
            onStopClick={isAddingMode ? undefined : handleMapStopClick}
            onFitRoute={handleFitRoute}
            showAllStops={showAllStops}
            onToggleShowAllStops={isAddingMode ? handleToggleShowAllStops : handleToggleShowAllStops}
            searchTerm={searchTerm}
            onSearchChange={isAddingMode ? undefined : setSearchTerm}
            filteredStops={filteredStops}
            onAddStop={isAddingMode ? undefined : handleAddStop}
            onRemoveStop={handleRemoveStop}
            onMapClick={isAddingMode ? handleMapClickForAddingStop : undefined}
            isAddingMode={isAddingMode}
            onToggleAddingMode={handleToggleAddingMode}
            // precalculatedRouteData={precalculatedRouteData} // Removed as per edit hint
          />
          
        </MapContainer>

        {/* Action Buttons */}
        <form onSubmit={handleSubmit}>
          <ActionButtons>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={isSubmitting || selectedStops.length < 2}
            >
              <FiSave />
              {isSubmitting ? (id ? 'Updating...' : 'Creating...') : (id ? 'Update Route' : 'Create Route')}
            </Button>
          </ActionButtons>
        </form>
      </ContentLayout>

      {/* Manual Stop Modal */}
      <ModalOverlay $isOpen={isManualStopModalOpen}>
        <ModalContent>
          <ModalTitle>Add Manual Stop</ModalTitle>
          
          {tempManualStop && (
            <>
              {/* Display Coordinates */}
              <ModalFormGroup>
                <ModalLabel>Coordinates</ModalLabel>
                <div style={{ 
                  padding: '8px 12px', 
                  backgroundColor: theme.colors.border,
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  color: theme.colors.textSecondary
                }}>
                  Lat: {tempManualStop.location.lat}, Lon: {tempManualStop.location.lon}
                </div>
              </ModalFormGroup>

              {/* Stop Name */}
              <ModalFormGroup>
                <ModalLabel>Stop Name <RequiredIndicator>*</RequiredIndicator></ModalLabel>
                <ModalInput
                  type="text"
                  placeholder="Enter stop name"
                  value={tempManualStop.name}
                  onChange={(e) => handleManualStopModalChange('name', e.target.value)}
                />
              </ModalFormGroup>

              {/* Stop Code */}
              <ModalFormGroup>
                <ModalLabel>Stop Code <RequiredIndicator>*</RequiredIndicator></ModalLabel>
                <ModalInput
                  type="text"
                  placeholder="Enter stop code"
                  value={tempManualStop.code}
                  onChange={(e) => handleManualStopModalChange('code', e.target.value)}
                />
              </ModalFormGroup>
            </>
          )}

          {/* Modal Buttons */}
          <ModalButtons>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancelManualStop}
            >
              <FiX /> Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleConfirmManualStop}
            >
              <FiPlus /> Add Stop
            </Button>
          </ModalButtons>
        </ModalContent>
      </ModalOverlay>
    </CreateRouteContainer>
  );
};

export default CreateRoute;
