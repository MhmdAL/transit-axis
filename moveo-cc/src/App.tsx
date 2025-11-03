import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GlobalStyles } from './styles/GlobalStyles';
import RealTimeTracking from './pages/Tracking/RealTimeTracking';
import VehicleEmulator from './pages/VehicleEmulator/VehicleEmulator';
import TripsList from './pages/Trips/TripsList';
import VehicleTracker from './pages/VehicleTracker/VehicleTracker';
import TripMonitoring from './pages/TripMonitoring/TripMonitoring';
import { VehicleTrackingProvider } from './context/VehicleTrackingContext';

function App() {
  return (
    <VehicleTrackingProvider>
      <Router>
        <GlobalStyles />
        <Routes>
          <Route path="/" element={<RealTimeTracking />} />
          <Route path="/trips" element={<TripsList />} />
          <Route path="/emulator" element={<VehicleEmulator />} />
          <Route path="/vehicle-tracker" element={<VehicleTracker />} />
          <Route path="/trip-monitoring" element={<TripMonitoring />} />
        </Routes>
      </Router>
    </VehicleTrackingProvider>
  );
}

export default App;
