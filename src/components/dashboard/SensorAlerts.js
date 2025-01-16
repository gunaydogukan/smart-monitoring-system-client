import React from 'react';
import styles from '../../styles/SensorAlerts.module.css';

export default function SensorAlerts({ alerts }) {
    return (
        <div className={styles.alertsContainer}>
            <h3>Son Sensör Uyarıları</h3>
            <ul>
                {alerts.map(alert => (
                    <li key={alert.id}>
                        <strong>{alert.name}:</strong> {alert.message} <em>({alert.date})</em>
                    </li>
                ))}
            </ul>
        </div>
    );
}
