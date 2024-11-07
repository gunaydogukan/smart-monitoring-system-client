// src/pages/ChartPage.js
import React, { useContext } from 'react';
import Charts from '../components/Charts';
import { ChartContext, ChartProvider } from '../contexts/ChartContext';
import { useTheme } from '../contexts/ThemeContext'; // Tema bağlamını ekleyin

const ChartPageContent = ({ sensor }) => {
    const { sensorData, loading, error, setInterval, interval } = useContext(ChartContext);
    const { isDarkMode } = useTheme(); // Tema bağlamını kullanarak karanlık modu alın

const ChartPageContent = ({ sensor }) => {
    const { sensorData, loading, error } = useContext(ChartContext);



    const handleIntervalChange = (event) => {
        setInterval(event.target.value); // Seçilen zaman aralığını context’e güncelle
    };


    if (loading) {
        return <p style={{ color: isDarkMode ? '#fff' : '#000' }}>Yükleniyor...</p>;
    }

    // Hata durumu
    if (error) {
        return <p style={{ color: isDarkMode ? '#fff' : '#000' }}>Veri yüklenirken bir hata oluştu: {error.message}</p>;
    }

    // Eğer veri varsa, grafik bileşenini göster
    return (

        <div>
            <h1 style={{ textAlign: 'center' }}>{sensor.name} - Grafik</h1>
            {sensorData.length > 0 ? (
                <Charts sensorType={sensor.type} data={sensorData} />

        <div style={{ backgroundColor: isDarkMode ? '#333' : '#fff', color: isDarkMode ? '#fff' : '#000', padding: '20px', borderRadius: '10px' }}>


            {/* Zaman Aralığı Seçici */}
            <label htmlFor="interval-select">Zaman Aralığı Seçin: </label>
            <select
                id="interval-select"
                onChange={handleIntervalChange}
                value={interval}
                style={{
                    backgroundColor: isDarkMode ? '#555' : '#fff',
                    color: isDarkMode ? '#fff' : '#000',
                    border: isDarkMode ? '1px solid #fff' : '1px solid #000',
                    marginBottom: '10px',
                    padding: '5px'
                }}
            >
                <option value="1 Gün">1 Gün</option>
                <option value="1 Hafta">1 Hafta</option>
                <option value="1 Ay">1 Ay</option>
                <option value="3 Ay">3 Ay</option>
                <option value="6 Ay">6 Ay</option>
                <option value="1 Yıl">1 Yıl</option>
                <option value="5 Yıl">5 Yıl</option>
                <option value="Maksimum">Maksimum</option>
            </select>

            {sensorData.length > 0 ? (
                <Charts sensorType={sensor.type} data={sensorData} interval={interval} />

            ) : (
                <p style={{ color: isDarkMode ? '#fff' : '#000' }}>Grafik verisi yok. Lütfen sensör verisi ekleyin.</p>
            )}
        </div>
    );
};

const ChartPage = ({ sensor }) => {

    // Sensör nesnesinin tanımlı olup olmadığını kontrol edin
    if (!sensor) {
        return <p>Grafik verisi mevcut değil.</p>; // Sensör yoksa bilgi ver
    }

    return (
        <ChartProvider sensor={sensor}>
            <ChartPageContent sensor={sensor} />
        </ChartProvider>
    );
};

export default ChartPage;
