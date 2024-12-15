import React, { useEffect, useState } from 'react';
import Layout from "../layouts/Layout";
import SensorDataControll from "../components/sensorDataControll";
import SensorsDropdowns from '../components/SensorsDropdowns';
import {
    filterManagersByCompany,
    filterPersonalsByManager,
    filterSensorsByCompany,
    filterSensorsByManager,
    filterSensorsByPersonal
} from '../services/FilterService';
import styles from '../styles/SensorDataCheckPage.module.css';
import { checkSensorDataTime } from '../services/sensorService';
import { useAuth } from '../contexts/AuthContext';

export default function SensorDataControllPage() {
    const { user } = useAuth();
    const [companies, setCompanies] = useState([]);
    const [managers, setManagers] = useState([]);
    const [personals, setPersonals] = useState([]);
    const [sensors, setSensors] = useState([]);
    const [sensorOwners, setSensorOwners] = useState([]);
    const [sensorTypes, setSensorTypes] = useState({});
    const [filteredManagers, setFilteredManagers] = useState([]);
    const [filteredPersonals, setFilteredPersonals] = useState([]);
    const [filteredSensors, setFilteredSensors] = useState([]);
    const [times, setTimes] = useState([]); // Times verisini saklamak için state eklendi
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedManager, setSelectedManager] = useState('');
    const [selectedPersonal, setSelectedPersonal] = useState('');

    useEffect(() => {
        async function fetchData() {
            try {
                const fetchedData = await checkSensorDataTime(user.role, user.id);
                const { allCompanies, managers, personals, sensors, sensorOwners, types, times } = fetchedData;
                setCompanies(allCompanies);
                setManagers(managers);
                setPersonals(personals);
                setSensors(sensors);
                setSensorOwners(sensorOwners);
                setFilteredSensors(sensors);
                setSensorTypes(types);
                setTimes(times); // Gelen 'times' verisini state'e kaydet
            } catch (error) {
                console.error('Veri çekilirken hata oluştu:', error);
            }
        }
        fetchData();
    }, [user]);

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
            setSelectedManager('');
            setFilteredPersonals([]);
        } else if (type === 'manager') {
            setSelectedManager(value);
            if (!value) {
                setFilteredPersonals([]);
                setFilteredSensors(filterSensorsByCompany(sensors, selectedCompany));
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
                    setFilteredSensors(filterSensorsByCompany(sensors, selectedCompany));
                }
                return;
            }
            const filteredSensors = filterSensorsByPersonal(sensors, sensorOwners, value);
            setFilteredSensors(filteredSensors);
        }
    };

    if (!sensors.length) {
        return <p>Veri yükleniyor...</p>;
    }

    return (
        <Layout>
            <div className={styles.container}>
                <h2 className={styles.header}>Sensör Veri Kontrolü</h2>
                <div className={styles.filterArea}>
                    <SensorsDropdowns
                        role={user.role}
                        companies={companies}
                        managers={filteredManagers}
                        personals={filteredPersonals}
                        selectedCompany={selectedCompany}
                        selectedManager={selectedManager}
                        selectedPersonal={selectedPersonal}
                        onChange={handleDropdownChange}
                        onMapRedirect={() => console.log('Haritaya yönlendirme!')}
                    />
                </div>
                <SensorDataControll
                    sensors={filteredSensors}
                    sensorTypes={sensorTypes}
                    times={times} // Times verisini burada gönderiyoruz
                />
            </div>
        </Layout>
    );
}
