import React, { useState, useEffect } from 'react';
import '../styles/CompanyList.css';
import Layout from "../layouts/Layout";


export default function CompanyList() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/companies', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Şirketler getirilemedi.');
                }

                const data = await response.json();
                setCompanies(data);
            } catch (error) {
                setError('Şirketler yüklenirken bir hata oluştu.');
                console.error('Şirketler yüklenirken hata:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    if (loading) {
        return <div>Yükleniyor...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (


<Layout>


        <div className="company-list">
            <h2>Kurumlar</h2>
            <div className="company-cards">
                {companies.map((company) => (
                    <div key={company.id} className="company-card">
                        <h3>{company.name}</h3>
                        <p>Kod: {company.code}</p>
                        <p>Şehir Plakası: {company.plate}</p>
                    </div>
                ))}
            </div>
        </div>
</Layout>
    );
}
