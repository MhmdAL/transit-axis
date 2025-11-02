import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import Sidebar from '../../components/Sidebar/Sidebar';

const PageContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: ${theme.colors.background};
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: ${theme.spacing.xl};
  align-items: center;
  justify-content: center;
`;

const EmulatorCard = styled.div`
  width: 100%;
  max-width: 500px;
  background-color: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.xl};
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.sm};
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textMuted};
`;

const Section = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const Label = styled.label`
  display: block;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.sm};
`;

const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.base};
  transition: all ${theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }

  &::placeholder {
    color: ${theme.colors.textMuted};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.base};
  transition: all ${theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }

  option {
    background-color: ${theme.colors.surface};
    color: ${theme.colors.textPrimary};
  }
`;

const StatusCard = styled.div<{ $status: 'idle' | 'active' }>`
  padding: ${theme.spacing.lg};
  background-color: ${props => props.$status === 'active' 
    ? `${theme.colors.success}20` 
    : theme.colors.background};
  border: 2px solid ${props => props.$status === 'active' 
    ? theme.colors.success 
    : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.xl};
  text-align: center;
`;

const StatusLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${theme.spacing.xs};
`;

const StatusValue = styled.div<{ $status: 'idle' | 'active' }>`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${props => props.$status === 'active' 
    ? theme.colors.success 
    : theme.colors.textSecondary};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
`;

const InfoItem = styled.div`
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background};
  border-radius: ${theme.borderRadius.md};
`;

const InfoLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textMuted};
  margin-bottom: ${theme.spacing.xs};
`;

const InfoValue = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
`;

const Button = styled.button<{ $variant: 'primary' | 'danger' }>`
  width: 100%;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${props => props.$variant === 'primary' 
    ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryHover})` 
    : `linear-gradient(135deg, ${theme.colors.error}, #DC2626)`};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  box-shadow: ${theme.shadows.md};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const VehicleIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto ${theme.spacing.lg};
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryHover});
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 40px;
    height: 40px;
    color: white;
  }
`;

const ErrorMessage = styled.div`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background-color: ${theme.colors.error}20;
  border: 1px solid ${theme.colors.error};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.error};
  font-size: ${theme.typography.fontSize.sm};
  margin-bottom: ${theme.spacing.md};
`;

const DutiesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
  max-height: 300px;
  overflow-y: auto;
`;

const DutyItem = styled.button<{ $selected: boolean }>`
  padding: ${theme.spacing.md};
  background-color: ${props => props.$selected ? `${theme.colors.primary}20` : theme.colors.background};
  border: 2px solid ${props => props.$selected ? theme.colors.primary : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  text-align: left;

  &:hover {
    border-color: ${theme.colors.primary};
    background-color: ${props => !props.$selected ? `${theme.colors.primary}10` : `${theme.colors.primary}20`};
  }
`;

const DutyInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DutyType = styled.span<{ $type: string }>`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background-color: ${props => {
    if (props.$type === 'TRIP') return `${theme.colors.success}20`;
    if (props.$type === 'WASHING') return `${theme.colors.info}20`;
    return `${theme.colors.warning}20`;
  }};
  color: ${props => {
    if (props.$type === 'TRIP') return theme.colors.success;
    if (props.$type === 'WASHING') return theme.colors.info;
    return theme.colors.warning;
  }};
  border-radius: ${theme.borderRadius.sm};
`;

