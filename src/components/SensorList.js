import React, { useCallback, useEffect, useState, useRef } from 'react';

import styles from '../styles/SensorList.module.css';
import UpdateSensorModal from './UpdateSensorModal';
import Modal from './Modal';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SensorList({
                                       manager,
                                       sensors = [],
                                       sensorTypes = {},
                                       role,
                                       companies,
                                       managers,
                                       personals,
                                       selectedCompany,
                                       selectedPersonal,
                                       onDropdownChange,
                                       onMapRedirect,
                                       onToggleActive,
                                       onDefine,
                                       onReload,
                                   }) {
    const [sensorList, setSensorList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSensor, setSelectedSensor] = useState(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedSensorId, setHighlightedSensorId] = useState(null); // Vurgulanacak sensör
    const sensorRefs = useRef({}); // Sensör satırlarının referansı
    const navigate = useNavigate();

    const [undefinedSensors, setUndefinedSensors] = useState([]);
    const [undefinedSensorsModalVisible, setUndefinedSensorsModalVisible] = useState(false);
    const [selectedSensors, setSelectedSensors] = useState([]);
    const [selectedManager, setSelectedManager] = useState(role === 'manager' ? manager.id : '');



    const [undefinedSensorIds, setUndefinedSensorIds] = useState([]); // Yeni state tanımı

    const fetchUndefinedSensors = useCallback(async () => {
        try {
            const url = selectedCompany
                ? `http://localhost:5000/api/undefined-sensors?companyCode=${encodeURIComponent(selectedCompany)}`
                : `http://localhost:5000/api/undefined-sensors`;

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });

            if (!response.ok) {
                throw new Error('Tanımsız sensörler getirilemedi.');
            }

            const result = await response.json();
            console.log("Frontend gelen veri:", result);

            // Undefined sensörlerin tamamını set et
            setUndefinedSensors(result.data || []);

            // Undefined sensörlerin ID'lerini bir listeye çıkar ve ayrı bir state'e kaydet
            const ids = result.data.map((sensor) => sensor.originalSensorId);
            setUndefinedSensorIds(ids); // Sadece ID'leri state'e kaydediyoruz

        } catch (error) {
            console.error('Tanımsız sensörler getirilirken hata:', error);
            toast.error('Tanımsız sensörler getirilirken bir hata oluştu.');
        }
    }, [selectedCompany]);

    const handleManagerChange = (e) => {
        setSelectedManager(e.target.value); // State güncellemesi yapılır
    };

    const handleAssignSensors = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/sensors-assign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    managerId: selectedManager,
                    sensorIds: selectedSensors,
                }),
            });

            if (!response.ok) {
                throw new Error('Atama işlemi sırasında bir hata oluştu.');
            }

            toast.success('Sensörler başarıyla atandı.');

            // Tanımsız sensörleri yeniden yükle
            await fetchUndefinedSensors();

            // Veriyi yeniden yükleme işlemi yalnızca burada çağrılmalı
            if (onReload) {
                await onReload(); // Parent'tan gelen veri yenileme fonksiyonu
            }

            setSelectedSensors([]); // Seçilen sensörleri sıfırla
            setUndefinedSensorsModalVisible(false); // Modalı kapat
        } catch (error) {
            console.error("Atama işlemi hatası:", error);
            toast.error(`Atama işlemi hatası: ${error.message}`);
        }
    };



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
        // Önce eski veriyi temizle
        sessionStorage.removeItem('sensorsForMap');

        // Yeni sensör verisini sessionStorage'a kaydet
        sessionStorage.setItem('sensorsForMap', JSON.stringify(sensor));

        // Cache etkisini bypass etmek için benzersiz bir timestamp ekleyerek yeni sekme aç
        const timestamp = Date.now(); // Benzersiz bir zaman damgası
        window.open(`/map`, '_blank');
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

    const filteredSensors = sensorList.filter((sensor) => {
        const name = sensor?.name?.toLowerCase() || '';
        const type = sensorTypes[sensor?.type]?.toLowerCase() || '';
        const status = sensor?.isActive ? 'aktif' : 'pasif';

        return (
            name.includes(searchQuery.toLowerCase()) ||
            type.includes(searchQuery.toLowerCase()) ||
            status.includes(searchQuery.toLowerCase())
        );
    });
    useEffect(() => {
        setSensorList(sensors);
    }, [sensors]);

    useEffect(() => {
        fetchUndefinedSensors();
    }, [fetchUndefinedSensors]);

    let activeManagers;
    if(role === "administrator") {
        activeManagers = managers.filter((manager) => manager.isActive); // Sadece aktif yöneticiler
    }
    return (

        <div className={styles.sensorListContainer}>
            <ToastContainer />

            <div className={styles.tableContainer}>

                <div className={styles.searchAndButtonContainer}>

                    {(role === 'administrator' || role === 'manager') &&  (
                        <button
                            className={styles.undefinedSensorButton}
                            onClick={() => {
                                if (!selectedCompany) {
                                    toast.error("Lütfen bir kurum seçin."); // Kurum seçilmeden bildirim
                                } else {

                                    setUndefinedSensorsModalVisible(true); // Tanımsız sensörleri modalda göster
                                }
                            }}
                        >
                            Tanımsız Sensörler
                            {undefinedSensors.length > 0 && (
                                <span className={styles.undefinedSensorBadge}>{undefinedSensors.length}</span>
                            )}
                        </button>
                    )}


                    <div className={styles.searchBar}>
                        <input
                            type="text"
                            placeholder="Ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>


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
                                    onClick={() => handleViewOnMap(sensor,'sensorsForMap')}
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
                                {undefinedSensorIds.includes(sensor.id) ? (
                                    <div className={styles.undefinedWarning}>
                                        Tanımsız Sensör
                                    </div>
                                ) : (
                                    <>
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
                                    </>
                                )}
                            </td>

                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {undefinedSensorsModalVisible && (
                <div className={styles.undefinedSensorModalOverlay}>
                    <div className={styles.undefinedSensorsModal}>
                        <h3 className={styles.undefinedSensorsModalTitle}>
                            Tanımsız Sensörleri Atama
                        </h3>
                        <div className={styles.undefinedSensorsDropdown}>
                            <label htmlFor="manager-select">Aktif Manager Seç:</label>
                            <select
                                id="manager-select"
                                value={role === 'manager' ? manager.id : selectedManager}
                                onChange={handleManagerChange}
                                disabled={role === 'manager'} // Rol manager ise seçimi kilitle
                            >
                                <option value="" disabled>
                                    Manager seçin
                                </option>
                                {role === 'administrator' && activeManagers.length > 0 ? (
                                    activeManagers.map((manager) => (
                                        <option key={manager.id} value={manager.id}>
                                            {manager.name} {manager.lastname}
                                        </option>
                                    ))
                                ) : role === 'manager' ? (
                                    // Manager rolü için mevcut manager bilgisini göster
                                    <option value={manager.id}>
                                        {manager.name} {manager.lastname}

                                    </option>
                                ) : (
                                    <option value="" disabled>
                                        Aktif manager bulunamadı
                                    </option>
                                )}
                            </select>
                        </div>


                        <div className={styles.undefinedSensorsTableContainer}>
                            {undefinedSensors.length > 0 ? (
                                <table className={styles.undefinedSensorsTable}>
                                    <thead>
                                    <tr>
                                        <th>
                                            <input
                                                type="checkbox"
                                                checked={selectedSensors.length === undefinedSensors.length}
                                                onChange={(e) => {
                                                    const isChecked = e.target.checked;
                                                    setSelectedSensors(
                                                        isChecked
                                                            ? undefinedSensors.map((s) => s.id)
                                                            : []
                                                    );
                                                }}
                                            />
                                        </th>
                                        <th>Ad</th>
                                        <th>Tip</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {undefinedSensors.map((sensor) => (
                                        <tr key={sensor.id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSensors.includes(sensor.id)}
                                                    value={sensor.id}
                                                    onChange={(e) => {
                                                        const isChecked = e.target.checked;
                                                        setSelectedSensors((prev) =>
                                                            isChecked
                                                                ? [...prev, sensor.id]
                                                                : prev.filter((id) => id !== sensor.id)
                                                        );
                                                    }}
                                                />
                                            </td>
                                            <td>{sensor.sensorName}</td>
                                            <td>{sensor.sensorType}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className={styles.undefinedSensorsEmptyContainer}>
                                    <p className={styles.undefinedSensorsEmpty}>
                                        <strong> Tanımsız sensör bulunamadı. </strong>
                                    </p>
                                </div>
                            )}
                        </div>


                        <div className={styles.undefinedSensorsModalActions}>
                            <button
                                className={`${styles.undefinedSensorsModalButton} ${styles.cancel}`}
                                onClick={() => setUndefinedSensorsModalVisible(false)}
                            >
                                İptal
                            </button>
                            <button
                                className={`${styles.undefinedSensorsModalButton} ${styles.assign}`}
                                onClick={handleAssignSensors}
                                disabled={!selectedManager || selectedSensors.length === 0}
                            >
                                Atama Yap
                            </button>
                        </div>
                    </div>
                </div>


            )}


            {isUpdateModalOpen && (
                <UpdateSensorModal
                    sensor={selectedSensor}
                    isOpen={isUpdateModalOpen}
                    onClose={closeUpdateModal}
                    onUpdate={handleUpdateSensor}
                />
            )}

            <Modal isOpen={isModalOpen} onClose={closeModal} sensor={selectedSensor}/>
        </div>
    );
}
