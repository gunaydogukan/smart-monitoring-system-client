import React, { useState, useEffect, useRef } from 'react';
import SensorsDropdowns from './SensorsDropdowns';
import styles from '../styles/SensorList.module.css';
import UpdateSensorModal from './UpdateSensorModal';
import Modal from './Modal';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SensorList({
                                       sensors = [],
                                       sensorTypes = {},
                                       role,
                                       companies,
                                       managers,
                                       personals,
                                       selectedCompany,
                                       selectedManager,
                                       selectedPersonal,
                                       onDropdownChange,
                                       onMapRedirect,
                                       onToggleActive,
                                       onDefine,
                                   }) {
    const [sensorList, setSensorList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSensor, setSelectedSensor] = useState(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedSensorId, setHighlightedSensorId] = useState(null); // Vurgulanacak sensör
    const sensorRefs = useRef({}); // Sensör satırlarının referansı

    const navigate = useNavigate();

    useEffect(() => {
        setSensorList(sensors);
    }, [sensors]);

    const openUpdateModal = (sensor) => {
        setSelectedSensor(sensor);
        setIsUpdateModalOpen(true);
    };

    const closeUpdateModal = () => {
        setSelectedSensor(null);
        setIsUpdateModalOpen(false);
    };

    const handleUpdateSensor = async (sensorId, updatedData) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/sensor-logs/update/${sensorId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                throw new Error('Sensör güncellenemedi.');
            }

            const updatedSensor = { ...selectedSensor, ...updatedData };
            setSensorList((prevList) =>
                prevList.map((sensor) => (sensor.id === sensorId ? updatedSensor : sensor))
            );

            setHighlightedSensorId(sensorId); // Güncellenen sensör ID'sini ayarla
            setTimeout(() => {
                sensorRefs.current[sensorId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => setHighlightedSensorId(null), 2000); // Vurgulamayı kaldır
            }, 100);

            toast.success('Sensör başarıyla güncellendi!', {
                position: 'top-right',
                autoClose: 2500,  // 3 saniye
            });

            setIsUpdateModalOpen(false);
        } catch (error) {
            console.error('Hata:', error);
            toast.error('Sensör güncellenemedi. Lütfen tekrar deneyin.', {
                position: 'top-right',
                autoClose: 2500,  // 3 saniye
            });
        }
    };

    const handleViewOnMap = (sensor) => {
        navigate('/map', { state: { sensor } });
    };

    const handleViewOnChart = (sensor) => {
        if (sensor) {
            setSelectedSensor(sensor);
            setIsModalOpen(true);
        } else {
            console.error('Sensör verisi mevcut değil.');
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedSensor(null);
    };

    const filteredSensors = sensorList.filter(
        (sensor) =>
            sensor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sensorTypes[sensor.type]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (sensor.isActive ? 'aktif' : 'pasif').includes(searchQuery.toLowerCase())
    );

    return (
        <div className={styles.sensorListContainer}>
            <ToastContainer />
            <div className={styles.filterArea}>
                <SensorsDropdowns
                    role={role}
                    companies={companies}
                    managers={managers}
                    personals={personals}
                    selectedCompany={selectedCompany}
                    selectedManager={selectedManager}
                    selectedPersonal={selectedPersonal}
                    onChange={onDropdownChange}
                    onMapRedirect={onMapRedirect}
                />
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.searchBar}>
                    <input
                        type="text"
                        placeholder="Ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th>Ad</th>
                        <th>Tip</th>
                        <th>Durum</th>
                        <th>Haritada Göster</th>
                        <th>Grafik Göster</th>
                        <th>İşlemler</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredSensors.map((sensor) => (
                        <tr
                            key={sensor.id}
                            ref={(el) => (sensorRefs.current[sensor.id] = el)}
                            className={sensor.id === highlightedSensorId ? styles.highlightedRow : ''}
                        >
                            <td>{sensor.name}</td>
                            <td>{sensorTypes[sensor.type] || 'Bilinmiyor'}</td>
                            <td>
                                    <span
                                        className={
                                            sensor.isActive
                                                ? styles.activeStatus
                                                : styles.inactiveStatus
                                        }
                                    >
                                        {sensor.isActive ? 'Aktif' : 'Pasif'}
                                    </span>
                            </td>
                            <td>
                                <button
                                    className={styles.mapButton}
                                    onClick={() => handleViewOnMap(sensor)}
                                >
                                    Haritada Göster
                                </button>
                            </td>
                            <td>
                                <button
                                    className={styles.graphButton}
                                    onClick={() => handleViewOnChart(sensor)}
                                >
                                    Grafik Göster
                                </button>
                            </td>
                            <td className={styles.buttonGroup}>
                                <button
                                    className={styles.updateButton}
                                    onClick={() => openUpdateModal(sensor)}
                                >
                                    Güncelle
                                </button>
                                <button
                                    className={
                                        sensor.isActive
                                            ? styles.deactivateButton
                                            : styles.activateButton
                                    }
                                    onClick={() => onToggleActive(sensor.id, !sensor.isActive)}
                                >
                                    {sensor.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                                </button>
                                <button
                                    className={styles.defineButton}
                                    onClick={() => onDefine(sensor.id)}
                                >
                                    Tanımla
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {isUpdateModalOpen && (
                <UpdateSensorModal
                    sensor={selectedSensor}
                    isOpen={isUpdateModalOpen}
                    onClose={closeUpdateModal}
                    onUpdate={handleUpdateSensor}
                />
            )}

            <Modal isOpen={isModalOpen} onClose={closeModal} sensor={selectedSensor} />
        </div>
    );
}
