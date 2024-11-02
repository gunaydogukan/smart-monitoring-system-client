import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useLocation } from 'react-router-dom';
import '../styles/DisplayMap.css'; // CSS dosyamızı ekliyoruz

const containerStyle = {
    width: "100%",
    height: "100%",
};

const libraries = ["places"];

const DisplayMap = () => {
    const { state } = useLocation();
    const sensors = Array.isArray(state?.sensors) ? state.sensors : [state?.sensor];

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: "AIzaSyD_SgDBoNntGbcwChUDreSgHCwjDbld8xU", // Google API Key'inizi buraya ekleyin
        libraries,
    });

    const [selectedSensor, setSelectedSensor] = useState(null);
    const [map, setMap] = useState(null);
    const [sidebarExpanded, setSidebarExpanded] = useState(false); // Sidebar genişletme durumu

    const getMarkerIcon = (sensor) => {
        switch (sensor.type) {
            case 3:
                return 'https://img.icons8.com/ios-filled/50/000000/rain.png';
            case 1:
                return 'https://img.icons8.com/ios-filled/50/000000/temperature.png';
            case 2:
                return 'https://img.icons8.com/ios-filled/50/000000/tape-measure.png';
            default:
                return null;
        }
    };

    const handleDirections = (lat, lng) => {
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        window.open(directionsUrl, "_blank");
    };

    // Haritayı seçilen sensöre odaklamak için useEffect
    useEffect(() => {
        if (selectedSensor && map) {
            map.setCenter({ lat: parseFloat(selectedSensor.lat), lng: parseFloat(selectedSensor.lng) });
            map.setZoom(12); // Yakınlaştırma seviyesini ayarlayabilirsiniz
        }
    }, [selectedSensor, map]);

    useEffect(() => {
        if (map && sensors.length > 0) {
            sensors.forEach((sensor) => {
                const marker = new window.google.maps.Marker({
                    position: { lat: parseFloat(sensor.lat), lng: parseFloat(sensor.lng) },
                    map: map,
                    title: `Sensör ID: ${sensor.id} - ${sensor.def}`,
                    icon: getMarkerIcon(sensor),
                });

                marker.addListener('click', () => {
                    setSelectedSensor(sensor);
                });
            });
        }
    }, [map, sensors]);

    if (loadError) {
        return <div>Harita yüklenirken bir hata oluştu.</div>;
    }

    if (!isLoaded) {
        return <div>Harita yükleniyor...</div>;
    }

    return (
        <div style={{ display: "flex", width: '100%', height: '100vh' }}>
            {/* Sidebar */}
            <div style={{
                width: sidebarExpanded ? '25%' : '50px',
                backgroundColor: '#f0f0f0',
                padding: '20px',
                boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                transition: 'width 0.3s ease',
                overflowY: 'auto'
            }}>
                <div onClick={() => setSidebarExpanded(!sidebarExpanded)}
                     style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <img src="https://img.icons8.com/ios-filled/50/000000/menu.png" alt="Toggle Sidebar" />
                    {sidebarExpanded && <h2 style={{ marginLeft: '10px' }}>Sensörler</h2>}
                </div>
                {sidebarExpanded && (
                    <ul>
                        {sensors.map(sensor => (
                            <li key={sensor.id} onClick={() => setSelectedSensor(sensor)} style={{
                                cursor: 'pointer',
                                marginBottom: '10px',
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '5px'
                            }}>
                                {sensor.name} , {sensor.def} , (ID: {sensor.id})
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div style={{ width: '96%', height: '100%' }}>
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={{
                        lat: 41.6,
                        lng: 32.3,
                    }}
                    zoom={7}
                    onLoad={(mapInstance) => setMap(mapInstance)}
                >
                    {sensors.map((sensor) => (
                        <Marker
                            key={sensor.id}
                            position={{ lat: parseFloat(sensor.lat), lng: parseFloat(sensor.lng) }}
                            icon={getMarkerIcon(sensor)}
                            onClick={() => setSelectedSensor(sensor)}
                        />
                    ))}
                </GoogleMap>

                {/* Sensör bilgilerini gösteren üst bilgi kartı */}
                {selectedSensor && (
                    <div className="sensor-info-overlay">
                        <div className="sensor-info-header">
                            <h2>Sensör Bilgileri</h2>
                            <button className="close-button" onClick={() => setSelectedSensor(null)}>×</button>
                        </div>
                        <div className="sensor-info-content">
                            <p><strong>ID:</strong> {selectedSensor.id}</p>
                            <p><strong>Açıklama:</strong> {selectedSensor.def}</p>
                            <p><strong>Enlem:</strong> {selectedSensor.lat}</p>
                            <p><strong>Boylam:</strong> {selectedSensor.lng}</p>
                            <button className="sensor-info-button"
                                    onClick={() => handleDirections(selectedSensor.lat, selectedSensor.lng)}>
                                Yol Tarifi Al
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DisplayMap;
