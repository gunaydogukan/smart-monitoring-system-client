// src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import Layout from "../layouts/Layout";
import styles from '../styles/Dashboard.module.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export default function Dashboard() {
    const [sensorAlerts, setSensorAlerts] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [recentUpdates, setRecentUpdates] = useState([]);

    useEffect(() => {
        // Örnek veriler - Backend entegrasyonu sağlanabilir
        setSensorAlerts([
            { id: 1, name: 'Sıcaklık Sensörü 1', message: 'Sıcaklık çok yüksek!', date: '2023-11-01' },
            { id: 2, name: 'Nem Sensörü 2', message: 'Nem düşük seviyede', date: '2023-11-02' },
        ]);
        setStatistics({
            totalSensors: 62,
            activeUsers: 2,
            totalInstitutions: 2
        });
        setRecentUpdates([
            { id: 1, name: 'Sıcaklık Sensörü 1', lastUpdate: '2023-11-05' },
            { id: 2, name: 'Nem Sensörü 2', lastUpdate: '2023-11-05' },
        ]);
    }, []);

    const lineData = {
        labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
        datasets: [
            {
                label: 'Sıcaklık (°C)',
                data: [3, 6, 8, 12, 15, 18],
                borderColor: '#FF6384',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: true,
            },
            {
                label: 'Nem (%)',
                data: [85, 80, 75, 70, 65, 60],
                borderColor: '#36A2EB',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: true,
            }
        ]
    };

    const barData = {
        labels: ['Sıcaklık Sensörü', 'Nem Sensörü', 'Mesafe Sensörü', 'Yağış Sensörü'],
        datasets: [
            {
                label: 'Sensör Sayısı',
                data: [12, 8, 5, 7],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
            }
        ]
    };

    const pieData = {
        labels: ['Kurum A', 'Kurum B', 'Kurum C', 'Kurum D'],
        datasets: [
            {
                label: 'Sensör Dağılımı',
                data: [20, 15, 10, 5],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
            }
        ]
    };

    const alertsData = {
        labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
        datasets: [
            {
                label: 'Uyarı Sayısı',
                data: [5, 3, 6, 2, 8, 4],
                backgroundColor: '#FF6384'
            }
        ]
    };

    return (
        <Layout>
            <div className={styles.dashboardContainer}>
                <h1>Dashboard</h1>

                {/* Genel İstatistikler */}
                <div className={styles.statisticsContainer}>
                    <div className={styles.statBox}>
                        <h3>Toplam Sensör</h3>
                        <p>{statistics.totalSensors}</p>
                    </div>
                    <div className={styles.statBox}>
                        <h3>Aktif Kullanıcılar</h3>
                        <p>{statistics.activeUsers}</p>
                    </div>
                    <div className={styles.statBox}>
                        <h3>Toplam Kurum</h3>
                        <p>{statistics.totalInstitutions}</p>
                    </div>
                </div>

                {/* Grafikler */}
                <div className={styles.chartContainer}>
                    <div className={styles.chartItem}>
                        <h3>Zamana Göre Sıcaklık ve Nem</h3>
                        <Line data={lineData} options={{ responsive: true }} />
                    </div>
                    <div className={styles.chartItem}>
                        <h3>Sensör Tiplerine Göre Dağılım</h3>
                        <Bar data={barData} options={{ responsive: true }} />
                    </div>
                    <div className={styles.chartItem}>
                        <h3>Kurumlara Göre Sensör Dağılımı</h3>
                        <Pie data={pieData} options={{ responsive: true }} />
                    </div>
                    <div className={styles.chartItem}>
                        <h3>Aylık Uyarı Sayısı</h3>
                        <Bar data={alertsData} options={{ responsive: true }} />
                    </div>
                </div>

                {/* Son Sensör Uyarıları */}
                <div className={styles.alertsContainer}>
                    <h3>Son Sensör Uyarıları</h3>
                    <ul>
                        {sensorAlerts.map(alert => (
                            <li key={alert.id}>
                                <strong>{alert.name}:</strong> {alert.message} <em>({alert.date})</em>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Son Veri Güncellemeleri */}
                <div className={styles.recentUpdatesContainer}>
                    <h3>Son Veri Güncellemeleri</h3>
                    <ul>
                        {recentUpdates.map(update => (
                            <li key={update.id}>
                                {update.name} - Son Güncelleme: {update.lastUpdate}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </Layout>
    );
}