import React, {useCallback, useEffect, useState} from 'react';
import SensorList from '../components/SensorList';
import Layout from "../layouts/Layout";
import {
    filterManagersByCompany,
    filterPersonalsByManager,
    filterSensorsByCompany,
    filterSensorsByManager,
    filterSensorsByPersonal
} from '../services/FilterService';
import styles from '../styles/AdminPage.module.css';
import SensorsDropdowns from '../components/SensorsDropdowns';
import {toast} from "react-toastify";
import {useNavigate} from "react-router-dom"; // SensorsDropdowns'u import etmeyi unutmayın



export default function AdminSensorPage({ role }) {
    const API_URL = process.env.REACT_APP_API_URL;

    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [managers, setManagers] = useState([]);
    const [personals, setPersonals] = useState([]);
    const [sensors, setSensors] = useState([]);
    const [sensorOwners, setSensorOwners] = useState([]);
    const [sensorTypes, setSensorTypes] = useState({}); // Tip eşleştirmesi için eklenen state
    const [filteredManagers, setFilteredManagers] = useState([]);
    const [filteredPersonals, setFilteredPersonals] = useState([]);
    const [filteredSensors, setFilteredSensors] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedManager, setSelectedManager] = useState('');
    const [selectedPersonal, setSelectedPersonal] = useState('');
    const [sensorForCompany, setSensorForCompany] = useState([]);




    const handleDropdownChange = useCallback((type, value) => {
        if (type === 'company') {
            if (selectedCompany === value) return; // Aynı değerle yeniden çağrılmasını önle
            setSelectedCompany(value);
            if (!value) {
                setFilteredManagers([]);
                setFilteredPersonals([]);
                setFilteredSensors(sensors);
                setSelectedManager('');
                setSelectedPersonal('');
                return;
            }
            const filteredManagers = filterManagersByCompany(managers, value);
            setFilteredManagers(filteredManagers);
            const filteredSensors = filterSensorsByCompany(sensors, value);
            setFilteredSensors(filteredSensors);
            setSensorForCompany(filteredSensors);
            setSelectedManager('');
            setFilteredPersonals([]);
        } else if (type === 'manager') {
            setSelectedManager(value);
            if (!value) {
                setFilteredPersonals([]);
                setFilteredSensors(sensorForCompany);
                setSelectedPersonal('');
                return;
            }
            const filteredPersonals = filterPersonalsByManager(personals, value);
            setFilteredPersonals(filteredPersonals);
            const filteredSensors = filterSensorsByManager(sensors, sensorOwners, value);
            setFilteredSensors(filteredSensors);
        } else if (type === 'personal') {
            setSelectedPersonal(value);
            if (!value) {
                if (selectedManager) {
                    const filteredSensors = filterSensorsByManager(sensors, sensorOwners, selectedManager);
                    setFilteredSensors(filteredSensors);
                } else {
                    setFilteredSensors(sensorForCompany);
                }
                return;
            }
            const filteredSensors = filterSensorsByPersonal(sensors, sensorOwners, value);
            setFilteredSensors(filteredSensors);
        }
    }, [managers, personals, sensors, sensorOwners, sensorForCompany, selectedCompany, selectedManager]); // `selectedPersonal` çıkarıldı

    const fetchAdminData = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/user-sensors`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            const { allCompanies, managers, personals, sensors, sensorOwners } = await response.json();
            setCompanies(allCompanies);
            setManagers(managers);
            setPersonals(personals);
            setSensors(sensors);
            setSensorOwners(sensorOwners);

            // Tip verilerini yükle
            const typesResponse = await fetch(`${API_URL}/api/type`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            const typesData = await typesResponse.json();
            const typesMap = typesData.reduce((acc, type) => {
                acc[type.id] = type.type;
                return acc;
            }, {});
            setSensorTypes(typesMap);

            // İlk yüklemede tüm sensörleri göster
            if (!selectedCompany) {
                setFilteredSensors(sensors); // Tüm sensörleri yükle
            } else {
                handleDropdownChange('company', selectedCompany); // Şirket filtresini uygula
            }
        } catch (error) {
            console.error('Veri çekme hatası:', error);
            toast.error(`Veri çekme hatası: ${error.message}`); // Hata mesajını göster
        }
    }, [selectedCompany, handleDropdownChange]); // `selectedCompany` ve `handleDropdownChange` bağımlılıkları eklendi



    const handleMapRedirect = () => {
        // Filtrelenmiş sensörleri sessionStorage'a kaydediyoruz
        sessionStorage.setItem('sensorsForMap', JSON.stringify(filteredSensors));

        // Yeni sekmede /map rotasını açıyoruz
        window.open('/map', '_blank');
    };


// Bu useEffect yalnızca bir kez çalışacak, çünkü bağımlılık dizisi boş.
    useEffect(() => {
        fetchAdminData(); // Yalnızca ilk render'da çalışacak
    }, []); // Bağımlılık dizisi boş bırakıldı

    return (
        <Layout>
            <div className={styles.container}>
                <h2 className={styles.header}>Admin Paneli</h2>

                {/* SensorsDropdowns Bileşeni Buraya Taşındı */}
                <div className={styles.filterArea}>
                    <SensorsDropdowns
                        role={role}
                        companies={companies}
                        managers={filteredManagers}
                        personals={filteredPersonals}
                        selectedCompany={selectedCompany}
                        selectedManager={selectedManager}
                        selectedPersonal={selectedPersonal}
                        onChange={handleDropdownChange}
                        onMapRedirect={handleMapRedirect}
                    />
                </div>

                {/* SensorList Daha Bağımsız Hale Geldi */}
                <SensorList
                    sensors={filteredSensors}
                    sensorTypes={sensorTypes}
                    managers={filteredManagers}
                    role={role}
                    selectedCompany={selectedCompany}
                    onUpdateSensor={(id) => console.log('Güncelle:', id)}
                    onToggleActive={(id, isActive) => console.log('Aktif/Pasif:', id, isActive)}
                    onDefine={(id) => console.log('Tanımla:', id)}
                    onReload={fetchAdminData} // Veriyi yeniden yükle
                    onDropdownChange={handleDropdownChange} // Filtreleme fonksiyonu

                />
            </div>
        </Layout>
    );
}