import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Layout from "../layouts/Layout";
import "../styles/SoilMoistureMap.css";
import LoadingScreen from "../components/LoadingScreen"; // Yeni CSS dosyasını içe aktarıyoruz

const API_URL = process.env.REACT_APP_API_URL;

const SoilMoistureMap = () => {
    const [sensorData, setSensorData] = useState([]);
    const [hoveredSensor, setHoveredSensor] = useState(null);
    const [clickedSensor, setClickedSensor] = useState(null);
    const [selectedSensor, setSelectedSensor] = useState(null);
    const [map, setMap] = useState(null);
    const [isListOpen, setIsListOpen] = useState(false);
    const [loading, setLoading] = useState(true); // Yükleme durumu

    useEffect(() => {
        const fetchSensorData = async () => {
            try {
                setLoading(true); // Veri yüklenirken loading aktif
                const response = await fetch(`${API_URL}/api/soil-moisture-map`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                const data = await response.json();
                setSensorData(data.sensors); // Verileri state'e kaydet
            } catch (error) {
                console.error("Nem haritası hatası:", error);
            } finally {
                setLoading(false); // Yükleme tamamlandı
            }
        };

        fetchSensorData();
    }, []);



    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/leaflet.heat/dist/leaflet-heat.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const HeatmapLayer = ({ data }) => {
        const mapInstance = useMap();

        useEffect(() => {
            if (selectedSensor && mapInstance) {
                mapInstance.flyTo([selectedSensor.lat, selectedSensor.lng], 12, {
                    animate: false,
                    duration: 1.2,
                });
            }
        }, [selectedSensor, mapInstance]);

        useEffect(() => {
            if (data.length > 0 && window.L.heatLayer) {
                const heatData = data.map((sensor) => [
                    sensor.lat,
                    sensor.lng,
                    sensor.data[0]?.humidity / 100 || 0,
                ]);

                const heatLayer = window.L.heatLayer(heatData, {
                    radius: 20,
                    blur: 15,
                    maxZoom: 10,
                    gradient: { 0.30: "red", 0.50: "lime", 1: "green" },
                });

                heatLayer.addTo(mapInstance);

                mapInstance.on("mousemove", (e) => {
                    const sensor = data.find(
                        (s) =>
                            Math.abs(s.lat - e.latlng.lat) < 0.008 &&
                            Math.abs(s.lng - e.latlng.lng) < 0.008
                    );
                    setHoveredSensor(sensor || null);
                });

                mapInstance.on("click", (e) => {
                    const sensor = data.find(
                        (s) =>
                            Math.abs(s.lat - e.latlng.lat) < 0.01 &&
                            Math.abs(s.lng - e.latlng.lng) < 0.01
                    );
                    setClickedSensor(sensor || null);
                });

                return () => {
                    mapInstance.removeLayer(heatLayer);
                    mapInstance.off("mousemove");
                    mapInstance.off("click");
                };
            }
        }, [data, mapInstance]);

        return null;
    };
    if (loading) {
        return <LoadingScreen />;
    }
    const SensorList = ({ sensors }) => {
        return (
            <div className="soil-moisture-map-sensor-list">
                <h3 className="soil-moisture-map-sensor-list-title">Sensör Listesi</h3>
                <ul className="soil-moisture-map-sensor-list-items">
                    {sensors.map((sensor) => (
                        <li
                            key={sensor.datacode}
                            className="soil-moisture-map-sensor-list-item"
                            onClick={() => {
                                setSelectedSensor(sensor);
                                setIsListOpen(false);
                            }}
                        >
                            <strong>{sensor.name}</strong>
                            <br />
                            Nem: {sensor.data[0]?.humidity?.toFixed(2)}%
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <Layout>
            <div className="soil-moisture-map-container">
                <h1 className="soil-moisture-map-title">Toprak Nem Haritası</h1>

                <div className="soil-moisture-map-wrapper">
                    <button
                        className="soil-moisture-map-toggle-button"
                        onClick={() => setIsListOpen((prev) => !prev)}
                    >
                        {isListOpen ? "Listeyi Kapat" : "Listeyi Aç"}
                    </button>

                    {isListOpen && <SensorList sensors={sensorData} />}

                    <div className="soil-moisture-map">
                        <MapContainer
                            id="map"
                            center={[41.4, 32.25]}
                            zoom={7}
                            style={{ height: "100%", width: "100%" }}
                            whenCreated={(mapInstance) => setMap(mapInstance)}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="&copy; OpenStreetMap contributors"
                            />
                            <HeatmapLayer data={sensorData} />
                            {(hoveredSensor || clickedSensor) && (
                                <div className="soil-moisture-map-info-box">
                                    <p>
                                        <strong>Sensör Adı:</strong> {(hoveredSensor || clickedSensor)?.name}
                                    </p>
                                    <p>
                                        <strong>Nem (%):</strong>{" "}
                                        {(hoveredSensor || clickedSensor)?.data[0]?.humidity?.toFixed(2)}
                                    </p>
                                </div>
                            )}
                        </MapContainer>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default SoilMoistureMap;
