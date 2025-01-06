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
import LoadingScreen from "../components/LoadingScreen"; // LoadingScreen bileşenini içe aktarın

export default function SensorDataControllPage() {
    const { user,userRole } = useAuth();
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
    const [resultData, setResultData] = useState(null);  // result'dan gelen veriler için state
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedManager, setSelectedManager] = useState('');
    const [selectedPersonal, setSelectedPersonal] = useState('');
    const [isTimeout, setIsTimeout] = useState(false);


    useEffect(() => {
        async function fetchData() {
            try {
                const fetchedData = await checkSensorDataTime(userRole.role, user.id);
                const { allCompanies, managers, personals, sensors, sensorOwners, types, result } = fetchedData;
                // getTimes metotu
                const timeResults = result.map(item => ({
                    datacode: item.datacode,
                    lastUpdatedTime: item.result?.lastUpdatedTime || "Zaman verisi yok"
                }));

                const dataResults = result.map(item => ({
                    datacode: item.datacode,
                    data: item.result?.data || "Veri yok"
                }));

                setCompanies(allCompanies);
                setManagers(managers);
                setPersonals(personals);
                setSensors(sensors);
                setSensorOwners(sensorOwners);
                setFilteredSensors(sensors);
                setSensorTypes(types);

                if(userRole.role === 'manager'){
                    setFilteredPersonals(personals);
                }

                setTimes(timeResults); // Gelen 'times' verisini state'e kaydet
                setResultData(dataResults); //sensör verilerini alı

            } catch (error) {
                console.error('Veri çekilirken hata oluştu:', error);
            }
        }
        fetchData();
    }, [user]);

    const handleDropdownChange = (type, value) => {
        console.log("dropwon change giriş, ",value);
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
            if (!value) {
                setSelectedPersonal([]);
                if (selectedManager) {
                    const filteredSensors = filterSensorsByManager(sensors, sensorOwners, selectedManager);
                    setFilteredSensors(filteredSensors);
                } else {
                    setFilteredSensors(filterSensorsByCompany(sensors, selectedCompany));
                }
                return;
            }
            setSelectedPersonal(value);
            const filteredSensors = filterSensorsByPersonal(sensors, sensorOwners, value);
            setFilteredSensors(filteredSensors);
        }
    };


    useEffect(() => {
        const timer = setTimeout(() => {
            setIsTimeout(true);
        }, 5000); // 5 saniye sonra setIsTimeout true olacak
        if (sensors.length) {
            clearTimeout(timer); // Sensors verisi geldiğinde zamanlayıcıyı temizle
        }

        return () => clearTimeout(timer); // Bileşen unmount olduğunda temizle
    }, [sensors]);

    if (!sensors.length) {

        if (isTimeout) {
            return <div>Sensorunuz yok</div>; // 5 saniye geçti ve sensors hâlâ boş
        }
        return <LoadingScreen />; // 5 saniyeden önce ise yükleme ekranı göster
    }

    //tüm sensörleri gösterme
    const handleMapRedirect = () => {
        // Filtrelenmiş sensörleri sessionStorage'a kaydediyoruz
        sessionStorage.setItem('sensorsForMap', JSON.stringify(filteredSensors));

        // Yeni sekmede /map rotasını açıyoruz
        window.open('/map', '_blank');
    };

    return (
        <Layout>
            <div className={styles.mainContainerData}>
                <h2 className={styles.header}>Sensor Veri Kontrol Paneli
                </h2>
                <div className={styles.filterArea}>
                    <SensorsDropdowns
                        role={userRole.role}
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
                <SensorDataControll
                    sensors={filteredSensors}
                    sensorTypes={sensorTypes}
                    times={times} // Times verisini burada gönderiyoruz
                    data = {resultData}
                />
            </div>
        </Layout>
    );
}
