import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import Sidebar from './Sidebar';
import Header from './Header';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${theme.colors.background};
`;

const MainContent = styled.main<{ sidebarCollapsed: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: ${({ sidebarCollapsed }) => sidebarCollapsed ? '80px' : '280px'};
  transition: margin-left 0.3s ease-in-out;
  
  @media (max-width: ${theme.breakpoints.lg}) {
    margin-left: 0;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: ${theme.spacing.lg};
  overflow-y: auto;
  
  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing.md};
  }
`;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <LayoutContainer>
      <Sidebar 
        collapsed={sidebarCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        onToggle={toggleSidebar}
        onMobileMenuClose={() => setMobileMenuOpen(false)}
      />
      <MainContent sidebarCollapsed={sidebarCollapsed}>
        <Header 
          onMenuToggle={toggleMobileMenu}
          onSidebarToggle={toggleSidebar}
        />
        <ContentArea>
          {children}
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;


