// src/pages/ChartPage.js
import React, { useContext } from 'react';
import Charts from '../components/Charts';
import { ChartContext, ChartProvider } from '../contexts/ChartContext';

const ChartPageContent = ({ sensor }) => {
    const { sensorData, loading, error } = useContext(ChartContext);

    // Yüklenme durumu
    if (loading) {
        return <p>Yükleniyor...</p>;
    }

    // Hata durumu
    if (error) {
        return <p>Veri yüklenirken bir hata oluştu: {error.message}</p>;
    }

    // Eğer veri varsa, grafik bileşenini göster
    return (
        <div>
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
