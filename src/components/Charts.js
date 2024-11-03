import React from 'react';
import ReactECharts from 'echarts-for-react';
import { getSensorChartOptions } from '../assets/ChartOptions';

const Charts = ({ sensorType, data,interval }) => {
    // Chart seçeneklerini al

    console.log(interval);
    const chartOptions = getSensorChartOptions(sensorType, data,interval);

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
