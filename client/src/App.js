import React, { useState, useEffect  } from 'react'

function App() {

  const [trips, setTrips] = useState([])

  useEffect(() => {
    fetch("/bdfm").then(
      res => res.json()
    ).then(
      data => {
        setTrips(data)
        console.log(data)
      }
    )
  }, [])

  return (
    <div>
      {trips.map((trip, i) => (
        <div key={trip.trip_id} style={{ border: '1px solid #ccc', margin: 10, padding: 10 }}>
          <h3>Trip ID: {trip.trip_id}</h3>
          <p>
            Start Date: {trip.start_date} <br />
            Start Time: {trip.start_time}
          </p>
          <h4>Stop Updates:</h4>
          <ul>
            {trip.stop_time_updates.map((stop, j) => (
              <li key={stop.stop_id + j}>
                <strong>{stop.stop_id}</strong>
                <br />
                Arrival: {stop.arrival_time}
                <br />
                Departure: {stop.departure_time}
              </li>
            ))}
          </ul>
        </div>
      ))}

      {trips.length === 0 && <p>Loading trips…</p>}
    </div>
  )
}

export default App
