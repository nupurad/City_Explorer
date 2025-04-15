import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import './App.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix the default icon issue
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});


function App() {
  const [city, setCity] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setError(null);  // reset error
      const res = await axios.get(`/explore-city?city=${city}`);
      console.log("Received data:", res.data);
      setData(res.data);
    } catch (err) {
      console.error("Error fetching city data:", err);
      setError("Failed to fetch city data.");
    }
  };

  return (
    <div className="container">
    <h1>🌆 City Explorer</h1>
    <div className="input-group">
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter city name"
      />
      <button onClick={fetchData}>Get Info</button>
    </div>
  
      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
  
      {data && data.weather && data.cityInfo && (
        <div style={{ marginTop: '2rem' }}>
          <h2>{data.weather.name}</h2>
          <p>🌡️ Temp: {data.weather.main.temp}°C</p>
          <p>☁️ Weather: {data.weather.weather[0].description}</p>
  
          <h3>🌍 City Info</h3>
          <p>Country: {data.cityInfo.country}</p>
          <p>Region: {data.cityInfo.region}</p>
          <p>Population: {data.cityInfo.population?.toLocaleString() || 'N/A'}</p>
        </div>
      )}
  
      {data?.cityInfo?.latitude && data?.cityInfo?.longitude && (
        <div className="map-wrapper" style={{ height: "400px", width: "100%" }}>
          <MapContainer
              center={[data.cityInfo.latitude, data.cityInfo.longitude]}
              zoom={10}
              style={{ height: "100%", width: "100%" }}
              key={`${data.cityInfo.latitude}-${data.cityInfo.longitude}`} // optional force remount
            >
              <RecenterMap
                lat={data.cityInfo.latitude}
                lng={data.cityInfo.longitude}
              />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© OpenStreetMap contributors'
              />
              <Marker position={[data.cityInfo.latitude, data.cityInfo.longitude]}>
                <Popup>
                  {data.weather.name}, {data.cityInfo.country}
                </Popup>
              </Marker>
          </MapContainer>

        </div>
      )}
    </div>
  );
}

function RecenterMap({ lat, lng }) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lng], 10); // or whatever zoom you prefer
  }, [lat, lng, map]);

  return null;
}
export default App;
