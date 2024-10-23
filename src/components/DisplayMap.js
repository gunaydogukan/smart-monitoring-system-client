import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";
import { useLocation } from 'react-router-dom'; // useLocation ile yönlendirme verisini alıyoruz

// Harita stil ve başlangıç merkezi
const containerStyle = {
    width: "100%",
    height: "400px",
};

// Statik libraries array
const libraries = ["places"];

const DisplayMap = () => {
    const { state } = useLocation(); // useLocation ile sensör verisini alıyoruz
    const sensors = Array.isArray(state?.sensors) ? state.sensors : [state?.sensor]; // Tek sensör veya çok sensör için ayarlama
    console.log(sensors); // Gelen sensörleri kontrol ediyoruz

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: "AIzaSyD_SgDBoNntGbcwChUDreSgHCwjDbld8xU", // Google API Key'inizi buraya ekleyin
        libraries,
    });

    const [selectedSensor, setSelectedSensor] = useState(null); // Seçilen sensör için state
    const [map, setMap] = useState(null); // Haritayı referans almak için state

    // Marker iconlarını sensör tipine göre alıyoruz
    const getMarkerIcon = (sensor) => {
        if (sensor.type === "1") {
            return 'https://img.icons8.com/ios-filled/50/000000/rain.png';
        } else if (sensor.type === "2") {
            return 'https://img.icons8.com/ios-filled/50/000000/temperature.png';
        } else if (sensor.type === "3") {
            return 'https://img.icons8.com/ios-filled/50/000000/tape-measure.png';
        } else {
            return null;
        }
    };

    const handleDirections = (lat, lng) => {
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        window.open(directionsUrl, "_blank"); // Yol tarifi için yeni sayfada aç
    };

    useEffect(() => {
        if (map && sensors.length > 0) {
            // Çoklu sensörler için marker ekliyoruz
            sensors.forEach((sensor) => {
                const marker = new window.google.maps.Marker({
                    position: { lat: parseFloat(sensor.lat), lng: parseFloat(sensor.lng) },
                    map: map,
                    title: `Sensör ID: ${sensor.id} - ${sensor.def}`,
                    icon: getMarkerIcon(sensor),
                });

                marker.addListener('click', () => {
                    setSelectedSensor(sensor); // Marker'a tıklanınca InfoWindow açılır
                });
            });
        }
    }, [map, sensors]);

    // Harita yüklenmezse hata mesajı
    if (loadError) {
        return <div>Harita yüklenirken bir hata oluştu.</div>;
    }

    // Harita yüklenmeden önce gösterilecek mesaj
    if (!isLoaded) {
        return <div>Harita yükleniyor...</div>;
    }

    return (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
                Sensör Haritası
            </h1>

            <GoogleMap
                mapContainerStyle={containerStyle}
                center={{
                    lat: parseFloat(sensors[0].lat), // İlk sensörü merkeze alıyoruz
                    lng: parseFloat(sensors[0].lng),
                }}
                zoom={15}
                onLoad={(mapInstance) => setMap(mapInstance)} // Harita yüklendiğinde map referansını alıyoruz
            >
                {selectedSensor && (
                    <InfoWindow
                        position={{
                            lat: parseFloat(selectedSensor.lat),
                            lng: parseFloat(selectedSensor.lng),
                        }}
                        onCloseClick={() => setSelectedSensor(null)} // Pencereyi kapatma işlevi
                    >
                        <div style={{
                            backgroundColor: "#fff",
                            padding: "10px",
                            borderRadius: "10px",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                            textAlign: "left",
                            maxWidth: "200px",
                            fontFamily: "Arial, sans-serif",
                        }}>
                            <h3 style={{
                                fontSize: "18px",
                                color: "#333",
                                marginBottom: "8px"
                            }}>Sensör Bilgisi</h3>
                            <p><strong>Açıklama:</strong> {selectedSensor.def}</p>
                            <p><strong>Enlem:</strong> {selectedSensor.lat}</p>
                            <p><strong>Boylam:</strong> {selectedSensor.lng}</p>
                            <button
                                onClick={() => handleDirections(selectedSensor.lat, selectedSensor.lng)}
                                style={{
                                    backgroundColor: "#007BFF",
                                    color: "#fff",
                                    border: "none",
                                    padding: "8px 12px",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    marginTop: "10px",
                                    textAlign: "center"
                                }}
                            >
                                Yol Tarifi Al
                            </button>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
};

export default DisplayMap;
