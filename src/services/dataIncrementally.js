//anlıkmış gibi gösterir. , sonra silenecek
export const fetchSensorDataIncrementally = (data, interval, callback) => {
    let dataIndex = 0;

    // Güncelleme sıklığını interval’e göre belirleme
    const getUpdateFrequency = () => {
        switch (interval) {
            case '1 Gün':
                return 5000; // 5 saniyede bir
            case '1 Hafta':
                return 60000 * 5; // 5 dakikada bir
            case '1 Ay':
                return 60000 * 60; // 1 saatte bir
            case '3 Ay':
                return 60000 * 60 * 4; // 4 saatte bir
            case '6 Ay':
                return 60000 * 60 * 24; // 1 günde bir
            case '1 Yıl':
                return 60000 * 60 * 24 * 7; // 1 haftada bir
            case '5 Yıl':
                return 60000 * 60 * 24 * 30; // 1 ayda bir
            default:
                return 5000; // Varsayılan: 5 saniye
        }
    };

    const updateFrequency = getUpdateFrequency();

    // Belirli aralıklarla veri döndürmek için zamanlayıcı
    const intervalId = setInterval(() => {
        if (dataIndex < data.length) {
            callback(data[dataIndex]); // Yeni veriyi callback ile gönder
            dataIndex += 1;
        } else {
            clearInterval(intervalId); // Tüm veriler gösterildiğinde durdur
        }
    }, updateFrequency);

    return () => clearInterval(intervalId); // Zamanlayıcıyı durdurma işlevi
};
