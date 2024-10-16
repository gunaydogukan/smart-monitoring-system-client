import React, { useEffect, useState } from 'react';
import SensorsDropdowns from '../components/SensorsDropdowns';
import SensorList from '../components/SensorList';
import Layout from "../layouts/Layout";

export default function ManagerPage({ role }) {
    const [managerData, setManagerData] = useState(null); // Manager verileri
    const [filteredSensors, setFilteredSensors] = useState([]);
    const [selectedPersonal, setSelectedPersonal] = useState('');

    useEffect(() => {
        // Manager sensörlerini fetch et
        fetchManagerSensors();
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

    // Personel bazlı sensörleri filtreleme
    const filterSensorsByPersonal = (personalId) => {
        if (personalId) {
            const personalSensorData = managerData.personalSensors.find(p => p.personalId === parseInt(personalId));
            setFilteredSensors(personalSensorData ? personalSensorData.sensors : []);
        } else {
            // Eğer personel seçimi iptal edilirse, manager sensörlerini tekrar göster
            setFilteredSensors(managerData.managerSensors);
        }
    };

    if (!managerData) {
        return <p>Veriler yükleniyor...</p>;
    }

    return (
        <Layout>
            <div>
                <h2>Manager Paneli</h2>
                <p>Manager: {managerData.manager.name} {managerData.manager.lastname}</p>
                <p>Şirket Kodu: {managerData.manager.companyCode}</p>

                {/* Personeller dropdown */}
                <SensorsDropdowns
                    role={role}
                    personals={managerData.personals}
                    onChange={handleDropdownChange}
                />

                {/* Sensör listesi */}
                <SensorList sensors={filteredSensors} />
            </div>
        </Layout>
    );
}
