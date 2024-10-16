import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from "../layouts/Layout";

export default function SensorShow() {
    const { user } = useAuth();
    const [sensors, setSensors] = useState([]);
    const [sensorOwners, setSensorOwners] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [managers, setManagers] = useState([]);
    const [personals, setPersonals] = useState([]);
    const [filteredManagers, setFilteredManagers] = useState([]);
    const [filteredPersonals, setFilteredPersonals] = useState([]);
    const [filteredSensors, setFilteredSensors] = useState([]);

    const [userCompany, setUserCompany] = useState(''); // Manager'ın şirketi
    const [userManagerName, setUserManagerName] = useState(''); // Manager'ın adı
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedManager, setSelectedManager] = useState('');
    const [selectedPersonal, setSelectedPersonal] = useState('');
    const [activeFilter, setActiveFilter] = useState('company'); // 'company' veya 'manager' durumu

    useEffect(() => {
        if (user.role === 'administrator') {
            fetchAdminData();
        }else if(user.role ==='manager'){
            fetchManagerData();
        }
    }, [user.id]);

    const fetchAdminData = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/user-sensors', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            //if (!response.ok) throw new Error('Veriler alınamadı!');

            const { allCompanies = [], managers = [], personals = [], sensors = [], sensorOwners = [] } = await response.json();

            setCompanies(allCompanies);
            setManagers(managers);
            setPersonals(personals);
            setSensors(sensors);
            setSensorOwners(sensorOwners);
            setFilteredSensors(sensors);
            setFilteredManagers(managers);
            setFilteredPersonals(personals);
        } catch (error) {
            console.error('Veri çekme hatası:', error);
            toast.error('Veriler alınırken bir hata oluştu.');
        }
    };

    const fetchManagerData = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/user-sensors`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) throw new Error('Veriler alınamadı!');

            const {
                manager,
                company,
                personals = [],
                managerSensors = [],
                personalSensors = []
            } = await response.json();
            //BACKDE COMPANYCODE VE NAME ALINACAK...
            console.log(manager, manager.companyCode, personals, managerSensors, personalSensors);

            // Manager bilgilerini ve şirket bilgisini set et
            setUserManagerName(`${manager.name} ${manager.lastname}`);
            setUserCompany(manager.companyCode);// Şirket de tekil olduğu için diziye alıyoruz

            // Manager'e bağlı personelleri ve sensörleri set et
            setPersonals(personals);
            setSensors(managerSensors);
            console.log(personalSensors[0].sensors);
            setSensorOwners(personalSensors[0].sensors);
            // Başlangıçta tüm sensörleri göster
            setFilteredSensors(managerSensors);
            setFilteredPersonals(personals);
        } catch (error) {
            console.error('Veri çekme hatası:', error);
            toast.error('Veriler alınırken bir hata oluştu.');
        }
    };

    useEffect(() => {
        if (activeFilter === 'company' && selectedCompany) {
            console.log("companydeyim");
            const managersForCompany = managers.filter(manager => manager.companyCode === selectedCompany);
            const personalsForCompany = personals.filter(personal => personal.companyCode === selectedCompany);
            const sensorsForCompany = sensors.filter(sensor => sensor.company_code === selectedCompany);

            setFilteredManagers(managersForCompany);
            setFilteredPersonals(personalsForCompany);
            setFilteredSensors(sensorsForCompany);
        }
        else if (activeFilter === 'manager' && selectedManager) {
            console.log("managerdeyim");
            const filterPersonal = personals.filter(p => p.creator_id === parseInt(selectedManager));
            const filterOwner = sensorOwners.filter(owner => owner.sensor_owner === parseInt(selectedManager));

            const relatedSensorIds = filterOwner.map(owner => parseInt(owner.sensor_id));
            const filteredSensors = sensors.filter(sensor => relatedSensorIds.includes(parseInt(sensor.id)));

            setFilteredSensors(filteredSensors);
            setFilteredPersonals(filterPersonal);
        }
        else if (activeFilter === 'personal' && selectedPersonal) {

            console.log("personeldeyim");
            console.log("seçilen personel = "+selectedPersonal);
            console.log("perosnal id =" +selectedPersonal);
            let filteredSensors;
            const sensorOwnerIds = sensorOwners.map(owner => owner.id);

            console.log(sensorOwnerIds);

            if(user.role==="manager"){
                console.log("manager if içi");
                filteredSensors = sensors.filter(sensor =>
                    sensorOwnerIds.includes(sensor.id) // Sensor id'si sensorOwnerIds'de varsa filtrele
                );

            }else{
                const filterOwner = sensorOwners.filter(owner => owner.sensor_owner === parseInt(selectedPersonal));
                const relatedSensorIds = filterOwner.map(owner => parseInt(owner.sensor_id));
                filteredSensors = sensors.filter(sensor => relatedSensorIds.includes(parseInt(sensor.id)));
            }
            console.log(sensors);
            console.log(filteredSensors);
            setFilteredSensors(filteredSensors);
        }
        else {
            // Hiçbir seçim yoksa tüm sensörleri göster
            setFilteredManagers(managers);
            setFilteredPersonals(personals);
            setFilteredSensors(sensors);
        }
    }, [activeFilter, selectedCompany, selectedManager, selectedPersonal, managers, personals, sensors, sensorOwners]);

// Şirket seçildiğinde ilgili filtreleme yapılır
    const handleCompanyChange = (companyCode) => {
        setSelectedCompany(companyCode);
        setSelectedManager(''); // Manager seçimini sıfırla
        setSelectedPersonal(''); // Personel seçimini sıfırla
        setActiveFilter('company'); // Aktif filtreyi company yap
    };

// Manager seçildiğinde ilgili filtreleme yapılır
    const handleManagerChange = (managerId) => {
        console.log(managerId);
        if (!managerId) {
            setSelectedManager('');
            setSelectedPersonal(''); // Personel seçimini sıfırla
            setActiveFilter('company'); // Aktif filtreyi company yap
        } else {
            setSelectedManager(managerId);
            setSelectedPersonal(''); // Personel seçimini sıfırla
            setActiveFilter('manager'); // Aktif filtreyi manager yap
        }
    };

// Personel seçildiğinde ilgili filtreleme yapılır
    const handlePersonalChange = (personalId) => {
        console.log("değişime girdim")
        if (!personalId) {
            setSelectedPersonal('');
            console.log("ifin içi")
            setActiveFilter('manager');// Manager seviyesine geri dön
        } else {
            setSelectedPersonal(personalId);
            setActiveFilter('personal'); // Aktif filtreyi personal yap
        }
    };


    return (
        <Layout>
            <div style={styles.container}>
                <ToastContainer />
                <h2>Sensör Listesi</h2>

                {/* Admin Görünümü */}
                {user.role === 'administrator' && (
                    <div style={styles.filters}>
                        <select value={selectedCompany} onChange={(e) => handleCompanyChange(e.target.value)}>
                            <option value="">Tüm Şirketler</option>
                            {companies.map(company => (
                                <option key={company.code} value={company.code}>
                                    {company.name} - {company.code}
                                </option>
                            ))}
                        </select>

                        <select value={selectedManager} onChange={(e) => handleManagerChange(e.target.value)}>
                            <option value="">Tüm Managerlar</option>
                            {filteredManagers.map(manager => (
                                <option key={manager.id} value={manager.id}>
                                    {manager.name} {manager.lastname}
                                </option>
                            ))}
                        </select>

                        <select value={selectedPersonal} onChange={(e) => handlePersonalChange(e.target.value)}>
                            <option value="">Tüm Personeller</option>
                            {filteredPersonals.map(personal => (
                                <option key={personal.id} value={personal.id}>
                                    {personal.name} {personal.lastname}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Manager Görünümü */}
                {user.role === 'manager' && (
                    <>
                        <div style={styles.info}>
                            <p><strong>Şirket:</strong> {userCompany}</p>
                            <p><strong>Manager:</strong> {userManagerName}</p>
                        </div>

                        <div style={styles.filters}>
                            <select value={selectedPersonal} onChange={(e) => handlePersonalChange(e.target.value)}>
                                <option value="">Tüm Personeller</option>
                                {filteredPersonals.map(personal => (
                                    <option key={personal.id} value={personal.id}>
                                        {personal.name} {personal.lastname}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </>
                )}

                {/* Sensör Listesi */}
                {filteredSensors.length > 0 ? (
                    <ul style={styles.list}>
                        {filteredSensors.map(sensor => (
                            <li key={sensor.id}>
                                {sensor.name} - {sensor.location}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Henüz kayıtlı bir sensör yok.</p>
                )}
            </div>
        </Layout>
    );
}

const styles = {
    container: {
        padding: '20px',
    },
    list: {
        listStyleType: 'none',
        padding: 0,
    },
    filters: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
    },
};
