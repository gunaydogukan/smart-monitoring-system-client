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
            console.log("owner",sensorOwners);
        } else if (role === 'manager') {
            const data = response.data;
            managers = data.manager;
            personals = data.personals;
            if(!managers){
                throw new Error("Manager bulunamadı");
            }
            sensors = data.managerSensors;
            if(!sensors){
                throw new Error("Sensör bulunamadı");
            }


            //personal sensörleri sensorwOwner objesine ekle
            const formattedSensors = data.personalSensors.flatMap(personal =>
                (personal.sensors?.sensors?.length > 0 ?
                        personal.sensors.sensors.map(sensor => ({
                            sensor_owner: personal.personalId,
                            sensor_id: sensor.id
                        }))
                        : []
                )
            );

            /*
              {
            sensor_owner: personal.personalId,
            sensor_id: sensor.id
            }
             */

            sensorOwners =[...data.sensorOwners,...formattedSensors]; // ?
            console.log("data = ",sensorOwners);
        } else {
            const data = response.data;
            // FİİLTER SERVİS KULLANILACAK
            sensors = data.sensors; //buradaki filtreleme işlemi kaldırıldı. backendden gelen filtreme kullanılıyor
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
            let manager = data.manager
            if (data.manager.id === userId) {
                manager = data.manager;
            }
            else {
                throw new Error("Manager ile user aynı değil");
            }

            personals = data.personals;
            sensors = data.managerSensors;

            const formattedSensors = data.personalSensors.flatMap(personal =>
                (personal.sensors?.sensors?.length > 0 ?
                        personal.sensors.sensors.map(sensor => ({
                            sensor_owner: personal.personalId,
                            sensor_id: sensor.id
                        }))
                        : []
                )
            );

            sensorOwners=[...data.sensorOwners,...formattedSensors];

            for (const personal of personals) {
                if (personal.creator_id !== manager.id) {
                    throw new Error("Manager ile user aynı değil");
                }
            }

        } else if (role === 'personal') {
            const data = response.data;
            sensors = data.sensors;  //buradaki filtreleme işlemi kaldırıldı. backendden gelen filtreme kullanılıyor
        }

        const result = await getTimes(sensors);
        const types = await fetchSensorTypes();

        // Erişim denetimi sonrası dönen veri
        return { allCompanies, managers, personals, sensors,result,sensorOwners,types };
    } catch (err) {
        console.log("Sensor verilerinin zaman kontrol hatası = (checkSensorDataTime metotu)", err);
        throw err;
    }
};

export const sensorOwners = async (role, userId) => {
    try {
        if (!userId) {
            throw new Error('Kullanıcı yok......');
        }

        // 1. Sensör tiplerini al
        const typeResponse = await axios.get(sensorTypeAPI, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });

        if (!typeResponse || !typeResponse.data) {
            throw new Error('API yanıtı eksik veya hatalı (sensorTypeAPI).');
        }

        // Sensör tiplerini mapping tablosu oluştur
        const sensorTypeMapping = {};
        typeResponse.data.forEach((type) => {
            sensorTypeMapping[type.id] = type.type; // Örnek: { 1: "Sıcaklık & Nem", 2: "Mesafe", ... }
        });

        // 2. Kullanıcıya ait sensörleri al
        const response = await axios.get(userSensorAPI, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });

        if (!response || !response.data) {
            throw new Error('API yanıtı eksik veya hatalı(sensorOwners metot).');
        }

        const data = response.data;
        let sensors = [];

        if (role === "manager") {
            sensors = data.managerSensors || [];
        } else if (role === "administrator") {
            const managerSensors = data.sensorOwners
                .filter(owner => owner.sensor_owner === userId)
                .map(owner => owner.sensor_id);

            const filteredSensors = data.sensors.filter(sensor =>
                managerSensors.includes(sensor.id)
            );

            sensors = Array.isArray(filteredSensors) ? [...filteredSensors] : [];
        }

        // 3. Sensörlere typeName ekle
        sensors = sensors.map(sensor => ({
            ...sensor,
            typeName: sensorTypeMapping[sensor.type] || "Bilinmeyen Tip" // `type` eşleşmesini yap
        }));

        return { success: true, sensors };
    } catch (err) {
        console.error("SensorOwners metot hatası ", err);
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





