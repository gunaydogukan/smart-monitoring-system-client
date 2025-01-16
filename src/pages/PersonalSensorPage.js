import React, { useEffect, useState } from 'react';
import Layout from "../layouts/Layout";
import SensorList from "../components/SensorList";
import { useNavigate } from 'react-router-dom';
import LoadingScreen from "../components/LoadingScreen";


export default function PersonalPage() {
    const API_URL = process.env.REACT_APP_API_URL;

    const [personalInfo, setPersonalInfo] = useState(null); // Kullanıcı bilgilerini tutar
    const [sensors, setSensors] = useState([]); // Sensörler başlangıçta boş dizi
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sensorTypes, setSensorTypes] = useState({}); // Tip eşleştirmesi için eklenen state

    const navigate = useNavigate();

    useEffect(() => {
        // Personal'in sensörlerini almak için kullanıcı ID'sini kullanacağız
        const fetchUserSensors = async () => {
            try {
                const response = await fetch(`${API_URL}/api/user-sensors`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Kullanıcının token'ını al
                    },
                });

                if (!response.ok) throw new Error('Veriler alınamadı!');

                const { personal, sensors } = await response.json(); // Kullanıcı bilgilerini ve sensörleri alıyoruz
                setPersonalInfo(personal); // Kullanıcı bilgileri
                setSensors(sensors); // Sensör verileri

                const typesResponse = await fetch(`${API_URL}/api/type`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                const typesData = await typesResponse.json();
                const typesMap = typesData.reduce((acc, type) => {
                    acc[type.id] = type.type;
                    return acc;
                }, {});
                setSensorTypes(typesMap);

            } catch (error) {
                setError('Sensör verileri alınırken bir hata oluştu.');
                console.error('Hata:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserSensors();
    }, []);

    // Ekrana yüklenmeden önce yükleme ekranı göster
    if (loading) {
        return <LoadingScreen />;
    }

    // Hata varsa kullanıcıya hata mesajı göster
    if (error) {
        return <p>{error}</p>;
    }

    const handleMapRedirect = () => {
        // Sensörleri sessionStorage'a kaydediyoruz
        sessionStorage.setItem('sensorsForMap', JSON.stringify(sensors));

        // Yeni sekmede /map rotasını açıyoruz
        window.open('/map', '_blank');
    };
    return (
        <Layout>
            <div style={styles.container}>
                {/* Kullanıcının adını ve soyadını gösteriyoruz */}
                <h2>
                    {personalInfo ? `${personalInfo.name} ${personalInfo.lastname} (${personalInfo.companyCode})` : 'Kullanıcı'}'nın
                    Sensör Listesi
                </h2>

                <button onClick={handleMapRedirect} style={{marginTop: '20px', marginBottom: '20px'}}>
                    Haritayı Görüntüle
                </button>

                {/* Sensör listesi */}
                <SensorList
                    sensors={sensors}
                    sensorTypes={sensorTypes}
                />
            </div>
        </Layout>
    );
}

// Stil nesnesi
const styles = {
    container: {
        padding: '20px',
    },
    list: {
        listStyleType: 'none',
        padding: 0,
    },
};
