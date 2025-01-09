import React from 'react';
import ReactECharts from 'echarts-for-react';
import { getSensorChartOptions } from '../assets/ChartOptions';

const Charts = ({ sensorType, data, interval, chartType }) => {
    const chartOptions = getSensorChartOptions(sensorType, data, interval, chartType);

    if (!Array.isArray(chartOptions) || chartOptions.length === 0) {
        console.error('Geçerli grafik seçenekleri oluşturulamadı.');
        return <div>Grafik oluşturulamadı</div>;
    }

    return (
        <div className="charts-container">
            {chartOptions.map((options, index) => (
                <div key={index} className="chart-wrapper">
                    <ReactECharts option={options} style={{ height: '100%', width: '100%' }} />
                </div>
            ))}
        </div>
    );
};

export default Charts;
