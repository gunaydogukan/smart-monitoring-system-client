import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import SensorCheckBoxForm from '../../components/sensorCheck/sensorCheckBoxForm';
import LegendCard from '../../components/sensorCheck/LegendCard';
import '../../styles/sensorCheck/MapPage.css';
import Layout from "../../layouts/Layout";

const libraries = ['places'];
const center = { lat: 41.6279, lng: 32.2422 };
const mapOptions = {
    zoom: 10,
    mapTypeControl: true, // Harita türü kontrolü (Standart, Uydu, Arazi)
    zoomControl: true, // Yakınlaştırma/uzaklaştırma butonları
    fullscreenControl: true, // Tam ekran butonu
    streetViewControl: true, // Sokak görünümü kontrolü
    scaleControl: true, // Ölçek kontrolü
    rotateControl: true, // Döndürme kontrolü
};
const API_URL = process.env.REACT_APP_API_URL;
const MAP_API = process.env.REACT_APP_GOOGLE_MAP_API;

function MapPage({ isSidebarOpen }) {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: MAP_API,
        libraries,
    });

    const mapRef = useRef(null);
    const [sensors, setSensors] = useState([]);
    const [selectedSensor, setSelectedSensor] = useState(null);

    useEffect(() => {
        const fetchSensors = async () => {
            try {
                const response = await fetch(`${API_URL}/api/sensors/all-sensors`);
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setSensors(data);
            } catch (error) {
                console.error("Error fetching sensor data:", error);
            }
        };
        fetchSensors();
    }, []);

    const handleCloseModal = () => {
        setSelectedSensor(null);
    };

    if (!isLoaded) return <div>Loading...</div>;

    return (
        <Layout>
            <div className={`map-container ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
                <h2>Toplam Sensör Sayısı: {sensors.length}</h2>
                <div className="google-map">
                    <GoogleMap
                        mapContainerStyle={{
                            width: "100%",
                            height: "100%",
                        }}
                        center={center}
                        options={mapOptions}
                        onLoad={(map) => (mapRef.current = map)}
                    >
                        {sensors.map((sensor) => (
                            <Marker
                                key={sensor.id}
                                position={{ lat: sensor.lat, lng: sensor.lng }}
                                icon={getMarkerIcon(sensor)}
                                onClick={() => setSelectedSensor(sensor)}
                            />
                        ))}
                    </GoogleMap>
                </div>

                {selectedSensor && (
                    <div className="modal">
                        <div className="modal-content">
                            <span className="close" onClick={handleCloseModal}>&times;</span>
                            <SensorCheckBoxForm
                                selectedSensor={selectedSensor}
                                onClose={handleCloseModal}
                            />
                        </div>
                    </div>
                )}
                <LegendCard />
            </div>
        </Layout>
    );
}

// Marker ikonunu belirlemek için kullanılan fonksiyon
function getMarkerIcon(sensor) {
    switch (sensor.tur) {
        case 'Nem - Yağış':
            return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
        case 'Nem':
            return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
        case 'Seviye':
            return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
        case 'Eski Nem':
        case 'Eski Nem – Yağış':
            return 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png';
        case 'Eski Seviye':
            return 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png';
        default:
            return 'http://maps.google.com/mapfiles/ms/icons/gray-dot.png';
    }
}

export default MapPage;
