import {get} from "axios";

export const fetchSensorData = async (sensor, interval) => {
    console.log("Gönderilen sensör başarıyla fethSensorData metotuna iletildi = ",sensor);
    if (!sensor || !sensor.datacode) {
        throw new Error("Geçersiz sensör veya datacode bilgisi.");
    }

    console.log("fetchSensorData - Sensor datacode:", sensor.datacode); // datacode kontrolü
    try {
        // Interval parametresi varsa URL'ye ekle
        const url = `http://localhost:5000/api/sensor-data?dataCode=${sensor.datacode}${interval ? `&interval=${interval}` : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Yetkilendirme hatası: Lütfen tekrar giriş yapın.");
            } else if (response.status === 404) {
                throw new Error("Endpoint bulunamadı.(dataServices)");
            } else {
                throw new Error(`Veri çekme hatası: Sunucudan beklenmedik bir yanıt alındı (Kod: ${response.status}).`);
            }
        }

        const type = await getType(sensor.type);
        // Yanıtı JSON olarak çözümle, eğer çözümleyemiyorsa yanıtı metin olarak göster
        const text = await response.text();
        try {
            const data = JSON.parse(text);
            console.log("Alınan veri(fetchSensorData) = ",data);

            const ortalama = await ortalamaHesabi(data.data);

            return { type, data: data.data, ortalama};
        } catch (error) {
            console.error("Beklenmedik yanıt formatı:", text); // Beklenmeyen yanıtı loglayın
            throw new Error("Geçersiz JSON formatında yanıt alındı.");
        }

    } catch (error) {
        console.error("Veri çekme hatası:", error.message);
        throw error;
    }
};

const ortalamaHesabi = async (data) => {
    const ort = {};

    // Verileri her bir sütun için işlemeye başla
    data.forEach(item => {
        Object.keys(item).forEach(key => {
            if (key !== "time") {
                // Eğer key daha önce eklenmemişse, yeni bir dizi başlatıyoruz
                if (!ort[key]) ort[key] = [];
                ort[key].push(item[key]);
            }
        });
    });

    // Ortalamaları hesapla
    Object.keys(ort).forEach(key => {
        ort[key] = ort[key].reduce((acc, value) => acc + value, 0) / ort[key].length;
    });

    return ort;
};


const getType = async (sensorType) => {
    if (!sensorType) {
        throw new Error("Geçersiz sensör tip bilgisi DataServices.js");
    }

    try {
        const url = "http://localhost:5000/api/type"; // Endpoint URL

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Yetkilendirme hatası: Lütfen tekrar giriş yapın.");
            } else if (response.status === 404) {
                throw new Error("Endpoint bulunamadı.");
            } else {
                throw new Error(`Veri çekme hatası: Sunucudan beklenmedik bir yanıt alındı (Kod: ${response.status}).`);
            }
        }

        const data = await response.json();
        const foundType = data.find(item =>item.id === sensorType);

        if (!foundType) {
            throw new Error(`Sensör tipi ${sensorType} bulunamadı.`);
        }

        return foundType;

    } catch (err) {
        console.error("Veri çekme hatası:", err.message); // Hataları doğru şekilde logluyoruz
        throw err; // Hata yakalanırsa tekrar fırlatılır
    }
};
