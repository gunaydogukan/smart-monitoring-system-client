// src/components/Modal.js
import React from 'react';
import styles from '../styles/MessageModal.module.css';

export default function MessageModal({ isOpen, onClose, children }) {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                {children}
                <button className={styles.closeButton} onClick={onClose}>
                    Kapat
                </button>
            </div>
        </div>
    );
}
