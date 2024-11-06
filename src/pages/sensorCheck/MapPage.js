// src/pages/MapPage.js
import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import SensorCheckBoxForm from '../../components/sensorCheck/sensorCheckBoxForm';
import LegendCard from '../../components/sensorCheck/LegendCard'; // Import the LegendCard component
import '../../styles/sensorCheck/MapPage.css';

const mapContainerStyle = {
    width: '100%',
    height: '80vh',
};
const center = { lat: 41.6279, lng: 32.2422 };
const mapOptions = {
    zoom: 10,
    disableDefaultUI: true,
};

function MapPage() {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: 'AIzaSyD_SgDBoNntGbcwChUDreSgHCwjDbld8xU',
    });

    const mapRef = useRef(null);
    const [sensors, setSensors] = useState([]);
    const [selectedSensor, setSelectedSensor] = useState(null);

    useEffect(() => {
        const fetchSensors = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/sensors/all-sensors');
                const data = await response.json();
                setSensors(data);
            } catch (error) {
                console.error("Error fetching sensor data:", error);
            }
        };

        fetchSensors();
    }, []);

    useEffect(() => {
        if (isLoaded && mapRef.current) {
            sensors.forEach(sensor => {
                const MarkerType = window.google?.maps?.marker?.AdvancedMarkerElement || window.google.maps.Marker;
                const marker = new MarkerType({
                    position: { lat: sensor.lat, lng: sensor.lng },
                    map: mapRef.current,
                    title: sensor.name,
                    icon: getMarkerIcon(sensor),
                });

                marker.addListener('click', () => {
                    setSelectedSensor(sensor);
                });
            });
        }
    }, [isLoaded, sensors]);

    const handleCloseModal = () => {
        setSelectedSensor(null);
    };

    if (!isLoaded) return <div>Loading...</div>;

    return (
        <div>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                options={mapOptions}
                onLoad={map => (mapRef.current = map)}
            />

            <LegendCard /> {/* Add the LegendCard component */}

            {selectedSensor && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={handleCloseModal}>
                            &times;
                        </span>
                        <h2>{`${selectedSensor.name} / ${selectedSensor.tur}`}</h2>
                        <SensorCheckBoxForm selectedSensor={selectedSensor} onClose={handleCloseModal} />
                    </div>
                </div>
            )}
        </div>
    );
}

// Function to determine marker icon
function getMarkerIcon(sensor) {
    if (sensor.tur === 'Nem - Yağış') {
        return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
    } else if (sensor.tur === 'Nem') {
        return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
    } else if (sensor.tur === 'Seviye') {
        return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
    } else if (sensor.tur === 'Eski Nem' || sensor.tur === 'Eski Nem - Yağış') {
        return 'http://maps.google.com/mapfiles/ms/icons/gray-dot.png';
    } else if (sensor.tur === 'Eski Seviye') {
        return 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png';
    } else {
        return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
    }
}

export default MapPage;
