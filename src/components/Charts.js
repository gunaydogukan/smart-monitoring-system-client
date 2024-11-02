// client/src/components/Charts.js
import React from 'react';
import ReactECharts from 'echarts-for-react';
import { getSensorChartOptions } from '../assets/ChartOptions';

const Charts = ({ sensorType, data }) => {
    // Eksik sensör tipi veya veri kontrolü
    if (!sensorType || !data) {
        console.warn('Eksik sensör tipi veya veri. Grafik gösterilemiyor.');
        return <p>Grafik verisi bulunamadı.</p>;
    }

    // Chart seçeneklerini al
    const chartOptions = getSensorChartOptions(sensorType, data);

    // Eğer `sensorType` 1 ise 6 ayrı grafik render et
    if (sensorType === 1 && Array.isArray(chartOptions)) {
        return (
            <div>
                {chartOptions.map((options, index) => (
                    <div key={index} style={{ width: '100%', height: '400px', marginBottom: '20px' }}>
                        <ReactECharts option={options} style={{ height: '100%' }} />
                    </div>
                ))}
            </div>
        );
    }

    // Eğer tek bir grafik ayarı varsa, doğrudan render et
    return (
        <div style={{ width: '100%', height: '400px' }}>
            <ReactECharts option={chartOptions} style={{ height: '100%' }} />
        </div>
    );
};

export default Charts;
