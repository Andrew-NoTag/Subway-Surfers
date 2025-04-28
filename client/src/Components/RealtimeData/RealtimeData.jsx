import React, { useState, useEffect } from 'react';
import propTypes from 'prop-types';
import axios from 'axios';
import { stationMapping } from './StationMapping'; 
import './RealtimeData.css'; 

function ErrorMessage({ message }) {
  return (
    <div className="error-message">
      {message}
    </div>
  );
}

ErrorMessage.propTypes = {
  message: propTypes.string.isRequired,
};

function RealtimeData() {
  const [error, setError] = useState('');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentLines, setcurrentLines] = useState('bdfm');
  const [timeUpdated, setTimeUpdated] = useState('');
  const [currentLinesArray, setcurrentLinesArray] = useState(["B", "D", "F", "M"]);
  const [currentLine, setcurrentLine] = useState('');

  // Define available subway lines
  const subwayLines = [
    { id: 'bdfm', label: 'B D F M' },
    { id: 'ace', label: 'A C E' },
    { id: 'g', label: 'G' },
    { id: 'jz', label: 'J Z' },
    { id: 'l', label: 'L' },
    { id: 'nqrw', label: 'N Q R W' },
    { id: '1234567s', label: '1 2 3 4 5 6 7' },
    { id: 'sir', label: 'Staten Island Railway' }
  ];

  const fetchData = (line = currentLines) => {
    setLoading(true);
    setError('');
    
    axios.get(`/${line}`)
      .then(({ data }) => {
        setTrips(data);
        setTimeUpdated(new Date().toLocaleTimeString());
        setLoading(false);
      })
      .catch(err => {
        setError(`There was a problem retrieving data for line ${line.toUpperCase()}. ${err}`);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
    // Set up auto-refresh every 60 seconds
    const intervalId = setInterval(() => {
      fetchData();
    }, 60000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [currentLines]);

  const handleLineChange = (line) => {
    setcurrentLines(line);
    setTrips([]);
    fetchData(line);
    let lines = [];
    if (line == "bdfm") lines = ["B", "D", "F", "M"];
    if (line == "ace") lines = ["A", "C", "E"];
    if (line == "g") lines = ["G"];
    if (line == "jz") lines = ["J", "Z"];
    if (line == "l") lines = ["L"];
    if (line == "nqrw") lines = ["N", "Q", "R", "W"];
    if (line == "1234567s") lines = ["1", "2", "3", "4", "5", "6", "7"];
    if (line == "sir") lines = ['Staten Island Railway'];
    setcurrentLinesArray(lines);
    setcurrentLine('');
  };

  const handleLineChange2 = (line) => {
    setcurrentLine(line);
  }

  // const getStationName = (stopId) => {
  //   // This function would ideally map station IDs to readable names
  //   // For now, we'll just return the ID
  //   return stopId;
  // };
  const getStationName = (stopId) => {
    return stationMapping[stopId] || stopId;
  }

  const getTripDirection = (tripId) => {
    let dotIndex = tripId.indexOf(".");
    if (tripId[dotIndex + 2] == 'N') return 'Northbound';
    if (tripId[dotIndex + 2] == 'S') return 'Southbound';
    return 'Unknown direction';
  }

  const getTripLine = (tripId) => {
    let dotIndex = tripId.indexOf(".");
    return tripId[dotIndex - 1];
  }

  // Function to determine if a trip is northbound or southbound
  // const getTripDirection = (tripId) => {
  //   if (tripId.endsWith('N')) return 'Northbound';
  //   if (tripId.endsWith('S')) return 'Southbound';
  //   return 'Unknown direction';
  // };

  // Calculate time until arrival
  const getTimeUntil = (timeString) => {
    if (!timeString) return 'N/A';
    
    const arrivalTime = new Date(timeString);
    const now = new Date();
    const diffMs = arrivalTime - now;
    const diffMin = Math.floor(diffMs / 60000);
    
    if (diffMin < 0) return 'Departed';
    if (diffMin === 0) return 'Arriving now';
    return `${diffMin} min`;
  };

  return (
    <div className="realtime-container">
      <h2>NYC Subway Realtime Information</h2>
      
      <div className="line-selector">
        <h3>Select a subway line:</h3>
        <div className="line-buttons">
          {subwayLines.map(line => (
            <button
              key={line.id}
              className={`line-button ${currentLines === line.id ? 'active' : ''}`}
              onClick={() => handleLineChange(line.id)}
            >
              {line.label}
            </button>
          ))}
        </div>
      </div>

      <div className="line-selector">
        {/* <h3>Select a subway line:</h3> */}
        <div className="line-buttons">
          {currentLinesArray.map(line => (
            <button
              key={line}
              className={`line-button ${currentLine === line ? 'active' : ''}`}
              onClick={() => handleLineChange2(line)}
            >
              {line}
            </button>
          ))}
        </div>
      </div>
      
      <div className="updates-header">
        <h3>
          Showing trips for line: {currentLine == "" && subwayLines.find(l => l.id === currentLines)?.label} 
          {currentLine != "" && currentLine}
        </h3>
        {timeUpdated && <p className="last-updated">Last updated: {timeUpdated}</p>}
        <button className="refresh-button" onClick={() => fetchData()} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {error && <ErrorMessage message={error} />}
      
      {loading && <div className="loading-indicator">Loading trips data...</div>}
      
      <div className="trips-container">
        {trips.length > 0 ? (
          <div className="direction-columns">
            {/* Northbound trips */}
            <div className="direction-column">
              <h3>Northbound</h3>
              {trips
                .filter(trip => getTripDirection(trip.trip_id) == "Northbound")
                .filter(trip => currentLine == "" || getTripLine(trip.trip_id) == currentLine)
                .slice(0, 10) // Limit to first 10 trips
                .map(trip => (
                  <div key={trip.trip_id} className="trip-card">
                    <div className="trip-header">
                      {/* <h4>{getTripLine(trip.trip_id)}</h4> */}
                      <span className="route-id">{getTripLine(trip.trip_id)}</span>
                    </div>
                    <table className="stops-table">
                      <thead>
                        <tr>
                          <th>Station</th>
                          <th>Arrival</th>
                          <th>ETA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trip.stop_time_updates.slice(0, 8).map((stop, j) => (
                          <tr key={stop.stop_id + j}>
                            <td>{getStationName(stop.stop_id)}</td>
                            <td>{stop.arrival_time ? new Date(stop.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</td>
                            <td className="eta">{getTimeUntil(stop.arrival_time)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              {trips.filter(trip => getTripDirection(trip.trip_id) == "Northbound").length === 0 && 
                <p className="no-trips">No northbound trips available</p>
              }
            </div>
            
            {/* Southbound trips */}
            <div className="direction-column">
              <h3>Southbound</h3>
              {trips
                .filter(trip => getTripDirection(trip.trip_id) == "Southbound")
                .filter(trip => currentLine == "" || getTripLine(trip.trip_id) == currentLine)
                .slice(0, 10)
                .map(trip => (
                  <div key={trip.trip_id} className="trip-card">
                    <div className="trip-header">
                      {/* <h4>{getTripDirection(trip.trip_id)}</h4> */}
                      <span className="route-id">{getTripLine(trip.trip_id)}</span>
                    </div>
                    <table className="stops-table">
                      <thead>
                        <tr>
                          <th>Station</th>
                          <th>Arrival</th>
                          <th>ETA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trip.stop_time_updates.slice(0, 8).map((stop, j) => (
                          <tr key={stop.stop_id + j}>
                            <td>{getStationName(stop.stop_id)}</td>
                            <td>{stop.arrival_time ? new Date(stop.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</td>
                            <td className="eta">{getTimeUntil(stop.arrival_time)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              {trips.filter(trip => getTripDirection(trip.trip_id) == "Northbound").length === 0 && 
                <p className="no-trips">No southbound trips available</p>
              }
            </div>
          </div>
        ) : (
          !loading && <p>No trips data available</p>
        )}
      </div>
    </div>
  );
}

export default RealtimeData;