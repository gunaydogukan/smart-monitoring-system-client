import React, { useContext, useEffect, useState } from 'react';
import Charts from '../components/Charts';
import { ChartContext, ChartProvider } from '../contexts/ChartContext';
import LoadingScreen from '../components/LoadingScreen';
import '../styles/ChartPage.css';

const ChartPageContent = ({ sensor }) => {
    const { sensorData, sensorType, loading, error, setInterval, interval } =
        useContext(ChartContext);
    const [showLoading, setShowLoading] = useState(true);
    const [chartType, setChartType] = useState('line');

    const handleIntervalChange = (event) => {
        setInterval(event.target.value);
    };

    const handleChartTypeChange = (event) => {
        setChartType(event.target.value);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    if (loading || showLoading) {
        return <LoadingScreen />;
    }

    if (error) {
        return (
            <p className="chart-error">
                Veri yüklenirken bir hata oluştu: {error.message}
            </p>
        );
    }

    return (
        <div className="chart-page-container">
            <div className="chart-controls">
                <div className="chart-control-group">
                    <label htmlFor="interval-select" className="chart-label">
                        Zaman Aralığı Seçin:
                    </label>
                    <select
                        id="interval-select"
                        onChange={handleIntervalChange}
                        value={interval}
                        className="chart-select"
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
                </div>

                <div className="chart-control-group">
                    <label htmlFor="chart-type-select" className="chart-label">
                        Grafik Türü Seçin:
                    </label>
                    <select
                        id="chart-type-select"
                        onChange={handleChartTypeChange}
                        value={chartType}
                        className="chart-select"
                    >
                        <option value="line">Çizgi Grafik</option>
                        <option value="bar">Sütun Grafik</option>
                    </select>
                </div>
            </div>

            <div className="charts-container">
                {sensorData.length > 0 ? (
                    <Charts
                        sensorType={sensorType}
                        data={sensorData}
                        interval={interval}
                        chartType={chartType}
                    />
                ) : (
                    <p className="chart-no-data">
                        Grafik verisi yok. Lütfen sensör verisi ekleyin.
                    </p>
                )}
            </div>
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
