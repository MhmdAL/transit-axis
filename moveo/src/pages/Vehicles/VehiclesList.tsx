import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';
import { Button } from '../../styles/GlobalStyles';
import { 
  PageContainer, 
  PageHeader, 
  PageTitle, 
  HeaderActions,
  FiltersCard,
  SearchContainer,
  SearchInput,
  SearchIcon,
  TableCard,
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  ActionButtons,
  ActionButton,
  EmptyState,
  EmptyStateIcon,
  VehicleModelDisplay,
  VehicleModelName,
  VehicleModelDetails,
  VehicleModelBadge,
  VehicleModelSeparator,
  VehicleModelText,
  VehicleModelCompact
} from '../../components/Common/CommonStyles';
import { Vehicle } from '../../types';
import { dataService } from '../../services/dataService';

const VehiclesList: React.FC = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const vehiclesData = await dataService.getVehicles();
        setVehicles(vehiclesData);
        setFilteredVehicles(vehiclesData);
      } catch (error) {
        console.error('Error loading vehicles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, []);

  useEffect(() => {
    let filtered = vehicles;

    if (searchTerm) {
      filtered = filtered.filter(vehicle =>
        vehicle.plateNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.fleetNo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredVehicles(filtered);
  }, [vehicles, searchTerm]);

  const handleCreateVehicle = () => {
    navigate('/vehicles/create');
  };

  const handleEditVehicle = (vehicleId: string) => {
    navigate(`/vehicles/edit/${vehicleId}`);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      setVehicles(prev => prev.filter(vehicle => vehicle.id !== vehicleId));
    }
  };

  if (loading) {
    return <div>Loading vehicles...</div>;
  }

  return (
    <PageContainer className="fade-in">
      <PageHeader>
        <PageTitle>Vehicles</PageTitle>
        <HeaderActions>
          <Button variant="primary" onClick={handleCreateVehicle}>
            <FiPlus />
            Add Vehicle
          </Button>
        </HeaderActions>
      </PageHeader>

      <FiltersCard>
        <SearchContainer>
          <SearchIcon>
            <FiSearch size={18} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
      </FiltersCard>

      {filteredVehicles.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>🚛</EmptyStateIcon>
          <h3>No vehicles found</h3>
          <p>Try adjusting your search criteria or add a new vehicle.</p>
          <Button variant="primary" onClick={handleCreateVehicle} style={{ marginTop: '16px' }}>
            <FiPlus />
            Add Vehicle
          </Button>
        </EmptyState>
      ) : (
        <TableCard>
          <Table>
            <TableHeader>
              <tr>
                <TableHeaderCell width="25%">Fleet No.</TableHeaderCell>
                <TableHeaderCell width="25%">Plate Number</TableHeaderCell>
                <TableHeaderCell width="40%">Model</TableHeaderCell>
                {/* <TableHeaderCell>Make</TableHeaderCell>
                <TableHeaderCell>Model</TableHeaderCell>
                <TableHeaderCell>Year</TableHeaderCell> */}
                <TableHeaderCell width="10%">Actions</TableHeaderCell>
              </tr>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>
                    <strong>{vehicle.fleetNo}</strong>
                  </TableCell>
                  <TableCell>
                    <strong>{vehicle.plateNo}</strong>
                  </TableCell>
                  <TableCell>
                    {/* <VehicleModelDisplay>
                      <VehicleModelName>
                        {vehicle.model.make} {vehicle.model.manufacturer}
                      </VehicleModelName>
                      <VehicleModelDetails>
                        <VehicleModelBadge>{vehicle.model.year}</VehicleModelBadge>
                        <VehicleModelBadge>{vehicle.model.capacity} seats</VehicleModelBadge>
                      </VehicleModelDetails>
                    </VehicleModelDisplay> */}
                    
                    <VehicleModelCompact>
                      <VehicleModelText>{vehicle.model.make}</VehicleModelText>
                      <VehicleModelSeparator>•</VehicleModelSeparator>
                      <VehicleModelText>{vehicle.model.manufacturer}</VehicleModelText>
                      <VehicleModelSeparator>•</VehicleModelSeparator>
                      <VehicleModelText>{vehicle.model.year}</VehicleModelText>
                    </VehicleModelCompact>
                   
                  </TableCell>
                  <TableCell>
                    <ActionButtons>
                      {/* <ActionButton onClick={() => handleEditVehicle(vehicle.id)}>
                        <FiEdit size={16} />
                      </ActionButton> */}
                      <ActionButton onClick={() => handleDeleteVehicle(vehicle.id)}>
                        <FiTrash2 size={16} />
                      </ActionButton>
                    </ActionButtons>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableCard>
      )}
    </PageContainer>
  );
};

export default VehiclesList;