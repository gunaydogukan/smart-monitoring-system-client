import React from 'react';
import ReactECharts from 'echarts-for-react';
import { getSensorChartOptions } from '../assets/ChartOptions';

const Charts = ({ sensorType, data, interval }) => {
    const chartOptions = getSensorChartOptions(sensorType, data, interval);

    if (!Array.isArray(chartOptions) || chartOptions.length === 0) {
        console.error("Geçerli grafik seçenekleri oluşturulamadı.");
        return <div>Grafik oluşturulamadı</div>;
    }

    return (
        <div style={{ width: '100%' }}>
            {chartOptions.map((options, index) => (
                <div key={index} style={{ width: '100%', height: '400px', marginBottom: '20px' }}>
                    <ReactECharts option={options} style={{ height: '100%' }} />
                </div>
            ))}
        </div>
    );
};

export default Charts;
