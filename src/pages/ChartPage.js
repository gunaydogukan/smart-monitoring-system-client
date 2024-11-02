// src/pages/ChartPage.js
import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import Charts from '../components/Charts';
import { ChartContext, ChartProvider } from '../contexts/ChartContext';

const ChartPageContent = () => {
    const location = useLocation();
    const { sensorData, loading, error } = useContext(ChartContext);
    const sensor = location.state?.sensor;

    // Gelen veri ve durumları kontrol edin
    console.log('Gelen sensör verisi:', sensor); //sensorün bilgilerini alır
    console.log('Context üzerinden alınan sensorData:', sensorData); //contexten sensordata db ' den sensorün table'ına göre seçip veriyi alır //yapılacak

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
            <h1>
                {sensor ? `${sensor.name} - Grafik` : 'Grafik Sayfası'}
            </h1>
            {sensorData.length > 0 || sensor ? (
                <Charts sensorType={sensor ? sensor.type : undefined } data={sensor ? sensorData : sensorData} />
            ) : (
                <p>Grafik verisi yok. Lütfen sensör verisi ekleyin.</p>
            )}
        </div>
    );
};

const ChartPage = () => (
    <ChartProvider>
        <ChartPageContent />
    </ChartProvider>
);

export default ChartPage;
