import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Kullanıcının rolünü almak için
import SensorIPControl from '../components/SensorIPControl';
import { sensorIpServices } from '../services/sensorService';
import Layout from "../layouts/Layout";
import LoadingScreen from "../components/LoadingScreen";
export default function RoleBasedRedirect() {
    const { user,userRole } = useAuth(); // Kullanıcı bilgilerini al
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                if (user) {
                    const fetchedData = await sensorIpServices(userRole.role, user.id);
                    setData(fetchedData);
                }
            } catch (error) {
                console.error('Veri çekilirken hata oluştu:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [user]);

    if (loading) {
        return <LoadingScreen />;
    }

    if (!user || !data) {
        return <p>Kullanıcı bilgisi veya veriler bulunamadı.</p>;
    }

    return (
        <Layout>
            <SensorIPControl
                role={userRole.role}
                companies={data.companies}
                managers={data.managers}
                personals={data.personals}
                sensors={data.sensors}
                sensorOwners={data.sensorOwners}
                ipLogs={data.ipLogs.data}
                types={data.types}
            />
        </Layout>
    );
}
