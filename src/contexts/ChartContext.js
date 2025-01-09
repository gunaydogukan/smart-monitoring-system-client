import React, { createContext, useState, useEffect } from 'react';
import { fetchSensorData } from '../services/dataService';

export const ChartContext = createContext();

export const ChartProvider = ({ sensor, children }) => {
    const [sensorData, setSensorData] = useState([]);
    const [sensorType, setSensorType] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [interval, setInterval] = useState('1 Gün'); // Varsayılan zaman aralığı

    // interval veya sensor değiştiğinde veriyi çek
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const {type,data} = await fetchSensorData(sensor,interval);
                setSensorData(data);
                setSensorType(type);
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
        <ChartContext.Provider value={{ sensorData,sensorType ,loading, error, setInterval,interval }}>
            {children}
        </ChartContext.Provider>
    );
};