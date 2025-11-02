import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalStyles } from './styles/GlobalStyles';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import LoadingScreen from './components/LoadingScreen';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import VehiclesList from './pages/Vehicles/VehiclesList';
import CreateVehicle from './pages/Vehicles/CreateVehicle';
import DriversList from './pages/Drivers/DriversList';
import CreateDriver from './pages/Drivers/CreateDriver';
import EditDriver from './pages/Drivers/EditDriver';
import UsersList from './pages/Users/UsersList';
import CreateUser from './pages/Users/CreateUser';
import EditUser from './pages/Users/EditUser';
import RoutesPage from './pages/Routes/Routes';
import CreateRoute from './pages/Routes/CreateRoute';
import Stops from './pages/Stops/Stops';
import CreateStop from './pages/Stops/CreateStop';
import Tracking from './pages/Tracking/Tracking';
import Reports from './pages/Reports/Reports';
import Trips from './pages/Trips/Trips';
import CreateTrip from './pages/Trips/CreateTrip';
import TripDashboard from './pages/Trips/TripDashboard';
import ActivateAccount from './pages/Auth/ActivateAccount';
import ServiceSchedulesList from './pages/ServiceSchedules/ServiceSchedulesList';
import CreateServiceSchedule from './pages/ServiceSchedules/CreateServiceSchedule';
import AssignmentInterface from './pages/Duties/AssignmentInterface';
import CreateDuty from './pages/Duties/CreateDuty';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// App Routes Component
const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
      />
      <Route path="/activate" element={<ActivateAccount />} />
      <Route path="/login" element={<Login />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/vehicles" element={
        <ProtectedRoute>
          <Layout>
            <VehiclesList />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/vehicles/create" element={
        <ProtectedRoute>
          <Layout>
            <CreateVehicle />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/drivers" element={
        <ProtectedRoute>
          <Layout>
            <DriversList />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/drivers/create" element={
        <ProtectedRoute>
          <Layout>
            <CreateDriver />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/drivers/edit/:id" element={
        <ProtectedRoute>
          <Layout>
            <EditDriver />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/users" element={
        <ProtectedRoute>
          <Layout>
            <UsersList />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/users/create" element={
        <ProtectedRoute>
          <Layout>
            <CreateUser />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/users/edit/:id" element={
        <ProtectedRoute>
          <Layout>
            <EditUser />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/trips" element={
        <ProtectedRoute>
          <Layout>
            <Trips />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/trips/create" element={
        <ProtectedRoute>
          <Layout>
            <CreateTrip />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/trips/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <TripDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/routes" element={
        <ProtectedRoute>
          <Layout>
            <RoutesPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/routes/create" element={
        <ProtectedRoute>
          <Layout>
            <CreateRoute />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/routes/edit/:id" element={
        <ProtectedRoute>
          <Layout>
            <CreateRoute />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/stops" element={
        <ProtectedRoute>
          <Layout>
            <Stops />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/stops/create" element={
        <ProtectedRoute>
          <Layout>
            <CreateStop />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/tracking" element={
        <ProtectedRoute>
          <Layout>
            <Tracking />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute>
          <Layout>
            <Reports />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/service-schedules" element={
        <ProtectedRoute>
          <Layout>
            <ServiceSchedulesList />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/service-schedules/create" element={
        <ProtectedRoute>
          <Layout>
            <CreateServiceSchedule />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/service-schedules/view/:id" element={
        <ProtectedRoute>
          <Layout>
            <CreateServiceSchedule />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/duties" element={
        <ProtectedRoute>
          <Layout>
            <AssignmentInterface />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/duties/create" element={
        <ProtectedRoute>
          <Layout>
            <CreateDuty />
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <GlobalStyles />
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
