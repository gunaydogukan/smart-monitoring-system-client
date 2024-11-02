// src/contexts/ChartContext.js
import React, { createContext, useState, useEffect } from 'react';
import { fetchSensorData } from '../services/dataService';

export const ChartContext = createContext();

export const ChartProvider = ({ children }) => {
    const [sensorData, setSensorData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchSensorData();
                console.log('Alınan sensör verisi:', data); // Konsolda veriyi görüntüleyin
                setSensorData(data);
            } catch (error) {
                console.error('Veri yükleme hatası:', error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <ChartContext.Provider value={{ sensorData, loading, error }}>
            {children}
        </ChartContext.Provider>
    );
};