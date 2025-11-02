import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiUser } from 'react-icons/fi';
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
  TableCell,
  ActionButtons,
  ActionButton,
  FormGroup,
  Label,
  Input,
  ErrorMessage
} from '../../components/Common/CommonStyles';
import { dataService } from '../../services/dataService';
import { User } from '@/types';

const UsersList: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm })
      };
      
      const response = await dataService.getUsers(params);
      setUsers(response);
    //   setTotalPages(response);
    } catch (error: any) {
      console.error('Error loading users:', error);
      setError(error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleCreateUser = () => {
    navigate('/users/create');
  };

  const handleEditUser = (userId: string) => {
    navigate(`/users/edit/${userId}`);
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      try {
        // TODO: Implement delete user API
        console.log('Delete user:', userId);
        await loadUsers(); // Reload the list
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          style={{
            padding: '8px 12px',
            margin: '0 2px',
            border: i === currentPage ? '2px solid #3b82f6' : '1px solid #e5e7eb',
            backgroundColor: i === currentPage ? '#3b82f6' : 'white',
            color: i === currentPage ? 'white' : '#374151',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          {i}
        </button>
      );
    }

    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '4px' }}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            backgroundColor: 'white',
            color: currentPage === 1 ? '#9ca3af' : '#374151',
            borderRadius: '6px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
          }}
        >
          Previous
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            backgroundColor: 'white',
            color: currentPage === totalPages ? '#9ca3af' : '#374151',
            borderRadius: '6px',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
          }}
        >
          Next
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <PageContainer className="fade-in">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading users...</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="fade-in">
      <PageHeader>
        <PageTitle>Users Management</PageTitle>
        <HeaderActions>
          <Button variant="primary" onClick={handleCreateUser}>
            <FiPlus />
            Create User
          </Button>
        </HeaderActions>
      </PageHeader>

      <div style={{ marginBottom: '1.5rem' }}>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search users by name or username..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </SearchContainer>
      </div>

      {error && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: '8px', 
          marginBottom: '1rem',
          color: '#dc2626'
        }}>
          {error}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell width="18%">Name</TableHeaderCell>
            <TableHeaderCell width="18%">Username</TableHeaderCell>
            <TableHeaderCell width="18%">Phone</TableHeaderCell>
            <TableHeaderCell width="12%">Status</TableHeaderCell>
            <TableHeaderCell width="12%">Type</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ color: '#6b7280' }}>
                  <FiUser size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <div>No users found</div>
                  {searchTerm && <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    Try adjusting your search terms
                  </div>}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#3b82f6',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '0.875rem'
                    }}>
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontWeight: '500', color: '#fff' }}>
                        {user.name}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div style={{ color: '#fff', fontFamily: 'monospace' }}>
                    {user.username}
                  </div>
                </TableCell>
                <TableCell>
                  <div style={{ color: '#fff', fontFamily: 'monospace' }}>
                    {user.phone}
                  </div>
                </TableCell>
                <TableCell>
                  <span style={{
                    backgroundColor: user.isActive ? '#d1fae5' : '#fef2f2',
                    color: user.isActive ? '#065f46' : '#dc2626',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}>
                    {user.isActive ? 'Active' : 'Pending'}
                  </span>
                </TableCell>
                <TableCell>
                  <span style={{
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}>
                    {user.type}
                  </span>
                </TableCell>
                <TableCell>
                  <ActionButtons>
                    {/* <ActionButton onClick={() => handleEditUser(user.id)}>
                      <FiEdit size={16} />
                    </ActionButton> */}
                    <ActionButton onClick={() => handleDeleteUser(user.id, user.name)}>
                      <FiTrash2 size={16} />
                    </ActionButton>
                  </ActionButtons>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {renderPagination()}
    </PageContainer>
  );
};

export default UsersList;
