// src/contexts/ChartContext.js
import React, { createContext, useState, useEffect } from 'react';
import { fetchSensorData } from '../services/dataService';

export const ChartContext = createContext();

export const ChartProvider = ({ sensor,children }) => {
    const [sensorData, setSensorData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const [interval, setInterval] = useState('1 Gün'); // Varsayılan zaman aralığı


    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchSensorData(sensor);
                console.log('Alınan sensör verisi:', data); // Konsolda veriyi görüntüleyin
                setSensorData(data);
            } catch (error) {
                console.error('Veri yükleme hatası:', error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };
        if (sensor) { // Sadece sensor tanımlıysa yükleme yap
            loadData();
        }
    }, [sensor]); // sensor bağımlılığını ekleyin

    return (
        <ChartContext.Provider value={{ sensorData, loading, error }}>
            {children}
        </ChartContext.Provider>
    );
};