
// client/src/services/dataService.js
// Sahte veri
const mockSensorData = [
    { id: 1, type: 1, sagUstNem: 45.0, sagUstSıcaklık: 22.5, sagAltNem: 40.0, sagAltSıcaklık: 23.0, solAltNem: 38.0, solAltSıcaklık: 21.0, time: '2024-11-01T10:00:00' },
    { id: 2, type: 1, sagUstNem: 50.0, sagUstSıcaklık: 24.5, sagAltNem: 42.0, sagAltSıcaklık: 23.5, solAltNem: 37.0, solAltSıcaklık: 20.0, time: '2024-11-01T11:00:00' },
    { id: 3, type: 2, distance: 12.5, time: '2024-11-01T12:00:00' },
    { id: 4, type: 2, distance: 15.0, time: '2024-11-01T13:00:00' },
    { id: 5, type: 3, rainFall: 3.5, time: '2024-11-01T14:00:00' },
    { id: 6, type: 3, rainFall: 0.0, time: '2024-11-01T15:00:00' },
    { id: 7, type: 4, value: 75.0, time: '2024-11-01T16:00:00' },
    { id: 8, type: 4, value: 82.5, time: '2024-11-01T17:00:00' }
];
// Sahte sensör verisini dönen fonksiyon
export const fetchSensorData = async () => {
    try {
        // Normalde burada fetch kullanılır ancak şimdilik sahte veriyi döndürüyoruz.
        return mockSensorData;
    } catch (error) {
        console.error('Veri çekme hatası:', error);
        throw error;
    }
};

/*
export const fetchLifeExpectancyData = async () => {
    try {
        const ROOT_PATH = 'http://localhost:5000'; // Localhost URL’iniz
        const response = await fetch(`${ROOT_PATH}/data/asset/data/life-expectancy-table.json`);

        if (!response.ok) {
            throw new Error('Veri çekme hatası');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Veri çekme hatası:', error);
        throw error;
    }
};
*/