import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiMenu, FiSidebar, FiBell, FiSearch, FiUser, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { theme } from '../../styles/theme';
import { Button, Input } from '../../styles/GlobalStyles';
import { useAuth } from '../../contexts/AuthContext';

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-bottom: 1px solid ${theme.colors.border};
  min-height: 80px;
  position: sticky;
  top: 0;
  z-index: ${theme.zIndex.sticky};
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const MenuButton = styled.button`
  display: none;
  color: ${theme.colors.textSecondary};
  padding: ${theme.spacing.sm};
  
  @media (max-width: ${theme.breakpoints.lg}) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  &:hover {
    color: ${theme.colors.textPrimary};
  }
`;

const SidebarToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.textSecondary};
  padding: ${theme.spacing.sm};
  
  @media (max-width: ${theme.breakpoints.lg}) {
    display: none;
  }
  
  &:hover {
    color: ${theme.colors.textPrimary};
  }
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  max-width: 400px;
  width: 100%;
  
  @media (max-width: ${theme.breakpoints.md}) {
    display: none;
  }
`;

const SearchInput = styled(Input)`
  padding-left: 40px;
  background: ${theme.colors.background};
  border-color: ${theme.colors.border};
  
  &:focus {
    background: ${theme.colors.surface};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: ${theme.spacing.md};
  color: ${theme.colors.textMuted};
  pointer-events: none;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const NotificationButton = styled.button`
  position: relative;
  color: ${theme.colors.textSecondary};
  padding: ${theme.spacing.sm};
  
  &:hover {
    color: ${theme.colors.textPrimary};
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 8px;
    right: 8px;
    width: 8px;
    height: 8px;
    background: ${theme.colors.error};
    border-radius: 50%;
  }
`;

const UserProfile = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: background 0.2s ease-in-out;
  
  &:hover {
    background: ${theme.colors.surfaceHover};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    .user-info {
      display: none;
    }
  }
`;

const UserDropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.lg};
  min-width: 200px;
  z-index: ${theme.zIndex.dropdown};
  opacity: ${({ isOpen }) => isOpen ? 1 : 0};
  visibility: ${({ isOpen }) => isOpen ? 'visible' : 'hidden'};
  transform: ${({ isOpen }) => isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.2s ease-in-out;
`;

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  color: ${theme.colors.textPrimary};
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md};
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease-in-out;
  
  &:hover {
    background: ${theme.colors.surfaceHover};
  }
  
  &:first-child {
    border-radius: ${theme.borderRadius.lg} ${theme.borderRadius.lg} 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 ${theme.borderRadius.lg} ${theme.borderRadius.lg};
  }
`;

const DropdownDivider = styled.div`
  height: 1px;
  background: ${theme.colors.border};
  margin: ${theme.spacing.xs} 0;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  background: ${theme.colors.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const UserName = styled.span`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
`;

const UserRole = styled.span`
  color: ${theme.colors.textMuted};
  font-size: ${theme.typography.fontSize.xs};
`;

interface HeaderProps {
  onMenuToggle: () => void;
  onSidebarToggle: () => void;
}

interface User {
  id: string;
  username: string;
  name: string;
  type: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, onSidebarToggle }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-user-profile]')) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <HeaderContainer>
      <LeftSection>
        <MenuButton onClick={onMenuToggle}>
          <FiMenu size={24} />
        </MenuButton>
        <SidebarToggle onClick={onSidebarToggle}>
          <FiSidebar size={20} />
        </SidebarToggle>
        
        {/* <SearchContainer>
          <SearchIcon>
            <FiSearch size={18} />
          </SearchIcon>
          <SearchInput 
            type="text" 
            placeholder="Search vehicles, drivers, routes..." 
          />
        </SearchContainer> */}
      </LeftSection>
      
      <RightSection>
        <NotificationButton>
          <FiBell size={20} />
        </NotificationButton>
        
        <UserProfile data-user-profile onClick={toggleDropdown}>
          <UserAvatar>
            {user ? getInitials(user.name) : 'U'}
          </UserAvatar>
          <UserInfo className="user-info">
            <UserName>{user?.name || 'User'}</UserName>
            <UserRole>{user?.username || 'username'}</UserRole>
          </UserInfo>
          
          <UserDropdown isOpen={dropdownOpen}>
            {/* <DropdownItem onClick={() => setDropdownOpen(false)}>
              <FiUser size={16} />
              Profile
            </DropdownItem> */}
            {/* <DropdownDivider /> */}
            <DropdownItem onClick={handleLogout}>
              <FiLogOut size={16} />
              Logout
            </DropdownItem>
          </UserDropdown>
        </UserProfile>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;


