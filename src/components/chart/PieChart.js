import React from 'react';
import { Pie } from 'react-chartjs-2';
import styles from '../../styles/Chart.module.css';

export default function PieChart({ data }) {
    const safeData = data || { labels: [], datasets: [] };

    return (
        <div className={styles.chartWrapper}>
            <Pie data={safeData} options={{ responsive: true }} />
        </div>
    );
}
