import React, { useEffect, useState } from 'react';
import SensorsDropdowns from '../components/SensorsDropdowns';
import SensorList from '../components/SensorList';
import Layout from "../layouts/Layout";
import {useNavigate} from "react-router-dom";
import styles from "../styles/AdminPage.module.css";

export default function ManagerPage({ role }) {
    const API_URL = process.env.REACT_APP_API_URL;

    const [managerData, setManagerData] = useState(null); // Manager verileri
    const [sensors,setSensors] = useState([]);
    const [filteredSensors, setFilteredSensors] = useState([]);
    const [selectedPersonal, setSelectedPersonal] = useState('');
    const [sensorTypes, setSensorTypes] = useState({}); // Tip eşleştirmesi için eklenen state
    const navigate = useNavigate();

    useEffect(() => {
        fetchManagerSensors();  // Sayfa ilk yüklendiğinde verileri çekiyoruz
    }, []);


    const fetchManagerSensors = async () => {
        try {
            const response = await fetch(`${API_URL}/api/user-sensors`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const data = await response.json();

            setManagerData(data);

            setFilteredSensors(data.managerSensors); // Başlangıçta manager sensörlerini göster
            setSensors(data.managerSensors);
            console.log("Manager sensör bilgileri = ",data)
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
        } catch (error) {
            console.error('Veri çekme hatası:', error);
        }
    };

    const handleDropdownChange = (type, value) => {
        if (type === 'personal') {
            setSelectedPersonal(value);
            filterSensorsByPersonal(value);
        }
    };

    const filterSensorsByPersonal = (personalId) => {
        if (personalId) {
            const personalSensorData = managerData.personalSensors.find(
                (p) => p.personalId === parseInt(personalId)
            );

            console.log("Personel sensor data", personalSensorData);

            // Sadece geçerli sensörleri filtrele
            const sensorsArray = Array.isArray(personalSensorData?.sensors)
                ? personalSensorData.sensors.filter(sensor => sensor?.id && sensor?.datacode) // Sensör kontrolü
                : Object.values(personalSensorData?.sensors || {}).flat().filter(sensor => sensor?.id && sensor?.datacode);

            console.log("Filtered Sensors Array:", sensorsArray);

            setFilteredSensors(sensorsArray);
        } else {
            // Eğer personel seçilmemişse, tüm sensörleri getir
            setFilteredSensors(managerData.managerSensors || []);
        }
    };


    if (!managerData) {
        return <p>Veriler yükleniyor...</p>;  // Veri yüklenene kadar
    }

    const handleMapRedirect = () => {
        // Filtrelenmiş sensörleri sessionStorage'a kaydediyoruz
        sessionStorage.setItem('sensorsForMap', JSON.stringify(filteredSensors));

        // Yeni sekmede /map rotasını açıyoruz
        window.open('/map', '_blank');
    };

    return (
        <Layout>
            <div>
                <h2 className={styles.header}>Yönetici Paneli</h2>
            <p>Manager: {managerData.manager.name} {managerData.manager.lastname}</p>
                <p>Şirket Kodu: {managerData.manager.companyCode}</p>

                {/* Personeller Dropdown */}
                <SensorsDropdowns
                    role={role}  // Manager rolü
                    personals={managerData.personals}  // Personelleri gönder
                    selectedPersonal={selectedPersonal}
                    onChange={handleDropdownChange}
                    onMapRedirect={handleMapRedirect}
                />

                {/* Sensör Listesi */}
                <SensorList
                   manager={managerData.manager}
                    selectedCompany={managerData.manager.companyCode}
                    role={role}
                    sensors={filteredSensors}
                    sensorTypes={sensorTypes}
                   onReload={fetchManagerSensors}
                />
            </div>
        </Layout>
    );
}
