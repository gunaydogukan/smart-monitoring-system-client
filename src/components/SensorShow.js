import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from "../layouts/Layout";

export default function SensorShow() {
    const { user } = useAuth(); // Oturum açmış kullanıcı bilgisi
    const [sensors, setSensors] = useState([]);

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
                setSensors(data);
            } catch (error) {
                console.error('Sensörleri çekerken hata:', error);
                toast.error('Sensörleri alırken bir hata oluştu.');
            }
        };

        fetchSensors();
    }, [user.id]);

    return (
        <Layout>


        <div style={styles.container}>
            <ToastContainer />
            <h2>Kullanıcıya Ait Sensörler</h2>
            {sensors.length > 0 ? (
                <ul style={styles.list}>
                    {sensors.map((sensor) => (
                        <li key={sensor.id}>
                            {sensor.name} - {sensor.location}
                        </li>
                    ))}
                </ul>
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
    },
    list: {
        listStyleType: 'none',
        padding: 0,
    },
};
