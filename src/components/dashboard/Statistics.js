import React from 'react';
import styles from '../../styles/Statistics.module.css';

export default function Statistics({ data }) {
    return (
        <div className={styles.statisticsContainer}>
            <div className={styles.statBox}>
                <h3>Toplam Sensör</h3>
                <p>{data.totalSensors}</p>
            </div>
            <div className={styles.statBox}>
                <h3>Aktif Kullanıcılar</h3>
                <p>{data.activeUsers}</p>
            </div>
            <div className={styles.statBox}>
                <h3>Toplam Kurum</h3>
                <p>{data.totalInstitutions}</p>
            </div>
        </div>
    );
}
