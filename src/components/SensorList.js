import React, { useState } from 'react';
import Modal from './Modal';
import { useTheme } from '../contexts/ThemeContext';
import styles from '../styles/SensorList.module.css';
import { useNavigate } from 'react-router-dom';

export default function SensorList({ sensors = [] }) {
    const { isDarkMode } = useTheme();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSensor, setSelectedSensor] = useState(null);
    const navigate = useNavigate();
    const handleViewOnMap = (sensor) => {
        navigate('/map', { state: { sensor } });
    };

    const handleViewOnChart = (sensor) => {
        if (sensor) {
            setSelectedSensor(sensor);
            setIsModalOpen(true); // Modal açılıyor
        } else {
            console.error('Sensör verisi mevcut değil.');
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedSensor(null);
    };

    return (
        <div className={`${styles.container} ${isDarkMode ? styles.containerDark : styles.containerLight}`}>
            <div className={styles.sensorListContainer}>
                {sensors.length > 0 ? (
                    sensors.map(sensor => (
                        <div key={sensor.id} className={`${styles.sensorCard} ${isDarkMode ? styles.sensorCardDark : styles.sensorCardLight}`}>
                            <h3 className={styles.sensorName}>{sensor.name}</h3>
                            <p className={styles.sensorLocation}>{sensor.location}</p>
                            <button
                                className={`${styles.mapButton} ${isDarkMode ? styles.mapButtonDark : styles.mapButtonLight}`}
                                onClick={() => handleViewOnMap(sensor)}
                            >
                                Haritada Göster
                            </button>
                            <button
                                className={`${styles.mapButton} ${styles.buttonSpacing} ${isDarkMode ? styles.mapButtonDark : styles.mapButtonLight}`}
                                onClick={() => handleViewOnChart(sensor)}
                            >
                                Grafik Göster
                            </button>
                        </div>
                    ))
                ) : (
                    <p>Henüz kayıtlı bir sensör yok.</p>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} sensor={selectedSensor} />
        </div>
    );
}
