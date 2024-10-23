import React, { useEffect, useState } from 'react';
import Layout from "../layouts/Layout";
import SensorList from "../components/SensorList";
import { useNavigate } from 'react-router-dom';


export default function PersonalPage() {
    const [personalInfo, setPersonalInfo] = useState(null); // Kullanıcı bilgilerini tutar
    const [sensors, setSensors] = useState([]); // Sensörler başlangıçta boş dizi
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        // Personal'in sensörlerini almak için kullanıcı ID'sini kullanacağız
        const fetchUserSensors = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/user-sensors', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Kullanıcının token'ını al
                    },
                });

                if (!response.ok) throw new Error('Veriler alınamadı!');

                const { personal, sensors } = await response.json(); // Kullanıcı bilgilerini ve sensörleri alıyoruz
                setPersonalInfo(personal); // Kullanıcı bilgileri
                setSensors(sensors); // Sensör verileri
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
        return <p>Veriler yükleniyor...</p>;
    }

    // Hata varsa kullanıcıya hata mesajı göster
    if (error) {
        return <p>{error}</p>;
    }

    const handleMapRedirect = () => {
        navigate('/map', { state: { sensors: sensors } });
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
                <SensorList sensors={sensors}/>
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
