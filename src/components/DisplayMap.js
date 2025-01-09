import React, {useEffect, useRef, useState} from "react";
import {GoogleMap, InfoWindow, Marker, useLoadScript} from "@react-google-maps/api";
import { fetchSensorData } from "../services/dataService";
import "../styles/DisplayMap.css";
import LoadingScreen from "./LoadingScreen";

const containerStyle = {
    width: "100%",
    height: "100%",
};

const libraries = ["places"];

const DisplayMap = () => {
    const MAP_API = process.env.REACT_APP_GOOGLE_MAP_API;
    const mapRef = useRef(null);

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
                        "1 Günlük": data1Day.ortalama,
                        "1 Haftalık": data1Week.ortalama,
                        "1 Aylık": data1Month.ortalama,
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
        return <LoadingScreen />;
    }
    const handleSidebarToggle = () => {
        setSidebarExpanded(!sidebarExpanded);

        // Google Map yeniden boyutlandırmayı tetikleme
        setTimeout(() => {
            if (mapRef.current) {
                const mapInstance = mapRef.current;
                window.google.maps.event.trigger(mapInstance, "resize");
                mapInstance.setCenter(defaultCenter); // Merkez harita konumunu koru
            }
        }, 300); // Sidebar geçiş animasyon süresine paralel
    };

    return (
        <div className={`display-map-container ${sidebarExpanded ? "sidebar-open" : "sidebar-closed"}`}>
            {/* Hamburger Menu Button */}
            <button
                className="sidebar-toggle-button"
                onClick={handleSidebarToggle}
            >
                ☰
            </button>

            {/* Sidebar */}
            <div className={`display-map-sidebar ${sidebarExpanded ? "expanded" : "collapsed"}`}>
                <ul>
                    {sensors.map((sensor) => (
                        <li
                            key={sensor.id}
                            onClick={() => setSelectedSensor(sensor)}
                        >
                            {sensor.name} , Kod: {sensor.datacode}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Harita */}
            <div className="display-map-map">
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={defaultCenter}
                    zoom={10}
                    onLoad={(mapInstance) => {
                        setMap(mapInstance);
                        mapRef.current = mapInstance;
                    }}
                >
                    {sensors.map((sensor) => (
                        <Marker
                            key={sensor.id}
                            position={{
                                lat: parseFloat(sensor.lat),
                                lng: parseFloat(sensor.lng),
                            }}
                            icon={getMarkerIcon(sensor)}
                            onClick={() => setSelectedSensor(sensor)}
                        />
                    ))}
                </GoogleMap>
            </div>

            {/* Modal */}
            {selectedSensor && (
                <div className="display-map-modal-overlay">
                    <div className="display-map-modal-content large-modal">
                        <div className="display-map-modal-header">
                            <h2>Sensör Bilgileri</h2>
                            <button
                                className="close-button_veri"
                                onClick={() => setSelectedSensor(null)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="display-map-modal-body">
                            <div className="display-map-sensor-details">
                                <p>
                                    <strong>İsim:</strong> {selectedSensor.name}
                                </p>
                                <p>
                                    <strong>Veri Kodu:</strong> {selectedSensor.datacode}
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
                            <div className="display-map-veri-section">
                                <h4>Son Üç Veri</h4>
                                <div className="display-map-veri-container">
                                    {sonUcVeri(sensorData.dayData).map((item, index) => (
                                        <div key={index} className="display-map-veri-box">
                                            {item.map((field, i) => (
                                                <p key={i}>
                                                    <strong>{field.label}:</strong> {field.value}
                                                </p>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="display-map-veri-section">
                                <h4>Ortalamalar</h4>
                                <div className="display-map-veri-container">
                                    {Object.keys(averages).map((key, index) => (
                                        <div key={index} className="display-map-veri-box">
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
                        <div className="display-map-modal-footer">
                            <button
                                className="display-map-sensor-info-button"
                                onClick={() =>
                                    handleDirections(
                                        selectedSensor.lat,
                                        selectedSensor.lng
                                    )
                                }
                            >
                                Yol Tarifi Al
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DisplayMap;
