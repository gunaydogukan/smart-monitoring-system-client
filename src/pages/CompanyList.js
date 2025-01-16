import React, { useState, useEffect } from 'react';
import '../styles/CompanyList.css';
import Layout from "../layouts/Layout";
import LoadingScreen from "../components/LoadingScreen";

export default function CompanyList() {
    const API_URL = process.env.REACT_APP_API_URL;

    const [count, setCount] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Simulate a 1-second delay
        const timer = setTimeout(() => {
            setLoading(false); // 1 saniye sonra loading durumu false olur
        }, 100);

        fetchCompaniesCount();

        // Cleanup the timer
        return () => clearTimeout(timer);
    }, []);

    const fetchCompaniesCount = async () => {
        try {
            const response = await fetch(`${API_URL}/api/companiesCount`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Şirket-Kullanıcı hesabında bir hata oluştu.');
            }

            const data = await response.json();
            setCount(data); // API yanıtını state'e kaydet
        } catch (error) {
            setError(error.message); // Hata mesajını kaydet
        }
    };

    if (loading) {
        return <LoadingScreen />; // Yüklenme ekranı 1 saniye boyunca gösterilir
    }

    if (error) {
        return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;
    }

    return (
        <Layout>
            <div className="company-list">
                <h2>Kurumlar</h2>
                <div className="company-cards">
                    {count.map((item) => (
                        <div key={item.id} className="company-card">
                            <h3>{item.name}</h3>
                            <p>Kod: {item.code}</p>
                            <p>Şehir Plakası: {item.plate}</p>
                            <p>Yönetici Sayısı: {item.mcount}</p>
                            <p>Personel Sayısı: {item.pcount}</p>
                            <p>Toplam Çalışan Sayısı: {item.total}</p>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
