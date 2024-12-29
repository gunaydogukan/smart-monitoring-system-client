// src/components/Modal.js
import React from 'react';
import ChartPage from '../pages/ChartPage'; // ChartPage bileşenini içe aktar

const Modal = ({ isOpen, onClose, sensor }) => {
    if (!isOpen) return null; // Modal kapalıysa hiçbir şey render etme
    console.log(sensor);

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h2 style={styles.title}>
                        {sensor ? `${sensor.name} - Grafiği` : 'Grafik'}
                    </h2>

                    <button onClick={onClose} style={styles.closeButton}>✖</button>
                </div>
                <div style={styles.chartContainer}>
                    <ChartPage sensor={sensor} />
                </div>
                <div style={styles.footer}>
                    <button onClick={onClose} style={styles.footerButton}>Kapat</button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Koyu arka plan
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999, // Diğer içeriklerin üstünde
    },
    modal: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff', // Beyaz arka plan
        borderRadius: '10px',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '80vh',
        overflowY: 'auto',
        padding: '20px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid #f0f0f0',
        paddingBottom: '10px',
    },
    title: {
        margin: 0,
        fontSize: '1.5rem',
        color: '#333', // Metin rengi
    },
    closeButton: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#f44336',
        fontSize: '1.5rem',
        cursor: 'pointer',
    },
    footer: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '20px',
    },
    footerButton: {
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    chartContainer: {
        flex: 1,
        overflowY: 'auto',
        marginBottom: '20px',
    },
};

export default Modal;
