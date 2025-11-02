import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiMapPin } from 'react-icons/fi';
import { theme } from '../../styles/theme';
import { Button, Badge } from '../../styles/GlobalStyles';
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
  EmptyStateIcon
} from '../../components/Common/CommonStyles';
import { Stop } from '../../types';
import { dataService } from '../../services/dataService';

// Custom badge for stop types
const TypeBadge = ({ type }: { type: any }) => {
//   const getTypeStyle = (stopType: Stop['type']) => {
//     switch (stopType) {
//       case 'pickup':
//         return {
//           background: 'rgba(8, 116, 80, 0.1)',
//           color: theme.colors.success,
//           border: '1px solid rgba(16, 185, 129, 0.2)'
//         };
//       case 'delivery':
//         return {
//           background: 'rgba(59, 130, 246, 0.1)',
//           color: theme.colors.primary,
//           border: '1px solid rgba(59, 130, 246, 0.2)'
//         };
//       case 'depot':
//         return {
//           background: 'rgba(245, 158, 11, 0.1)',
//           color: theme.colors.warning,
//           border: '1px solid rgba(245, 158, 11, 0.2)'
//         };
//       default:
//         return {
//           background: 'rgba(107, 114, 128, 0.1)',
//           color: theme.colors.secondary,
//           border: '1px solid rgba(107, 114, 128, 0.2)'
//         };
//     }
//   };

//   const style = getTypeStyle(type);
  
  return (
    <Badge>
      
    </Badge>
  );
};

const Stops: React.FC = () => {
  const navigate = useNavigate();
  const [stops, setStops] = useState<Stop[]>([]);
  const [filteredStops, setFilteredStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadStops = async () => {
      try {
        const stopsData = await dataService.getStops();
        setStops(stopsData);
        setFilteredStops(stopsData);
      } catch (error) {
        console.error('Error loading stops:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStops();
  }, []);

  useEffect(() => {
    let filtered = stops;

    if (searchTerm) {
      filtered = filtered.filter(stop =>
        stop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stop.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStops(filtered);
  }, [stops, searchTerm]);

  const handleCreateStop = () => {
    navigate('/stops/create');
  };

  const handleEditStop = (stopId: string) => {
    navigate(`/stops/edit/${stopId}`);
  };

  const handleDeleteStop = (stopId: string) => {
    if (window.confirm('Are you sure you want to delete this stop?')) {
      setStops(prev => prev.filter(stop => stop.id !== stopId));
    }
  };

  if (loading) {
    return <div>Loading stops...</div>;
  }

  return (
    <PageContainer className="fade-in">
      <PageHeader>
        <PageTitle>Stops</PageTitle>
        <HeaderActions>
          <Button variant="primary" onClick={handleCreateStop}>
            <FiPlus />
            Create Stop
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
            placeholder="Search stops..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
      </FiltersCard>

      {filteredStops.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>📍</EmptyStateIcon>
          <h3>No stops found</h3>
          <p>Try adjusting your search criteria or create a new stop.</p>
          <Button variant="primary" onClick={handleCreateStop} style={{ marginTop: '16px' }}>
            <FiPlus />
            Create Stop
          </Button>
        </EmptyState>
      ) : (
        <TableCard>
          <Table>
            <TableHeader>
              <tr>
                <TableHeaderCell>Stop Code</TableHeaderCell>
                <TableHeaderCell>Stop Name</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </tr>
            </TableHeader>
            <TableBody>
              {filteredStops.map((stop) => (
                <TableRow key={stop.id}>
                  <TableCell>
                    <strong>{stop.code}</strong>
                  </TableCell>
                  <TableCell>{stop.name}</TableCell>
                  <TableCell>
                    <ActionButtons>
                      <ActionButton onClick={() => handleEditStop(stop.id)}>
                        <FiEdit size={16} />
                      </ActionButton>
                      <ActionButton onClick={() => handleDeleteStop(stop.id)}>
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

export default Stops;