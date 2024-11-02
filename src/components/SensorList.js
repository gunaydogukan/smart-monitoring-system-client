import React from 'react';
import { useNavigate } from 'react-router-dom'; // Yönlendirme için import

export default function SensorList({ sensors = [] }) { // Varsayılan olarak boş dizi ayarlandı
    const navigate = useNavigate(); // Yönlendirme işlevi

    const handleViewOnMap = (sensor) => {
        navigate('/map', { state: { sensor } }); // Sensör verisini taşıyarak harita sayfasına yönlendir
    };

    const handleViewOnChart = (sensor) => {
        console.log(sensor)
        if (sensor) {
            navigate('/charts', { state: { sensor } });
        } else {
            console.error('Sensör verisi mevcut değil.');
        }
    };

    return (
        <div>
            {/* Sensör Listesi */}
            <div style={styles.sensorListContainer}>
                {sensors.length > 0 ? (
                    sensors.map(sensor => (
                        <div key={sensor.id} style={styles.sensorCard}>
                            <h3 style={styles.sensorName}>{sensor.name}</h3>
                            <p style={styles.sensorLocation}>{sensor.location}</p>
                            <button style={styles.mapButton} onClick={() => handleViewOnMap(sensor)}>
                                Haritada Göster
                            </button>
                            <button style={styles.mapButton} onClick={() => handleViewOnChart(sensor)}>
                                Grafik Göster
                            </button>
                        </div>
                    ))
                ) : (
                    <p>Henüz kayıtlı bir sensör yok.</p>
                )}
            </div>
        </div>
    );
}

const styles = {
    sensorListContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '20px',
    },
    sensorCard: {
        backgroundColor: '#f9f9f9',
        border: '1px solid #ddd',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        maxWidth: '250px',
        textAlign: 'center',
        transition: 'transform 0.2s',
        cursor: 'pointer',
    },
    sensorName: {
        fontSize: '1.5rem',
        margin: '0 0 10px 0',
        color: '#333',
    },
    sensorLocation: {
        fontSize: '1rem',
        margin: '0 0 15px 0',
        color: '#777',
    },
    mapButton: {
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
};
