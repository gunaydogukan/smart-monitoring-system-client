import React, { useEffect, useState } from 'react';
import SensorsDropdowns from '../components/SensorsDropdowns';
import SensorList from '../components/SensorList';
import Layout from "../layouts/Layout";
import {useNavigate} from "react-router-dom";

export default function ManagerPage({ role }) {
    const [managerData, setManagerData] = useState(null); // Manager verileri
    const [sensors,setSensors] = useState([]);
    const [filteredSensors, setFilteredSensors] = useState([]);
    const [selectedPersonal, setSelectedPersonal] = useState('');

    const navigate = useNavigate();


    useEffect(() => {
        fetchManagerSensors();  // Sayfa ilk yüklendiğinde verileri çekiyoruz
    }, []);

    const fetchManagerSensors = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/user-sensors`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const data = await response.json();
            setManagerData(data);
            setFilteredSensors(data.managerSensors); // Başlangıçta manager sensörlerini göster
            setSensors(data.managerSensors);
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
            // Personelin sensörlerini bul
            const personalSensorData = managerData.personalSensors.find(p => p.personalId === parseInt(personalId));
            setFilteredSensors(personalSensorData ? personalSensorData.sensors : []);  // Sensörleri ayarla
        } else {
            // Personel seçimi iptal edilirse, manager sensörlerini göster
            setFilteredSensors(managerData.managerSensors);
        }
    };

    if (!managerData) {
        return <p>Veriler yükleniyor...</p>;  // Veri yüklenene kadar
    }

    const handleMapRedirect = () => {
        navigate('/map', { state: { sensors: sensors } });
    };

    return (
        <Layout>
            <div>
                <h2>Manager Paneli</h2>
                <p>Manager: {managerData.manager.name} {managerData.manager.lastname}</p>
                <p>Şirket Kodu: {managerData.manager.companyCode}</p>

                <button onClick={handleMapRedirect} style={{marginTop: '20px', marginBottom: '20px'}}>
                    Haritayı Görüntüle
                </button>

                {/* Personeller Dropdown */}
                <SensorsDropdowns
                    role={role}  // Manager rolü
                    personals={managerData.personals}  // Personelleri gönder
                    selectedPersonal={selectedPersonal}
                    onChange={handleDropdownChange}
                />

                {/* Sensör Listesi */}
                <SensorList sensors={filteredSensors}/>
            </div>
        </Layout>
    );
}
