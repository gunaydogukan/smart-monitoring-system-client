import axios from 'axios';
import {
    filterManagersByCompany,
    filterSensorsByCompany,
    filterPersonalsByCompany,
    filterPersonalsByManager,
    filterSensorsByManager,
    filterSensorsByPersonal
} from './FilterService';

const userSensorAPI = 'http://localhost:5000/api/user-sensors';
const sensorTypeAPI = 'http://localhost:5000/api/type';
const sensorTimeAPI = 'http://localhost:5000/log/data-time-check';

// Sensör verilerini kullanıcıya göre çekme
export const sensorIpServices = async (role, userId) => {
    try {
        if (!userId) {
            throw new Error('Kullanıcı yok......');
        }

        const response = await axios.get(userSensorAPI, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });

        let allCompanies = [];
        let managers = [];
        let personals = [];
        let sensors = [];
        let sensorOwners = [];

        if (role === 'administrator') {
            const data = response.data;
            allCompanies = data.allCompanies || [];
            managers = data.managers || [];
            personals = data.personals || [];
            sensors = data.sensors || [];
            sensorOwners = data.sensorOwners || [];
        } else if (role === 'manager') {
            // DEĞİŞECEK FİLTER SERVİS İLE
            const data = response.data;
            managers = data.managers?.filter((m) => m.managerId === userId) || [];
            sensors = data.sensors?.filter((sensor) => sensor.ownerId === userId) || [];
            sensorOwners = data.sensorOwners || [];
        } else {
            // FİİLTER SERVİS KULLANILACAK
            sensors = response.data.sensors?.filter((sensor) => sensor.assignedTo === userId) || [];
        }

        const IP_Data = await getIPData(sensors);
        const types = await fetchSensorTypes();

        return {
            companies: allCompanies,
            managers,
            personals,
            sensors,
            sensorOwners,
            ipLogs: IP_Data,
            types,
        };
    } catch (error) {
        console.error('Sensör verileri alınırken hata oluştu: (SENSORSERVİCES.JS)', error);
        throw error;
    }
};

export const getIPData = async (sensors) => {
    try {
        // Eğer sensör verisi boşsa hata fırlat
        if (!sensors || sensors.length === 0) {
            throw new Error('Sensör verisi eksik veya boş.');
        }

        // Sensör datacode'larını virgülle ayrılmış bir string olarak oluştur
        const datacodes = sensors.map(sensor => sensor.datacode).join(',');
        // GET isteği yap
        const response = await axios.get('http://localhost:5000/log/IP-controll', {
            params: {
                datacodes, // URL parametresi olarak datacodes ekle
            },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`, // Token ekle
            },
        });

        // Başarılı sonuç döndür
        return response.data;
    } catch (error) {
        console.error('IP logları alınırken hata oluştu:', error);
        throw error; // Hata durumunda üst bileşene hatayı ilet
    }
};

// Sensör tiplerini çekme
export const fetchSensorTypes = async () => {
    try {
        const response = await axios.get(sensorTypeAPI,{
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`, // Token ekle
            },
        });

        // Verilerin doğru şekilde alındığını kontrol et
        if (response.status !== 200 || !response.data) {
            throw new Error('Sensör tipleri alınamadı. Sunucudan geçersiz yanıt.');
        }

        return response.data;
    } catch (error) {
        console.error('Sensör tipleri alınırken hata oluştu: (SENSORSERVİCES.JS) ', error);
        throw error;
    }
};

export const checkSensorDataTime = async (role, userId, companyCode = null, managerId = null, personalId = null) => {
    try {
        if (!userId) {
            throw new Error('Kullanıcı yok......');
        }

        //ilgili kullanıcıyı getir
        const response = await axios.get(userSensorAPI, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });

        let allCompanies = [];
        let managers = [];
        let personals = [];
        let sensors = [];
        let sensorOwners = [];

        if (role === 'administrator') {
            const data = response.data;
            allCompanies = data.allCompanies || [];
            managers = data.managers || [];
            personals = data.personals || [];
            sensors = data.sensors || [];
            sensorOwners = data.sensorOwners || [];


        } else if (role === 'manager') {
            const data = response.data;

            // Manager bilgileri ve bağlı personeller
            const manager = data.managers.find(m => m.id === userId);
            if (!manager) {
                throw new Error('Manager bulunamadı.');
            }

            personals = data.personals.filter(personal => personal.creator_id === manager.id);
            sensors = data.sensors.filter(sensor =>
                data.sensorOwners.some(owner => owner.sensor_owner === manager.id && owner.sensor_id === sensor.id)
            );

        } else if (role === 'personal') {
            const data = response.data;
            sensors = data.sensors.filter(sensor =>
                data.sensorOwners.some(owner => owner.sensor_owner === userId && owner.sensor_id === sensor.id)
            );
        }

        const times = await getTimes(sensors);
        const types = await fetchSensorTypes();


        // Erişim denetimi sonrası dönen veri
        return { allCompanies, managers, personals, sensors,times,sensorOwners,types };
    } catch (err) {
        console.log("Sensor verilerinin zaman kontrol hatası = (checkSensorDataTime metotu)", err);
        throw err;
    }
};

export const getTimes = async (sensors) => {
    try {
        // Datacodları al
        const sensorDatacodes = sensors.map(s => s.datacode);

        // Query string oluştur
        const queryString = sensorDatacodes
            .map(code => `sensors[]=${encodeURIComponent(code)}`)
            .join('&');

        // Fetch isteği
        const response = await fetch(`${sensorTimeAPI}?${queryString}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });

        // Yanıt durumu kontrolü
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        // JSON yanıtını parse et
        const data = await response.json();
        return data;
    } catch (err) {
        console.error("API Hatası (getTimes):", err);
        throw err;
    }
};





