import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaCloudRain, FaThermometerHalf, FaRulerVertical } from 'react-icons/fa';
import Layout from "../layouts/Layout";

export default function SensorShow() {
    const { user } = useAuth();
    const [sensors, setSensors] = useState([]);

    const [sensorTypes, setSensorTypes] = useState({});

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


    // Backend'den sensör ve sensör tiplerini alma
    useEffect(() => {

        const fetchSensors = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/sensors', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Sensörler alınamadı!');
                }

                const data = await response.json();
                console.log('Gelen sensör verisi:', data); // Veriyi kontrol ediyoruz
                setSensors(data);
            } catch (error) {
                console.error('Sensörleri çekerken hata:', error);
                toast.error('Sensörleri alırken bir hata oluştu.');

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


        const fetchSensorTypes = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/type', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Sensör tipleri alınamadı!');
                }

                const data = await response.json();
                console.log('Gelen sensör tipleri:', data);

                // Gelen veriyi {id: 'Tür Adı'} şeklinde eşleyelim
                const types = data.reduce((acc, type) => {
                    acc[type.id] = type.type; // id -> type eşlemesi
                    return acc;
                }, {});
                setSensorTypes(types);
            } catch (error) {
                console.error('Sensör tipleri alınırken hata:', error);
                toast.error('Sensör tipleri alırken bir hata oluştu.');
            }
        };

        fetchSensors();
        fetchSensorTypes();
    }, [user.id]);

    // Sensör tipine göre uygun ikonu döndüren fonksiyon
    const getSensorIcon = (type) => {
        switch (type) {
            case 'Sıcaklık & Nem':
                return <FaThermometerHalf size={32} color="#e74c3c" />;
            case 'Mesafe':
                return <FaRulerVertical size={32} color="#2ecc71" />;
            case 'Yağmur':
                return <FaCloudRain size={32} color="#3498db" />;
            default:
                return <FaRulerVertical size={32} color="#95a5a6" />;
        }
    };

    return (
        <Layout>
            <div style={styles.container}>
                <ToastContainer />

                <h2>Kullanıcıya Ait Sensörler</h2>
                {sensors.length > 0 ? (
                    <div style={styles.cardContainer}>
                        {sensors.map((sensor) => {
                            const sensorTypeName = sensorTypes[sensor.type];  // ID'den isim eşleme
                            console.log(`Sensör tipi: ${sensorTypeName}`);  // Konsola yazdır

                            return (
                                <div key={sensor.id} style={styles.card}>
                                    {getSensorIcon(sensorTypeName)}
                                    <h3>{sensor.name}</h3>
                                    <p><strong>Açıklama:</strong> {sensor.def}</p>
                                    <p><strong>Tür:</strong> {sensorTypeName}</p>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p>Henüz kayıtlı bir sensörünüz yok.</p>

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
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
    },
    cardContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        marginTop: '20px',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        transition: 'transform 0.2s',
    },
    filters: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
    },
};
