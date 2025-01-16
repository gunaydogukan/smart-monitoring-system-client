import React from 'react';
import LineChart from './chart/LineChart';
import BarChart from './chart/BarChart';
import PieChart from './chart/PieChart';
import AlertsBarChart from './chart/AlertsBarChart';
import styles from '../styles/ChartsContainer.module.css';

export default function ChartsContainer({ lineData, barData, pieData, alertsData }) {
    return (
        <div className={styles.chartContainer}>
            <div className={styles.chartItem}>
                <h3>Zamana Göre Sıcaklık ve Nem</h3>
                <LineChart data={lineData} />
            </div>
            <div className={styles.chartItem}>
                <h3>Sensör Tiplerine Göre Dağılım</h3>
                <BarChart data={barData} />
            </div>
            <div className={styles.chartItem}>
                <h3>Kurumlara Göre Sensör Dağılımı</h3>
                <PieChart data={pieData} />
            </div>
            <div className={styles.chartItem}>
                <h3>Aylık Uyarı Sayısı</h3>
                <AlertsBarChart data={alertsData} />
            </div>
        </div>
    );
}
