import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FiHome, 
  FiTruck, 
  FiUsers, 
  FiMap, 
  FiMapPin,
  FiNavigation, 
  FiBarChart,
  FiMenu,
  FiX,
  FiCalendar,
  FiSettings
} from 'react-icons/fi';
import { theme } from '../../styles/theme';

const SidebarContainer = styled.aside<{ collapsed: boolean; mobileMenuOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: ${({ collapsed }) => collapsed ? '80px' : '280px'};
  background: ${theme.colors.surface};
  border-right: 1px solid ${theme.colors.border};
  transition: width 0.3s ease-in-out;
  z-index: ${theme.zIndex.fixed};
  overflow: hidden;
  
  @media (max-width: ${theme.breakpoints.lg}) {
    transform: translateX(${({ mobileMenuOpen }) => mobileMenuOpen ? '0' : '-100%'});
    width: 280px;
  }
`;

const SidebarHeader = styled.div<{ collapsed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ collapsed }) => collapsed ? 'center' : 'space-between'};
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border};
  min-height: 80px;
`;

const Logo = styled.div<{ collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary};
  
  .logo-text {
    display: ${({ collapsed }) => collapsed ? 'none' : 'block'};
  }
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: ${theme.typography.fontSize.lg};
`;

const CloseButton = styled.button`
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

const Navigation = styled.nav`
  padding: ${theme.spacing.lg} 0;
`;

const NavItem = styled(NavLink)<{ collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  color: ${theme.colors.textSecondary};
  text-decoration: none;
  transition: all 0.2s ease-in-out;
  position: relative;
  
  &:hover {
    background: ${theme.colors.surfaceHover};
    color: ${theme.colors.textPrimary};
  }
  
  &.active {
    background: rgba(59, 130, 246, 0.1);
    color: ${theme.colors.primary};
    border-right: 3px solid ${theme.colors.primary};
  }
  
  .nav-icon {
    min-width: 24px;
    font-size: 20px;
  }
  
  .nav-text {
    display: ${({ collapsed }) => collapsed ? 'none' : 'block'};
    font-weight: ${theme.typography.fontWeight.medium};
  }
  
  ${({ collapsed }) => collapsed && `
    justify-content: center;
    padding: ${theme.spacing.md};
  `}
`;

const Overlay = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: ${theme.zIndex.modal - 10};
  display: ${({ show }) => show ? 'block' : 'none'};
  
  @media (min-width: ${theme.breakpoints.lg}) {
    display: none;
  }
`;

interface SidebarProps {
  collapsed: boolean;
  mobileMenuOpen: boolean;
  onToggle: () => void;
  onMobileMenuClose: () => void;
}

const navigationItems = [
  // { path: '/dashboard', label: 'Dashboard', icon: FiHome },
  // { path: '/institutions', label: 'Institutions', icon: FiUsers },
  { path: '/vehicles', label: 'Vehicles', icon: FiTruck },
  { path: '/drivers', label: 'Drivers', icon: FiUsers },
  // { path: '/passengers', label: 'Passengers', icon: FiUsers },
  // { path: '/trips', label: 'Trips', icon: FiUsers },
  { path: '/routes', label: 'Routes', icon: FiMap },
  { path: '/stops', label: 'Stops', icon: FiMapPin },
  // { path: '/reports', label: 'Reports', icon: FiBarChart },
  { path: '/service-schedules', label: 'Service Schedules', icon: FiCalendar },
  { path: '/duties', label: 'Duties Management', icon: FiSettings },
  { path: '/users', label: 'Users', icon: FiUsers },
];

const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed, 
  mobileMenuOpen, 
  onToggle, 
  onMobileMenuClose 
}) => {
  const location = useLocation();

  return (
    <>
      <Overlay show={mobileMenuOpen} onClick={onMobileMenuClose} />
      <SidebarContainer collapsed={collapsed} mobileMenuOpen={mobileMenuOpen}>
        <SidebarHeader collapsed={collapsed}>
          <Logo collapsed={collapsed}>
            <LogoIcon>M</LogoIcon>
            <span className="logo-text">Moveo</span>
          </Logo>
          <CloseButton onClick={onMobileMenuClose}>
            <FiX size={24} />
          </CloseButton>
        </SidebarHeader>
        
        <Navigation>
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavItem
                key={item.path}
                to={item.path}
                collapsed={collapsed}
                className={location.pathname === item.path ? 'active' : ''}
                onClick={onMobileMenuClose}
              >
                <IconComponent className="nav-icon" />
                <span className="nav-text">{item.label}</span>
              </NavItem>
            );
          })}
        </Navigation>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;
