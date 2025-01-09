import React from 'react';
import ChartPage from '../pages/ChartPage'; // ChartPage bileşenini içe aktar
import styles from '../styles/Modal.module.css'; // CSS Modules ile içe aktar

const Modal = ({ isOpen, onClose, sensor }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        {sensor ? `${sensor.name} - Grafiği` : 'Grafik'}
                    </h2>
                    <button onClick={onClose} className={styles.modalCloseButton}>
                        ✖
                    </button>
                </div>
                <div className={styles.modalBody}>
                    <ChartPage sensor={sensor} />
                </div>
                <div className={styles.modalFooter}>
                    <button onClick={onClose} className={styles.modalFooterButton}>
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