const VehicleEmulator: React.FC = () => {
  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [authToken, setAuthToken] = useState('');

  // Trip state
  const [selectedRoute, setSelectedRoute] = useState('');
  const [tripStatus, setTripStatus] = useState<'idle' | 'active'>('idle');
  const [tripStartTime, setTripStartTime] = useState<Date | null>(null);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  const [routeName, setRouteName] = useState('');
  
  // Telemetry state
  const [currentLat, setCurrentLat] = useState(31.9454);
  const [currentLon, setCurrentLon] = useState(35.9284);
  const [odometer, setOdometer] = useState(0);

  // Duties state
  const [duties, setDuties] = useState<any[]>([]);
  const [selectedDuty, setSelectedDuty] = useState<any>(null);
  const [isLoadingDuties, setIsLoadingDuties] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const response = await fetch('http://localhost:3002/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsLoggedIn(true);
        setAuthToken(data.data.token);
        // Fetch duties for this driver/vehicle combo
        await fetchDuties(data.data.token);
      } else {
        setLoginError(data.message || 'Login failed');
      }
    } catch (error) {
      setLoginError('Failed to connect to server');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const fetchDuties = async (token: string) => {
    setIsLoadingDuties(true);
    try {
      // Fetch duties for hardcoded driver=1 and vehicle=1 via vehicle-api
      const response = await fetch('http://localhost:3002/duties?driverId=1&vehicleId=1&dutyType=TRIP', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setDuties(data.data || []);
      } else {
        console.error('Failed to fetch duties:', data.message);
      }
    } catch (error) {
      console.error('Failed to fetch duties:', error);
    } finally {
      setIsLoadingDuties(false);
    }
  };

  const handleSelectDuty = (duty: any) => {
    setSelectedDuty(duty);
  };

  const handleStartTrip = async () => {
    if (!selectedDuty) {
      alert('Please select a duty first.');
      return;
    }

    // Get routeId from the selected duty's trip duties (assuming first one)
    const tripDuty = selectedDuty.tripDuties?.[0];
    if (!tripDuty) {
      alert('Selected duty has no associated route.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3002/trips/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          routeId: tripDuty.routeId,
          vehicleId: selectedDuty.vehicleId,
          driverId: selectedDuty.driverId,
          scheduledDepartureTime: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTripStatus('active');
        setTripStartTime(new Date());
        setCurrentTripId(data.data.id);
        setRouteName(data.data.route?.name || selectedRoute);
        setOdometer(1000); // Initialize odometer to 1000 km
      } else {
        alert(data.message || 'Failed to start trip');
      }
    } catch (error) {
      alert('Failed to connect to server');
    }
  };

  const handleEndTrip = async () => {
    if (!currentTripId) return;

    try {
      const response = await fetch(`http://localhost:3002/trips/${currentTripId}/end`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTripStatus('idle');
        setTripStartTime(null);
        setSelectedRoute('');
        setCurrentTripId(null);
        setRouteName('');
        setOdometer(0); // Reset odometer
      } else {
        alert(data.message || 'Failed to end trip');
      }
    } catch (error) {
      alert('Failed to connect to server');
    }
  };

  const sendTelemetry = async () => {
    // Generate random offset for coordinates (simulate movement)
    const latOffset = (Math.random() - 0.5) * 0.001; // ~50-100m variation
    const lonOffset = (Math.random() - 0.5) * 0.001;
    const newLat = currentLat + latOffset;
    const newLon = currentLon + lonOffset;
    
    // Update current position
    setCurrentLat(newLat);
    setCurrentLon(newLon);

    // Generate random speed between 20-80 km/h
    const currentSpeed = Math.random() * 60 + 20;
    
    // Calculate odometer increment: speed (km/h) * time (hours)
    // Telemetry sent every 10 seconds = 1/360 hour
    const odometerIncrement = (currentSpeed / 360); // 10 seconds in hours
    const newOdometer = odometer + odometerIncrement;
    setOdometer(newOdometer);

    const telemetryData = {
      vehicleId: 1, // Hardcoded to match trip
      tripId: currentTripId ? parseInt(currentTripId) : undefined,
      latitude: newLat,
      longitude: newLon,
      speed: currentSpeed,
      heading: Math.random() * 360, // Random heading
      accuracy: Math.random() * 20 + 5, // 5-25m accuracy
      odometer: parseFloat(newOdometer.toFixed(2)), // Round to 2 decimals
    };

    try {
      await fetch('http://localhost:3002/telemetry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(telemetryData),
      });
    } catch (error) {
      console.error('Failed to send telemetry:', error);
    }
  };

  const getElapsedTime = () => {
    if (!tripStartTime) return '00:00:00';
    const now = new Date();
    const diff = Math.floor((now.getTime() - tripStartTime.getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Update elapsed time every second when trip is active
  React.useEffect(() => {
    if (tripStatus === 'active') {
      const interval = setInterval(() => {
        // Force re-render to update elapsed time
        setTripStartTime(prev => prev);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [tripStatus]);

  // Send telemetry every 10 seconds when trip is active
  React.useEffect(() => {
    if (tripStatus === 'active') {
      // Send immediately on trip start
      sendTelemetry();
      
      // Then send every 10 seconds
      const interval = setInterval(() => {
        sendTelemetry();
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [tripStatus]);

  // Login screen
  if (!isLoggedIn) {
    return (
      <PageContainer>
        <Sidebar isCollapsed={isSidebarCollapsed} />
        <MainContent>
          <EmulatorCard>
            <Header>
              <VehicleIcon>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </VehicleIcon>
              <Title>Driver Login</Title>
              <Subtitle>Vehicle Emulator</Subtitle>
            </Header>

            <form onSubmit={handleLogin}>
              {loginError && <ErrorMessage>{loginError}</ErrorMessage>}

              <Section>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="driver@example.com"
                  required
                  disabled={isLoggingIn}
                />
              </Section>

              <Section>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  disabled={isLoggingIn}
                />
              </Section>

              <Button 
                $variant="primary" 
                type="submit"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </EmulatorCard>
        </MainContent>
      </PageContainer>
    );
  }

  // Trip management screen
  return (
    <PageContainer>
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <MainContent>
        <EmulatorCard>
          <Header>
            <VehicleIcon>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </VehicleIcon>
            <Title>Vehicle Emulator</Title>
            <Subtitle>Test Driver App Interface</Subtitle>
          </Header>

          <StatusCard $status={tripStatus}>
            <StatusLabel>Trip Status</StatusLabel>
            <StatusValue $status={tripStatus}>
              {tripStatus === 'active' ? 'IN PROGRESS' : 'IDLE'}
            </StatusValue>
          </StatusCard>

          {tripStatus === 'active' && (
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Elapsed Time</InfoLabel>
                <InfoValue>{getElapsedTime()}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Route</InfoLabel>
                <InfoValue>{routeName || '-'}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Odometer</InfoLabel>
                <InfoValue>{odometer.toFixed(2)} km</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Current Speed</InfoLabel>
                <InfoValue>-</InfoValue>
              </InfoItem>
            </InfoGrid>
          )}

          {tripStatus === 'idle' ? (
            <>
              {isLoadingDuties ? (
                <Section>
                  <Label>Loading duties...</Label>
                </Section>
              ) : duties.length === 0 ? (
                <Section>
                  <Label>No duties available</Label>
                </Section>
              ) : (
                <Section>
                  <Label>Select a Duty</Label>
                  <DutiesList>
                    {duties.map((duty: any) => (
                      <DutyItem
                        key={duty.id}
                        $selected={selectedDuty?.id === duty.id}
                        onClick={() => handleSelectDuty(duty)}
                      >
                        <DutyInfo>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>
                              {new Date(duty.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {new Date(duty.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            {duty.tripDuties?.length > 0 && (
                              <div style={{ fontSize: '0.875rem', color: '#999', marginTop: '4px' }}>
                                Route: {duty.tripDuties[0].route?.name || 'N/A'}
                              </div>
                            )}
                          </div>
                          <DutyType $type={duty.dutyType}>
                            {duty.dutyType}
                          </DutyType>
                        </DutyInfo>
                      </DutyItem>
                    ))}
                  </DutiesList>
                </Section>
              )}
              <Button 
                $variant="primary" 
                onClick={handleStartTrip}
                disabled={!selectedDuty}
              >
                Start Trip
              </Button>
            </>
          ) : (
            <Button 
              $variant="danger" 
              onClick={handleEndTrip}
            >
              End Trip
            </Button>
          )}
        </EmulatorCard>
      </MainContent>
    </PageContainer>
  );
};

export default VehicleEmulator;

