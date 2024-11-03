import React, { createContext, useState, useEffect } from 'react';
import { fetchSensorData } from '../services/dataService';

export const ChartContext = createContext();

export const ChartProvider = ({ sensor, children }) => {
    const [sensorData, setSensorData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [interval, setInterval] = useState('dakikalık'); // Varsayılan zaman aralığı

    // interval veya sensor değiştiğinde veriyi çek
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await fetchSensorData(sensor, interval);
                setSensorData(data);
                setError(null);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        if (sensor && interval) {
            fetchData();
        }
    }, [sensor, interval]);

    return (
        <ChartContext.Provider value={{ sensorData, loading, error, setInterval,interval }}>
            {children}
        </ChartContext.Provider>
    );
};
