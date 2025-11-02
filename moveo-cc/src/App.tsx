import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GlobalStyles } from './styles/GlobalStyles';
import RealTimeTracking from './pages/Tracking/RealTimeTracking';
import VehicleEmulator from './pages/VehicleEmulator/VehicleEmulator';
import TripsList from './pages/Trips/TripsList';
import VehicleTracker from './pages/VehicleTracker/VehicleTracker';

function App() {
  return (
    <Router>
      <GlobalStyles />
      <Routes>
        <Route path="/" element={<RealTimeTracking />} />
        <Route path="/trips" element={<TripsList />} />
        <Route path="/emulator" element={<VehicleEmulator />} />
        <Route path="/vehicle-tracker" element={<VehicleTracker />} />
      </Routes>
    </Router>
  );
}

export default App;
