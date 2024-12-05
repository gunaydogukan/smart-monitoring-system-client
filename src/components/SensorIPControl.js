import React, { useState, useMemo } from 'react';
import SensorsDropdowns from './SensorsDropdowns';
import styles from '../styles/SensorList.module.css';
import { useNavigate } from 'react-router-dom';
import {
    filterManagersByCompany,
    filterSensorsByCompany,
    filterPersonalsByCompany,
    filterPersonalsByManager,
    filterSensorsByManager,
    filterSensorsByPersonal
} from '../services/FilterService'; // Filtre servisini import ediyoruz

export default function SensorIPControl({
                                            role,
                                            companies,
                                            managers,
                                            personals,
                                            sensors,
                                            sensorOwners,
                                            ipLogs,
                                            types,
                                        }) {
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedManager, setSelectedManager] = useState('');
    const [selectedPersonal, setSelectedPersonal] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    // Tarih formatını dönüştürme işlevi
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('tr-TR', {
            year: 'numeric',
            month: 'numeric', // Ağu, Eyl, vb.
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    // Sensör ve IP loglarını eşleştir
    const enrichedSensors = useMemo(() => {
        return sensors.map((sensor) => {
            const matchingLog = ipLogs.find((log) => log.datacode.toLowerCase() === sensor.datacode.toLowerCase());
            return {
                ...sensor,
                ip: matchingLog?.IP_Adresses || 'IP Yok',
                timestamp: matchingLog?.updatedAt ? formatDate(matchingLog.updatedAt) : 'Zaman Yok', // Zamanı formatla
            };
        });
    }, [sensors, ipLogs]);

    // Filtreleme işlemleri
    const filteredByCompany = useMemo(() => filterSensorsByCompany(enrichedSensors, selectedCompany), [enrichedSensors, selectedCompany]);
    const filteredByManager = useMemo(() => filterSensorsByManager(filteredByCompany, sensorOwners, selectedManager), [filteredByCompany, sensorOwners, selectedManager]);
    const filteredByPersonal = useMemo(() => filterSensorsByPersonal(filteredByManager, sensorOwners, selectedPersonal), [filteredByManager, sensorOwners, selectedPersonal]);

    // Arama sorgusuna göre filtrele
    const filteredSensors = useMemo(() => {
        return filteredByPersonal.filter((sensor) =>
            sensor.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [filteredByPersonal, searchQuery]);

    // Dropdown değişikliklerini işlemek için bir fonksiyon
    const handleDropdownChange = (type, value) => {
        if (type === 'company') setSelectedCompany(value);
        if (type === 'manager') setSelectedManager(value);
        if (type === 'personal') setSelectedPersonal(value);
    };

    const handleType = (typeId) => {
        if (!types || types.length === 0) {
            console.error('Types dizisi boş veya tanımlı değil.');
            return 'Bilinmiyor'; // Eğer types dizisi boşsa bir varsayılan değer döndürüyoruz
        }
        console.log(types);
        const foundType = types.find((type) => type.id === typeId);

        return foundType ? foundType.type : 'Bilinmiyor'; // Eğer eşleşme yoksa varsayılan bir metin döner
    };


    // Harita görüntüleme fonksiyonu (placeholder)
    const handleMapRedirect = () => {
        console.log('Tüm haritayı görüntüle');
    };

    // Haritada gösterme işlevi
    const handleViewOnMap = (sensor) => {
        navigate('/map', { state: { sensor } });
    };

    return (
        <div className={styles.sensorListContainer}>
            <div className={styles.filterArea}>
                <SensorsDropdowns
                    role={role}
                    companies={companies}
                    managers={managers}
                    personals={personals}
                    selectedCompany={selectedCompany}
                    selectedManager={selectedManager}
                    selectedPersonal={selectedPersonal}
                    onChange={handleDropdownChange}
                    onMapRedirect={handleMapRedirect}
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
                        <th>IP</th>
                        <th>Durum</th>
                        <th>Zaman</th>
                        <th>Haritada Göster</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredSensors.map((sensor) => (
                        <tr key={sensor.id}>
                            <td>{sensor.name}</td>
                            <td>{handleType(sensor.type)|| 'Bilinmiyor'}</td>
                            <td>{sensor.ip}</td>
                            <td>
                                    <span
                                        className={
                                            sensor.isActive ? styles.activeStatus : styles.inactiveStatus
                                        }
                                    >
                                        {sensor.isActive ? 'Aktif' : 'Pasif'}
                                    </span>
                            </td>
                            <td>{sensor.timestamp}</td>
                            <td>
                                <button
                                    className={styles.mapButton}
                                    onClick={() => handleViewOnMap(sensor)}
                                >
                                    Haritada Göster
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
