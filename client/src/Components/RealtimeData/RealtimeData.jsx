// import React, { useState, useEffect  } from 'react'
// import propTypes from 'prop-types';
// import axios from 'axios';

// function ErrorMessage({ message }) {
//   return (
//     <div className="error-message">
//       {message}
//     </div>
//   );
// }

// ErrorMessage.propTypes = {
//   message: propTypes.string.isRequired,
// };

// function RealtimeData() {
//   const [error, setError] = useState('');
//   const [trips, setTrips] = useState([])

//   const fetchData = () => {
//     axios.get("/bdfm")
//       .then(({ data }) => {
//         setTrips(data)
//       })
//       .catch(err => setError(`There was a problem retrieving the about text. ${err}`));
//   };

//   useEffect(fetchData, []);

//   // useEffect(() => {
//   //   fetch("/bdfm").then(
//   //     res => res.json()
//   //   ).then(
//   //     data => {
//   //       setTrips(data)
//   //       console.log(data)
//   //     }
//   //   )
//   // }, [])

//   return (
//     <div>
//       {error && <ErrorMessage message={error} />}
//       {trips.map((trip, i) => (
//         <div key={trip.trip_id} style={{ border: '1px solid #ccc', margin: 10, padding: 10 }}>
//           <h3>Trip ID: {trip.trip_id}</h3>
//           <p>
//             Start Date: {trip.start_date} <br />
//             Start Time: {trip.start_time}
//           </p>
//           <h4>Stop Updates:</h4>
//           <ul>
//             {trip.stop_time_updates.map((stop, j) => (
//               <li key={stop.stop_id + j}>
//                 <strong>{stop.stop_id}</strong>
//                 <br />
//                 Arrival: {stop.arrival_time}
//                 <br />
//                 Departure: {stop.departure_time}
//               </li>
//             ))}
//           </ul>
//         </div>
//       ))}

//       {trips.length === 0 && <p>Loading trips…</p>}
//     </div>
//   )
// }

// export default RealtimeData
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
  const [currentLine, setCurrentLine] = useState('bdfm');
  const [timeUpdated, setTimeUpdated] = useState('');

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

  const fetchData = (line = currentLine) => {
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
  }, [currentLine]);

  const handleLineChange = (line) => {
    setCurrentLine(line);
    setTrips([]);
    fetchData(line);
  };

  // const getStationName = (stopId) => {
  //   // This function would ideally map station IDs to readable names
  //   // For now, we'll just return the ID
  //   return stopId;
  // };
  const getStationName = (stopId) => {
    return stationMapping[stopId] || stopId;
  }

  // Function to determine if a trip is northbound or southbound
  const getTripDirection = (tripId) => {
    if (tripId.endsWith('N')) return 'Northbound';
    if (tripId.endsWith('S')) return 'Southbound';
    return 'Unknown direction';
  };

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
              className={`line-button ${currentLine === line.id ? 'active' : ''}`}
              onClick={() => handleLineChange(line.id)}
            >
              {line.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="updates-header">
        <h3>Showing trips for line: {subwayLines.find(l => l.id === currentLine)?.label}</h3>
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
                .filter(trip => trip.trip_id.endsWith('N'))
                .slice(0, 10) // Limit to first 10 trips
                .map(trip => (
                  <div key={trip.trip_id} className="trip-card">
                    <div className="trip-header">
                      <h4>{getTripDirection(trip.trip_id)}</h4>
                      <span className="route-id">{trip.route_id || currentLine.toUpperCase()}</span>
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
              {trips.filter(trip => trip.trip_id.endsWith('N')).length === 0 && 
                <p className="no-trips">No northbound trips available</p>
              }
            </div>
            
            {/* Southbound trips */}
            <div className="direction-column">
              <h3>Southbound</h3>
              {trips
                .filter(trip => trip.trip_id.endsWith('S'))
                .slice(0, 10)
                .map(trip => (
                  <div key={trip.trip_id} className="trip-card">
                    <div className="trip-header">
                      <h4>{getTripDirection(trip.trip_id)}</h4>
                      <span className="route-id">{trip.route_id || currentLine.toUpperCase()}</span>
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
              {trips.filter(trip => trip.trip_id.endsWith('S')).length === 0 && 
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