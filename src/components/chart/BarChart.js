import React from 'react';
import { Bar } from 'react-chartjs-2';
import styles from '../../styles/Chart.module.css';

export default function BarChart({ data }) {
    const safeData = data || { labels: [], datasets: [] };

    return (
        <div className={styles.chartWrapper}>
            <Bar data={safeData} options={{ responsive: true }} />
        </div>
    );
}