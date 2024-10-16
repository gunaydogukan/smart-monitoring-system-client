import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaCloudRain, FaThermometerHalf, FaRulerVertical } from 'react-icons/fa';
import Layout from "../layouts/Layout";

export default function SensorShow() {
    const { user } = useAuth();
    const [sensors, setSensors] = useState([]);
    const [sensorTypes, setSensorTypes] = useState({});

    // Backend'den sensör ve sensör tiplerini alma
    useEffect(() => {
        const fetchSensors = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/sensors', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Sensörler alınamadı!');
                }

                const data = await response.json();
                console.log('Gelen sensör verisi:', data); // Veriyi kontrol ediyoruz
                setSensors(data);
            } catch (error) {
                console.error('Sensörleri çekerken hata:', error);
                toast.error('Sensörleri alırken bir hata oluştu.');
            }
        };

        const fetchSensorTypes = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/type', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Sensör tipleri alınamadı!');
                }

                const data = await response.json();
                console.log('Gelen sensör tipleri:', data);

                // Gelen veriyi {id: 'Tür Adı'} şeklinde eşleyelim
                const types = data.reduce((acc, type) => {
                    acc[type.id] = type.type; // id -> type eşlemesi
                    return acc;
                }, {});
                setSensorTypes(types);
            } catch (error) {
                console.error('Sensör tipleri alınırken hata:', error);
                toast.error('Sensör tipleri alırken bir hata oluştu.');
            }
        };

        fetchSensors();
        fetchSensorTypes();
    }, [user.id]);

    // Sensör tipine göre uygun ikonu döndüren fonksiyon
    const getSensorIcon = (type) => {
        switch (type) {
            case 'Sıcaklık & Nem':
                return <FaThermometerHalf size={32} color="#e74c3c" />;
            case 'Mesafe':
                return <FaRulerVertical size={32} color="#2ecc71" />;
            case 'Yağmur':
                return <FaCloudRain size={32} color="#3498db" />;
            default:
                return <FaRulerVertical size={32} color="#95a5a6" />;
        }
    };

    return (
        <Layout>
            <div style={styles.container}>
                <ToastContainer />
                <h2>Kullanıcıya Ait Sensörler</h2>
                {sensors.length > 0 ? (
                    <div style={styles.cardContainer}>
                        {sensors.map((sensor) => {
                            const sensorTypeName = sensorTypes[sensor.type];  // ID'den isim eşleme
                            console.log(`Sensör tipi: ${sensorTypeName}`);  // Konsola yazdır

                            return (
                                <div key={sensor.id} style={styles.card}>
                                    {getSensorIcon(sensorTypeName)}
                                    <h3>{sensor.name}</h3>
                                    <p><strong>Açıklama:</strong> {sensor.def}</p>
                                    <p><strong>Tür:</strong> {sensorTypeName}</p>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p>Henüz kayıtlı bir sensörünüz yok.</p>
                )}
            </div>
        </Layout>
    );
}

const styles = {
    container: {
        padding: '20px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
    },
    cardContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        marginTop: '20px',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        transition: 'transform 0.2s',
    },
};
