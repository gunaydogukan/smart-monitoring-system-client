import React from 'react';
import { Line } from 'react-chartjs-2';
import styles from '../../styles/Chart.module.css';

export default function LineChart({ data }) {
    const safeData = data || { labels: [], datasets: [] };

    return (
        <div className={styles.chartWrapper}>
            <Line data={safeData} options={{ responsive: true }} />
        </div>
    );
}