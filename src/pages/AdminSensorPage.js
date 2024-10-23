import React, { useEffect, useState } from 'react';
import SensorsDropdowns from '../components/SensorsDropdowns';
import SensorList from '../components/SensorList';
import Layout from "../layouts/Layout";
import { useNavigate } from 'react-router-dom';
import {
    filterManagersByCompany,
    filterPersonalsByManager,
    filterSensorsByCompany,
    filterSensorsByManager,
    filterSensorsByPersonal
} from '../services/FilterService'; // Servisi import ettik

export default function AdminPage({ role }) {
    const [companies, setCompanies] = useState([]);
    const [managers, setManagers] = useState([]);
    const [personals, setPersonals] = useState([]);
    const [sensors, setSensors] = useState([]);
    const [sensorOwners, setSensorOwners] = useState([]);

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

            setFilteredSensors(sensors); // Başlangıçta tüm sensörler gösterilsin
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

            setSelectedManager(''); // Manager ve personal sıfırlanacak
            setFilteredPersonals([]);
        } else if (type === 'manager') {
            setSelectedManager(value);

            if (!value) {
                setFilteredPersonals([]);
                setFilteredSensors(sensorForCompany); // Şirketin sensörlerine geri dön
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
                    setFilteredSensors(sensorForCompany); // Şirket sensörlerine geri dön
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
            <div>
                <h2>Admin Paneli</h2>
                {/* /Map sayfasına yönlendiren buton */}

                <SensorsDropdowns
                    role={role}
                    companies={companies}
                    managers={filteredManagers}
                    personals={filteredPersonals}
                    selectedCompany={selectedCompany}
                    selectedManager={selectedManager}
                    selectedPersonal={selectedPersonal}
                    onChange={handleDropdownChange}
                    onMapRedirect={handleMapRedirect} // Buton işlevselliği için yeni prop
                />

                <SensorList sensors={filteredSensors}/>
            </div>
        </Layout>
    );
}


const styles = {
    button: {
        padding: '10px 20px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#4CAF50',
        color: 'white',
        fontSize: '1rem',
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.3s',
        outline: 'none',
    },
    buttonHover: {
        backgroundColor: '#0056b3',
    },
};

