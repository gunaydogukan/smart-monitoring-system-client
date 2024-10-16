import React, { useEffect, useState } from 'react';
import SensorsDropdowns from '../components/SensorsDropdowns';
import SensorList from '../components/SensorList';
import Layout from "../layouts/Layout";


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

    const [sensorForCompany, setSensorForCompany] = useState([]); ////ayrı bir usestate değişkende tutuyorum cunku admin seçimi iptal olursa tekrar company sensörleri kaybolmasın

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

            // Başlangıçta tüm verileri göster
            setFilteredManagers(managers);
            setFilteredPersonals(personals);
            setFilteredSensors(sensors);
        } catch (error) {
            console.error('Veri çekme hatası:', error);
        }
    };

    const handleDropdownChange = (type, value) => {

        if (type === 'company') {
            setSelectedCompany(value);
            filterManagersByCompany(value);
        } else if (type === 'manager') {
            setSelectedManager(value);
            filterPersonalsByManager(value);
            filterSensorsByManager(value);

        } else if (type === 'personal') {
            setSelectedPersonal(value);
            filterSensorsByPersonal(value);
        }
    };

    // Şirket bazlı manager'ları filtreleme
    const filterManagersByCompany = (companyCode) => {
        const filtered = managers.filter(manager => manager.companyCode === companyCode);
        const filteredSensors =sensors.filter(sensor=>sensor.company_code===companyCode);
        const filteredPersonals = personals.filter(personal=>personal.companyCode===companyCode);

        setFilteredManagers(filtered);
        setFilteredSensors(filteredSensors);
        setFilteredPersonals(filteredPersonals);

        setSensorForCompany(filteredSensors); //filtrenen company sensorlerini ayrı bir şekilde tutuyoruz

        if(!companyCode){
            setFilteredSensors(sensors); //company'seçimi giderse tekrar tüm sensörleri göster
            setFilteredManagers(managers);
            setFilteredPersonals(personals);
        }
    };

    // Manager bazlı personel ve sensörleri filtreleme
    const filterPersonalsByManager = (managerId) => {
        const filtered = personals.filter(personal => personal.creator_id === parseInt(managerId));

        setFilteredPersonals(filtered);
    };

    const filterSensorsByManager = (managerId) => {
        const filteredOwner = sensorOwners.filter(owner =>owner.sensor_owner === parseInt(managerId));
        const sensorIds = filteredOwner.map(owner => owner.sensor_id);
        const filteredSensors = sensors.filter(sensor => sensorIds.includes(sensor.id));

        setFilteredSensors(filteredSensors);

        if(!managerId){
            setFilteredSensors(sensorForCompany);
        }

    };

    // Personel bazlı sensörleri filtreleme
    const filterSensorsByPersonal = (personalId) => {
        const filteredOwner = sensorOwners.filter(owner =>owner.sensor_owner === parseInt(personalId));
        const sensorIds = filteredOwner.map(owner => owner.sensor_id);
        const filteredSensors = sensors.filter(sensor => sensorIds.includes(sensor.id));
        setFilteredSensors(filteredSensors);
    };



    return (
        <Layout>
        <div>
            <h2>Admin Paneli</h2>
            <SensorsDropdowns
                role={role}
                companies={companies}
                managers={filteredManagers}
                personals={filteredPersonals}
                onChange={handleDropdownChange}
            />
            <SensorList sensors={filteredSensors} />
        </div>
        </Layout>
    );
}
