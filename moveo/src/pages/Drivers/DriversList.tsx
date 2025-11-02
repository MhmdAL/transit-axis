import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';
import { theme } from '../../styles/theme';
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
import { Driver } from '../../types';
import { dataService } from '../../services/dataService';

// Custom component for driver-specific styling
const RatingStars = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const DriversList: React.FC = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadDrivers = async () => {
      try {
        const driversData = await dataService.getDrivers();
        setDrivers(driversData);
        setFilteredDrivers(driversData);
      } catch (error) {
        console.error('Error loading drivers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDrivers();
  }, []);

  useEffect(() => {
    let filtered = drivers;

    if (searchTerm) {
      filtered = filtered.filter(driver =>
        driver.qid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDrivers(filtered);
  }, [drivers, searchTerm]);

  const handleCreateDriver = () => {
    navigate('/drivers/create');
  };

  const handleEditDriver = (driverId: string) => {
    navigate(`/drivers/edit/${driverId}`);
  };

  const handleDeleteDriver = (driverId: string) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      setDrivers(prev => prev.filter(driver => driver.id !== driverId));
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} style={{ color: theme.colors.warning }}>★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" style={{ color: theme.colors.warning }}>☆</span>);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<span key={`empty-${i}`} style={{ color: theme.colors.textMuted }}>☆</span>);
    }

    return stars;
  };

  if (loading) {
    return <div>Loading drivers...</div>;
  }

  return (
    <PageContainer className="fade-in">
      <PageHeader>
        <PageTitle>Drivers</PageTitle>
        <HeaderActions>
          <Button variant="primary" onClick={handleCreateDriver}>
            <FiPlus />
            Add Driver
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
            placeholder="Search drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
      </FiltersCard>

      {filteredDrivers.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>👨‍💼</EmptyStateIcon>
          <h3>No drivers found</h3>
          <p>Try adjusting your search criteria or add a new driver.</p>
          <Button variant="primary" onClick={handleCreateDriver} style={{ marginTop: '16px' }}>
            <FiPlus />
            Add Driver
          </Button>
        </EmptyState>
      ) : (
        <TableCard>
          <Table>
            <TableHeader>
              <tr>
                <TableHeaderCell>QID</TableHeaderCell>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Phone</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </tr>
            </TableHeader>
            <TableBody>
              {filteredDrivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell>
                    <strong>{driver.qid}</strong>
                  </TableCell>
                  <TableCell>
                    <strong>{driver.name}</strong>
                  </TableCell>
                  <TableCell>
                    {driver.phone}
                  </TableCell>
                  <TableCell>
                    {driver.email}
                  </TableCell>
                  <TableCell>
                    <ActionButtons>
                      <ActionButton onClick={() => handleEditDriver(driver.id)}>
                        <FiEdit size={16} />
                      </ActionButton>
                      <ActionButton onClick={() => handleDeleteDriver(driver.id)}>
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

export default DriversList;
