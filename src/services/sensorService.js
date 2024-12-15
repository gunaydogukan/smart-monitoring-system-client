import axios from 'axios';

const userSensorAPI = 'http://localhost:5000/api/user-sensors';
const sensorTypeAPI = 'http://localhost:5000/api/type';

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
