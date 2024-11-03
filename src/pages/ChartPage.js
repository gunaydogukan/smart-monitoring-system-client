import React, { useContext } from 'react';
import Charts from '../components/Charts';
import { ChartContext, ChartProvider } from '../contexts/ChartContext';


const ChartPageContent = () => {
    const location = useLocation();
    const { sensorData, loading, error, setInterval,interval } = useContext(ChartContext);
    const sensor = location.state?.sensor;

    const handleIntervalChange = (event) => {
        setInterval(event.target.value); // Seçilen zaman aralığını context’e güncelle
    };

    if (loading) {
        return <p>Yükleniyor...</p>;
    }

    if (error) {
        return <p>Veri yüklenirken bir hata oluştu: {error.message}</p>;
    }

    return (
        <div>
            <h1>{sensor ? `${sensor.name} - Grafik` : 'Grafik Sayfası'}</h1>
            {/* Zaman Aralığı Seçici */}
            <label htmlFor="interval-select">Zaman Aralığı Seçin: </label>
            <select id="interval-select" onChange={handleIntervalChange}>
                <option value="dakikalık">Dakikalık</option>
                <option value="saatlik">Saatlik</option>
                <option value="günlük">Günlük</option>
                <option value="aylık">Aylık</option>
                <option value="yıllık">Yıllık</option>
            </select>

            {sensorData.length > 0 || sensor ? (
                <Charts sensorType={sensor ? sensor.type : undefined} data={sensorData} interval={interval} />

            <h1 style={{ textAlign: 'center' }}>{sensor.name} - Grafik</h1>
            {sensorData.length > 0 ? (
                <Charts sensorType={sensor.type} data={sensorData} />

            ) : (
                <p>Grafik verisi yok. Lütfen sensör verisi ekleyin.</p>
            )}
        </div>
    );
};


const ChartPage = ({ sensor }) => {
    const location = useLocation();
    const sensor = location.state?.sensor;
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
