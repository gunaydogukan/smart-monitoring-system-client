import React, { useEffect, useState } from 'react';
import Layout from "../layouts/Layout";
import Statistics from '../components/dashboard/Statistics';
import ChartsContainer from '../components/ChartsContainer';
import SensorAlerts from '../components/dashboard/SensorAlerts';
import RecentUpdates from '../components/dashboard/RecentUpdates';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement, // Burada PointElement'i ekledik
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

import styles from '../styles/DashboardPage.module.css';

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

export default function DashboardPage() {
    const [sensorAlerts, setSensorAlerts] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [recentUpdates, setRecentUpdates] = useState([]);
    const [chartData, setChartData] = useState({
        lineData: { labels: [], datasets: [] },
        barData: { labels: [], datasets: [] },
        pieData: { labels: [], datasets: [] },
        alertsData: { labels: [], datasets: [] },
    });

    useEffect(() => {
        setSensorAlerts([
            { id: 1, name: 'Sıcaklık Sensörü 1', message: 'Sıcaklık çok yüksek!', date: '2023-11-01' },
            { id: 2, name: 'Nem Sensörü 2', message: 'Nem düşük seviyede', date: '2023-11-02' },
        ]);
        setStatistics({
            totalSensors: 62,
            activeUsers: 2,
            totalInstitutions: 2,
        });
        setRecentUpdates([
            { id: 1, name: 'Sıcaklık Sensörü 1', lastUpdate: '2023-11-05' },
            { id: 2, name: 'Nem Sensörü 2', lastUpdate: '2023-11-05' },
        ]);
        setChartData({
            lineData: {
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
                    },
                ],
            },
            barData: {
                labels: ['Sıcaklık Sensörü', 'Nem Sensörü', 'Mesafe Sensörü', 'Yağış Sensörü'],
                datasets: [
                    {
                        label: 'Sensör Sayısı',
                        data: [12, 8, 5, 7],
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                    },
                ],
            },
            pieData: {
                labels: ['Kurum A', 'Kurum B', 'Kurum C', 'Kurum D'],
                datasets: [
                    {
                        label: 'Sensör Dağılımı',
                        data: [20, 15, 10, 5],
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                    },
                ],
            },
            alertsData: {
                labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
                datasets: [
                    {
                        label: 'Uyarı Sayısı',
                        data: [5, 3, 6, 2, 8, 4],
                        backgroundColor: '#FF6384',
                    },
                ],
            },
        });
    }, []);

    return (
        <Layout>
            <div className={styles.dashboardContainer}>
                <h1>Dashboard</h1>
                <Statistics data={statistics} />
                <ChartsContainer
                    lineData={chartData.lineData}
                    barData={chartData.barData}
                    pieData={chartData.pieData}
                    alertsData={chartData.alertsData}
                />
                <SensorAlerts alerts={sensorAlerts} />
                <RecentUpdates updates={recentUpdates} />
            </div>
        </Layout>
    );
}