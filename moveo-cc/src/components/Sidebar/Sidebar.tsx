import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const SidebarContainer = styled.aside<{ $isCollapsed: boolean }>`
  width: ${props => props.$isCollapsed ? '60px' : '240px'};
  min-width: ${props => props.$isCollapsed ? '60px' : '240px'};
  background-color: ${theme.colors.surface};
  border-right: 1px solid ${theme.colors.border};
  display: flex;
  flex-direction: column;
  transition: all ${theme.transitions.base};
  overflow: hidden;
`;

const Logo = styled.div<{ $isCollapsed: boolean }>`
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  justify-content: ${props => props.$isCollapsed ? 'center' : 'flex-start'};
`;

const LogoIcon = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryHover});
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.typography.fontWeight.bold};
  color: white;
  font-size: ${theme.typography.fontSize.lg};
  flex-shrink: 0;
`;

const LogoText = styled.span<{ $isCollapsed: boolean }>`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  white-space: nowrap;
  opacity: ${props => props.$isCollapsed ? 0 : 1};
  transition: opacity ${theme.transitions.fast};
`;

const Nav = styled.nav`
  flex: 1;
  padding: ${theme.spacing.md};
  overflow-y: auto;
`;

const NavItem = styled(Link)<{ $active?: boolean; $isCollapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${props => props.$isCollapsed ? theme.spacing.sm : `${theme.spacing.sm} ${theme.spacing.md}`};
  margin-bottom: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.md};
  color: ${props => props.$active ? theme.colors.primary : theme.colors.textSecondary};
  background-color: ${props => props.$active ? `${theme.colors.primary}15` : 'transparent'};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${props => props.$active ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  text-decoration: none;
  justify-content: ${props => props.$isCollapsed ? 'center' : 'flex-start'};
  position: relative;

  &:hover {
    background-color: ${props => props.$active ? `${theme.colors.primary}20` : theme.colors.surfaceHover};
    color: ${props => props.$active ? theme.colors.primary : theme.colors.textPrimary};
  }

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  span {
    opacity: ${props => props.$isCollapsed ? 0 : 1};
    white-space: nowrap;
    transition: opacity ${theme.transitions.fast};
  }
`;

const NavSection = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const NavSectionTitle = styled.div<{ $isCollapsed: boolean }>`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: ${props => props.$isCollapsed ? '0' : `${theme.spacing.sm} ${theme.spacing.md}`};
  margin-bottom: ${theme.spacing.sm};
  opacity: ${props => props.$isCollapsed ? 0 : 1};
  transition: opacity ${theme.transitions.fast};
  height: ${props => props.$isCollapsed ? '0' : 'auto'};
  overflow: hidden;
`;

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const location = useLocation();

  return (
    <SidebarContainer $isCollapsed={isCollapsed}>
      <Logo $isCollapsed={isCollapsed}>
        <LogoIcon>CC</LogoIcon>
        <LogoText $isCollapsed={isCollapsed}>Command</LogoText>
      </Logo>

      <Nav>
        <NavSection>
          <NavSectionTitle $isCollapsed={isCollapsed}>Main</NavSectionTitle>
          <NavItem $active={location.pathname === '/'} $isCollapsed={isCollapsed} to="/">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span>Real-Time Tracking</span>
          </NavItem>
          <NavItem $active={location.pathname === '/trips'} $isCollapsed={isCollapsed} to="/trips">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Trip History</span>
          </NavItem>
        </NavSection>

        <NavSection>
          <NavSectionTitle $isCollapsed={isCollapsed}>Testing</NavSectionTitle>
          <NavItem $active={location.pathname === '/emulator'} $isCollapsed={isCollapsed} to="/emulator">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>Vehicle Emulator</span>
          </NavItem>
        </NavSection>
      </Nav>
    </SidebarContainer>
  );
};

export default Sidebar;


