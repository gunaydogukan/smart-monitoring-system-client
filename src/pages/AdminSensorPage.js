import React, { useEffect, useState } from 'react';
import SensorList from '../components/SensorList';
import Layout from "../layouts/Layout";
import { useNavigate } from 'react-router-dom';
import {
    filterManagersByCompany,
    filterPersonalsByManager,
    filterSensorsByCompany,
    filterSensorsByManager,
    filterSensorsByPersonal
} from '../services/FilterService';
import styles from '../styles/AdminPage.module.css';

export default function AdminSensorPage({ role }) {
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
    const navigate = useNavigate();

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/user-sensors', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const { allCompanies, managers, personals, sensors, sensorOwners } = await response.json();
            setCompanies(allCompanies);
            setManagers(managers);
            setPersonals(personals);
            setSensors(sensors);
            setSensorOwners(sensorOwners);
            setFilteredSensors(sensors);

            // Tip verilerini ayrı bir API çağrısıyla al
            const typesResponse = await fetch('http://localhost:5000/api/type', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            });
            const typesData = await typesResponse.json();
            const typesMap = typesData.reduce((acc, type) => {
                acc[type.id] = type.type; // { 1: "Sıcaklık", 2: "Nem", vb. }
                return acc;
            }, {});
            setSensorTypes(typesMap);
        } catch (error) {
            console.error('Veri çekme hatası:', error);
        }
    };

    const handleDropdownChange = (type, value) => {
        if (type === 'company') {
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
    };

    const handleMapRedirect = () => {
        navigate('/map', { state: { sensors: sensors } });
    };

    return (
        <Layout>
            <div className={styles.container}>
                <h2 className={styles.header}>Admin Paneli</h2>
                <SensorList
                    sensors={filteredSensors}
                    sensorTypes={sensorTypes} // Tip eşleştirmesini gönderiyoruz
                    role={role}
                    companies={companies}
                    managers={filteredManagers}
                    personals={filteredPersonals}
                    selectedCompany={selectedCompany}
                    selectedManager={selectedManager}
                    selectedPersonal={selectedPersonal}
                    onDropdownChange={handleDropdownChange}
                    onMapRedirect={handleMapRedirect}
                    onUpdateSensor={(id) => console.log('Güncelle:', id)}
                    onToggleActive={(id, isActive) => console.log('Aktif/Pasif:', id, isActive)}
                    onDefine={(id) => console.log('Tanımla:', id)}
                />
            </div>
        </Layout>
    );
}
