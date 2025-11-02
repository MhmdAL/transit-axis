import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiMapPin } from 'react-icons/fi';
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
  StatusBadge,
  ActionButtons,
  ActionButton,
  EmptyState,
  EmptyStateIcon
} from '../../components/Common/CommonStyles';
import { Route } from '../../types';
import { dataService } from '../../services/dataService';

const Routes: React.FC = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const routesData = await dataService.getRoutes();
        setRoutes(routesData);
        setFilteredRoutes(routesData);
      } catch (error) {
        console.error('Error loading routes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRoutes();
  }, []);

  useEffect(() => {
    let filtered = routes;

    if (searchTerm) {
      filtered = filtered.filter(route =>
        route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRoutes(filtered);
  }, [routes, searchTerm]);

  const handleCreateRoute = () => {
    navigate('/routes/create');
  };

  const handleEditRoute = (routeId: string) => {
    navigate(`/routes/edit/${routeId}`);
  };

  const handleDeleteRoute = (routeId: string) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      setRoutes(prev => prev.filter(route => route.id !== routeId));
    }
  };

  if (loading) {
    return <div>Loading routes...</div>;
  }

  return (
    <PageContainer className="fade-in">
      <PageHeader>
        <PageTitle>Routes</PageTitle>
        <HeaderActions>
          <Button variant="primary" onClick={handleCreateRoute}>
            <FiPlus />
            Create Route
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
            placeholder="Search routes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
      </FiltersCard>

      {filteredRoutes.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>🗺️</EmptyStateIcon>
          <h3>No routes found</h3>
          <p>Try adjusting your search criteria or create a new route.</p>
          <Button variant="primary" onClick={handleCreateRoute} style={{ marginTop: '16px' }}>
            <FiPlus />
            Create Route
          </Button>
        </EmptyState>
      ) : (
        <TableCard>
          <Table>
            <TableHeader>
              <tr>
                <TableHeaderCell>Route Name</TableHeaderCell>
                <TableHeaderCell>Code</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </tr>
            </TableHeader>
            <TableBody>
              {filteredRoutes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell>
                    <strong>{route.name}</strong>
                  </TableCell>
                  <TableCell>{route.code}</TableCell>
                  <TableCell>
                    <ActionButtons>
                      <ActionButton onClick={() => handleEditRoute(route.id)}>
                        <FiEdit size={16} />
                      </ActionButton>
                      <ActionButton onClick={() => handleDeleteRoute(route.id)}>
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

export default Routes;