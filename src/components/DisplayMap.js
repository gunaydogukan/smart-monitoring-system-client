import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";
import { useLocation } from 'react-router-dom'; // useLocation ile yönlendirme verisini alacağız

// Harita stil ve başlangıç merkezi
const containerStyle = {
    width: "100%",
    height: "400px",
};

// Statik libraries array
const libraries = ["places"];

const DisplayMap = () => {
    const { state } = useLocation(); // useLocation ile sensör verisini alıyoruz
    const sensor = state?.sensor; // Gelen sensör verisini alıyoruz
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: "AIzaSyD_SgDBoNntGbcwChUDreSgHCwjDbld8xU", // Google API key'inizi buraya ekleyin
        libraries, // Statik libraries array
    });

    const [map, setMap] = useState(null); // Haritayı referans almak için state
    const [infoWindowOpen, setInfoWindowOpen] = useState(false); // InfoWindow durumu

    const getMarkerIcon = (sensor) => {
        if (sensor) {
            if(sensor.type=="1"){
                return 'https://img.icons8.com/ios-filled/50/000000/rain.png';
            }else if(sensor.type=="2"){
                return 'https://img.icons8.com/ios-filled/50/000000/temperature.png';
            }else if(sensor.type=="3"){
                return 'https://img.icons8.com/ios-filled/50/000000/tape-measure.png';
            }else{
                console.log("....");
            }
        } else if (sensor.status === 'inactive') {
            console.log("...."); // Pasif sensörler için kırmızı ikon EKLENECEK
        }
    };

    useEffect(() => {
        if (map && sensor) {
            const marker = new window.google.maps.Marker({
                position: { lat: parseFloat(sensor.lat), lng: parseFloat(sensor.lng) },
                map: map, // Marker'ı haritaya ekliyoruz
                title: `Sensör ID: ${sensor.id} - ${sensor.def}`,
                icon: getMarkerIcon(sensor),
            });

            marker.addListener('click', () => {
                setInfoWindowOpen(true); // Marker'a tıklanınca InfoWindow açılır
            });
        }
    }, [map, sensor]); // Harita ve sensör değiştikçe marker'ı yerleştir

    if (!sensor) {
        return <div>Haritada gösterilecek sensör bulunamadı!</div>;
    }

    const handleDirections = () => {
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${sensor.lat},${sensor.lng}`;
        window.open(directionsUrl, "_blank"); // Yol tarifi için yeni sayfada aç
    };

    return (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
                Sensör Haritası
            </h1> {/* Sayfanın üstüne ortalanmış başlık ekliyoruz */}

            {isLoaded ? (
                <div>
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={{
                            lat: parseFloat(sensor.lat),
                            lng: parseFloat(sensor.lng),
                        }} // Seçilen sensörün konumunu merkeze alıyoruz
                        zoom={15}
                        onLoad={(mapInstance) => setMap(mapInstance)} // Harita yüklendiğinde map referansını alıyoruz
                    >
                        {infoWindowOpen && (
                            <InfoWindow
                                position={{ lat: parseFloat(sensor.lat) + 0.001, lng: parseFloat(sensor.lng) + 0.001 }} // InfoWindow biraz kenarda çıkıyor
                                onCloseClick={() => setInfoWindowOpen(false)} // Pencereyi kapatma işlevi
                                options={{
                                    pixelOffset: new window.google.maps.Size(-10, -40), // InfoWindow'un konumunu biraz yukarı kaydırma
                                }}
                            >
                                <div style={{
                                    backgroundColor: "#fff",
                                    padding: "10px",
                                    borderRadius: "10px",
                                    boxShadow: "0 4px 8px rgba(0,0,0,0.3)", // Gölge ekleyerek estetik bir görünüm sağlıyoruz
                                    textAlign: "left",
                                    maxWidth: "200px", // Boyutunu ayarladık
                                    fontFamily: "Arial, sans-serif",
                                }}>
                                    <h3 style={{
                                        fontSize: "18px",
                                        color: "#333",
                                        marginBottom: "8px"
                                    }}>Sensör Bilgisi</h3>
                                    <p><strong>Açıklama:</strong> {sensor.def}</p>
                                    <p><strong>Enlem:</strong> {sensor.lat}</p>
                                    <p><strong>Boylam:</strong> {sensor.lng}</p>
                                    <button
                                        onClick={handleDirections}
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
                                    </button> {/* Estetik yol tarifi butonu */}
                                </div>
                            </InfoWindow>
                        )}
                    </GoogleMap>
                </div>
            ) : (
                <div>Harita yükleniyor...</div>
            )}
        </div>
    );
};

export default DisplayMap;
