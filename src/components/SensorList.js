import React, { useState } from 'react';
import Modal from './Modal';
import { useTheme } from '../contexts/ThemeContext';
import styles from '../styles/SensorList.module.css';
import { useNavigate } from 'react-router-dom';

export default function SensorList({ sensors = [] }) {
    const { isDarkMode } = useTheme();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSensor, setSelectedSensor] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);

    const sensorsPerPage = 10; // Her sayfada gösterilecek sensör sayısı
    const totalPages = Math.ceil(sensors.length / sensorsPerPage);


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

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    // Sayfa numarasına göre sensörleri filtreleme
    const currentSensors = sensors.slice(
        (currentPage - 1) * sensorsPerPage,
        currentPage * sensorsPerPage
    );

    return (
        <div className={`${styles.container} ${isDarkMode ? styles.containerDark : styles.containerLight}`}>
            <div className={styles.sensorListContainer}>
                {currentSensors.length > 0 ? (
                    currentSensors.map(sensor => (
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

            {/* Sayfa değiştirme butonları */}
            <div className={styles.pagination}>
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={styles.paginationButton}
                >
                    Önceki
                </button>
                <span className={styles.pageInfo}>
                    Sayfa {currentPage} / {totalPages}
                </span>
                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={styles.paginationButton}
                >
                    Sonraki
                </button>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} sensor={selectedSensor} />
        </div>
    );
}
