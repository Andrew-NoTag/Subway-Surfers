// import React, { useState, useEffect  } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';
import './App.css';

// import Navbar from './Components/Navbar';
import RealtimeData from './Components/RealtimeData';

function App() {
  return (
    <BrowserRouter>
      {/* <Navbar /> */}
      <Routes>
        <Route path="" element={<RealtimeData />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
