import React from 'react';
import styles from '../../styles/RecentUpdates.module.css';

export default function RecentUpdates({ updates }) {
    return (
        <div className={styles.recentUpdatesContainer}>
            <h3>Son Veri Güncellemeleri</h3>
            <ul>
                {updates.map(update => (
                    <li key={update.id}>
                        {update.name} - Son Güncelleme: {update.lastUpdate}
                    </li>
                ))}
            </ul>
        </div>
    );
}
