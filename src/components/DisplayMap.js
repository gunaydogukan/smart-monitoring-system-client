import React, { useEffect, useState } from "react";
import {GoogleMap, InfoWindow, Marker, useLoadScript} from "@react-google-maps/api";
import { fetchSensorData } from "../services/dataService";
import "../styles/DisplayMap.css";

const containerStyle = {
    width: "100%",
    height: "100%",
};

const libraries = ["places"];

const DisplayMap = () => {
    const MAP_API = process.env.REACT_APP_GOOGLE_MAP_API;

    const [sensors, setSensors] = useState([]);
    const [selectedSensor, setSelectedSensor] = useState(null);
    const [map, setMap] = useState(null);
    const [sidebarExpanded, setSidebarExpanded] = useState(false);
    const defaultCenter = {
        lat: 41.6367, // Bartın merkez enlemi
        lng: 32.3411, // Bartın merkez boylamı
    };
    const [sensorType, setSensorType] = useState(null);
    const [sensorData, setSensorData] = useState({});
    const [averages, setAverages] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mapCenter, setMapCenter] = useState(defaultCenter); // Harita merkezi için state

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: MAP_API,
        libraries,
    });

    // sessionStorage'dan sensörleri alma
    useEffect(() => {
        const storedSensors = sessionStorage.getItem("sensorsForMap");
        if (storedSensors) {
            try {
                const parsedSensors = JSON.parse(storedSensors);
                setSensors(Array.isArray(parsedSensors) ? parsedSensors : [parsedSensors]);
            } catch (err) {
                console.error("JSON parse hatası:", err);
            }
        } else {
            console.warn("Sensör verisi bulunamadı.");
            setSensors([]); // Varsayılan olarak boş bir dizi
        }
    }, []);
    useEffect(() => {
        if (map && sensors.length > 0) {
            sensors.forEach((sensor) => {
                const marker = new window.google.maps.Marker({
                    position: { lat: parseFloat(sensor.lat), lng: parseFloat(sensor.lng) },
                    map: map,
                    title: `Sensör: ${sensor.name} (${sensor.datacode})`,
                    icon: getMarkerIcon(sensor),
                });

                marker.addListener("click", () => {
                    setSelectedSensor(sensor);
                });
            });
        }
    }, [map, sensors]); // Sensörler veya harita değiştiğinde markerları yeniden oluştur

    useEffect(() => {
        if (selectedSensor) {
            setMapCenter({
                lat: parseFloat(selectedSensor.lat),
                lng: parseFloat(selectedSensor.lng),
            });
        }
    }, [selectedSensor]);
    const getMarkerIcon = (sensor) => {
        switch (sensor.type) {
            case 1:
                return "https://maps.google.com/mapfiles/ms/icons/blue-dot.png";
            case 2:
                return "https://maps.google.com/mapfiles/ms/icons/green-dot.png";
            case 3:
                return "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
            case 4:
                return "https://maps.google.com/mapfiles/ms/icons/orange-dot.png";
            default:
                return "https://maps.google.com/mapfiles/ms/icons/gray-dot.png";
        }
    };
    const getTypeName = (type) => {
        switch (type) {
            case 1:
                return "Sıcaklık & Nem";
            case 2:
                return "Mesafe";
            case 3:
                return "Yağmur";
            case 4:
                return "Basınç";
            default:
                return "Bilinmiyor";
        }
    };
    const handleDirections = (lat, lng) => {
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        window.open(directionsUrl, "_blank");
    };

    useEffect(() => {
        if (selectedSensor && map) {
            map.setCenter({ lat: parseFloat(selectedSensor.lat), lng: parseFloat(selectedSensor.lng) });
            map.setZoom(12);
        }

        if (selectedSensor) {
            setLoading(true);
            setError(null);

            Promise.all([
                fetchSensorData(selectedSensor, "1 Gün"),
                fetchSensorData(selectedSensor, "1 Hafta"),
                fetchSensorData(selectedSensor, "1 Ay"),
            ])
                .then(([data1Day, data1Week, data1Month]) => {
                    setSensorData({
                        dayData: data1Day.data,
                        weekData: data1Week.data,
                        monthData: data1Month.data,
                    });
                    setAverages({
                        avg1Day: data1Day.ortalama,
                        avg1Week: data1Week.ortalama,
                        avg1Month: data1Month.ortalama,
                    });
                    setSensorType(data1Day.type.type);
                    setLoading(false);
                })
                .catch((err) => {
                    setError(err.message);
                    setLoading(false);
                });
        } else {
            setSensorData({});
            setAverages({});
        }
    }, [selectedSensor, map]);

    const sonUcVeri = (data) => {
        if (!data) return [];
        const lastThreeData = data.slice(-3);

        return lastThreeData.map((item) => {
            const dataFields = [];
            Object.keys(item).forEach((key) => {
                if (key !== "time") {
                    dataFields.push({
                        label: key,
                        value: item[key] || "Veri yok",
                    });
                }
            });
            return dataFields;
        });
    };

    if (loadError) {
        return <div>Harita yüklenirken bir hata oluştu.</div>;
    }

    if (!isLoaded) {
        return <div>Harita yükleniyor...</div>;
    }


    return (
        <div style={{ display: "flex", width: "100%", height: "100vh" }}>
            {/* Sidebar */}
            <div
                style={{
                    width: sidebarExpanded ? "12%" : "35px",
                    backgroundColor: "#f0f0f0",
                    padding: sidebarExpanded ? "20px" : "5px",
                    boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
                    transition: "width 0.3s ease",
                    overflowY: "auto",
                }}
            >
                <div
                    onClick={() => setSidebarExpanded(!sidebarExpanded)}
                    style={{ cursor: "pointer", display: "flex", alignItems: "center", marginBottom: "10px" }}
                >
                    <img
                        src="https://img.icons8.com/ios-filled/50/000000/menu.png"
                        style={{ width: "34px", height: "34px" }}
                        alt="Toggle Sidebar"
                    />
                    {sidebarExpanded && <h2 style={{ marginLeft: "10px" }}>Sensörler</h2>}
                </div>
                {sidebarExpanded && (
                    <ul>
                        {sensors.map((sensor) => (
                            <li
                                key={sensor.id}
                                onClick={() => setSelectedSensor(sensor)}
                                style={{
                                    cursor: "pointer",
                                    marginBottom: "10px",
                                    padding: "10px",
                                    border: "1px solid #ccc",
                                    borderRadius: "5px",
                                }}
                            >
                                {sensor.name} , Kod: {sensor.datacode}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Harita */}
            <div style={{ flex: 1, height: "100%" }}>
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={mapCenter}
                    zoom={10}
                    onLoad={(mapInstance) => setMap(mapInstance)}
                >
                    {sensors.map((sensor) => (
                        <Marker
                            key={sensor.id}
                            position={{ lat: parseFloat(sensor.lat), lng: parseFloat(sensor.lng) }}
                            icon={getMarkerIcon(sensor)}
                            onClick={() => setSelectedSensor(sensor)}
                        >
                            {/* Tip Adı Gösterimi */}
                            <InfoWindow position={{ lat: parseFloat(sensor.lat), lng: parseFloat(sensor.lng) }}>
                                <div className="info-window">{getTypeName(sensor.type)}</div>
                            </InfoWindow>

                        </Marker>
                    ))}
                </GoogleMap>

                {/* Modal */}
                {selectedSensor && (
                    <div className="modal-overlay">
                        <div className="modal-content large-modal">
                            <div className="modal-header">
                                <h2>Sensör Bilgileri</h2>
                                <div className="sensor-details">
                                    <p>
                                        <strong>İsim:</strong> {selectedSensor.name}
                                    </p>
                                    <p>
                                        <strong>DataCode:</strong> {selectedSensor.datacode}
                                    </p>
                                    <p>
                                        <strong>Enlem, Boylam:</strong> {selectedSensor.lat}, {selectedSensor.lng}
                                    </p>
                                    <p>
                                        <strong>Açıklama:</strong> {selectedSensor.def}
                                    </p>
                                    <p>
                                        <strong>Sensör Tipi:</strong> {sensorType}
                                    </p>
                                </div>
                                <button className="close-button" onClick={() => setSelectedSensor(null)}>
                                    ×
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="veri-section">
                                    <h4>Son Üç Veri</h4>
                                    <div className="veri-container">
                                        {sonUcVeri(sensorData.dayData).map((item, index) => (
                                            <div key={index} className="veri-box">
                                                {item.map((field, i) => (
                                                    <p key={i}>
                                                        <strong>{field.label}:</strong> {field.value}
                                                    </p>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="veri-section">
                                    <h4>Ortalamalar</h4>
                                    <div className="veri-container">
                                        {Object.keys(averages).map((key, index) => (
                                            <div key={index} className="veri-box">
                                                <h5>{key.replace("avg", "")} Ortalama</h5>
                                                <ul>
                                                    {Object.entries(averages[key]).map(([subKey, value], i) => (
                                                        <li key={i}>
                                                            <strong>{subKey}:</strong> {value.toFixed(2)}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="sensor-info-button"
                                    onClick={() => handleDirections(selectedSensor.lat, selectedSensor.lng)}
                                >
                                    Yol Tarifi Al
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DisplayMap;
