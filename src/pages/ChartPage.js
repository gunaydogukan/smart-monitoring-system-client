import React, { useContext } from 'react';
import Charts from '../components/Charts';
import { ChartContext, ChartProvider } from '../contexts/ChartContext';
import { useTheme } from '../contexts/ThemeContext'; // Tema bağlamını ekleyin

const ChartPageContent = ({ sensor }) => {
    const { sensorData, loading, error, setInterval, interval } = useContext(ChartContext);
    const { isDarkMode } = useTheme(); // Tema bağlamını kullanarak karanlık modu alın

    const handleIntervalChange = (event) => {
        setInterval(event.target.value); // Seçilen zaman aralığını context’e güncelle
    };

    if (loading) {
        return <p style={{ color: isDarkMode ? '#fff' : '#000' }}>Yükleniyor...</p>;
    }

    if (error) {
        return <p style={{ color: isDarkMode ? '#fff' : '#000' }}>Veri yüklenirken bir hata oluştu: {error.message}</p>;
    }

    return (
        <div style={{ backgroundColor: isDarkMode ? '#333' : '#fff', color: isDarkMode ? '#fff' : '#000', padding: '20px', borderRadius: '10px' }}>


            {/* Zaman Aralığı Seçici */}
            <label htmlFor="interval-select">Zaman Aralığı Seçin: </label>
            <select
                id="interval-select"
                onChange={handleIntervalChange}
                style={{
                    backgroundColor: isDarkMode ? '#555' : '#fff',
                    color: isDarkMode ? '#fff' : '#000',
                    border: isDarkMode ? '1px solid #fff' : '1px solid #000',
                    marginBottom: '10px',
                    padding: '5px'
                }}
            >
                <option value="dakikalık">Dakikalık</option>
                <option value="saatlik">Saatlik</option>
                <option value="günlük">Günlük</option>
                <option value="aylık">Aylık</option>
                <option value="yıllık">Yıllık</option>
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
    return (
        <ChartProvider sensor={sensor}>
            <ChartPageContent sensor={sensor} />
        </ChartProvider>
    );
};

export default ChartPage;
