export const fetchSensorData = async (sensor, interval) => {

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
                throw new Error("Endpoint bulunamadı.");
            } else {
                throw new Error(`Veri çekme hatası: Sunucudan beklenmedik bir yanıt alındı (Kod: ${response.status}).`);
            }
        }

        // Yanıtı JSON olarak çözümle, eğer çözümleyemiyorsa yanıtı metin olarak göster
        const text = await response.text();
        try {
            const data = JSON.parse(text);
            return data;
        } catch (error) {
            console.error("Beklenmedik yanıt formatı:", text); // Beklenmeyen yanıtı loglayın
            throw new Error("Geçersiz JSON formatında yanıt alındı.");
        }

    } catch (error) {
        console.error("Veri çekme hatası:", error.message);
        throw error;
    }
};
