import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StationPage from './pages/StationPage';
import RealtimeData from './Components/RealtimeData/RealtimeData';
import './App.css';

// import Navbar from './Components/Navbar';

function App() {
  return (
    <Router>
      {/* <Navbar /> */}
      <Routes>
        <Route path="/" element={<RealtimeData />} />
        <Route path="/station/:stationId" element={<StationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
