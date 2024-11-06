import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { getSensorChartOptions } from '../assets/ChartOptions';
import { fetchSensorDataIncrementally } from '../services/dataIncrementally';

const Charts = ({ sensorType, data, interval }) => {
    //const [displayedData, setDisplayedData] = useState([]); // Gösterilen veriler , silenecek
/*
    //silenecek
    useEffect(() => {
        setDisplayedData([]); // Yeni interval veya data geldiğinde sıfırla

        // Veriyi kademeli olarak ekleyen servisi başlat
        const stopFetching = fetchSensorDataIncrementally(data, interval, (newData) => {
            setDisplayedData(prevData => [...prevData, newData]);
            localStorage.setItem('displayedData', JSON.stringify(updatedData)); // Güncel gösterilen veriyi kaydet
            return updatedData;
        });

        return () => stopFetching(); // Bileşen unmounted olduğunda temizle
    }, [data, interval]);
*/
    // Chart seçeneklerini al
    const chartOptions = getSensorChartOptions(sensorType, data, interval);

    return (
        <div style={{ width: '100%', height: '400px' }}>
            {sensorType === 1 && Array.isArray(chartOptions) ? (
                chartOptions.map((options, index) => (
                    <div key={index} style={{ width: '100%', height: '400px', marginBottom: '20px' }}>
                        <ReactECharts option={options} style={{ height: '100%' }} />
                    </div>
                ))
            ) : (
                <ReactECharts option={chartOptions} style={{ height: '100%' }} />
            )}
        </div>
    );
};

export default Charts;
