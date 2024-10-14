import React, { useEffect, useState } from 'react';
import Layout from "../layouts/Layout";
export default function SensorShow() {
    const [sensors, setSensors] = useState([]);

    useEffect(() => {
        const fetchSensors = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/sensors');
                const data = await response.json();
                setSensors(data);
            } catch (error) {
                console.error('Sensör verileri alınırken hata:', error);
            }
        };

        fetchSensors();
    }, []);

    return (
        <Layout>
        <div style={styles.container}>
            <h2>Sensör Listesi</h2>
            <ul style={styles.list}>
                {sensors.map(sensor => (
                    <li key={sensor.id}>
                        {sensor.name} - {sensor.location}
                    </li>
                ))}
            </ul>
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
