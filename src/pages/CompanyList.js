import React, { useState, useEffect } from 'react';
import '../styles/CompanyList.css';
import Layout from "../layouts/Layout";


export default function CompanyList() {
    //const [companies, setCompanies] = useState([]);
    const [count, setCount] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {

        //fetchCompanies();
        fetchCompaniesCount();

    }, []);

    const fetchCompaniesCount = async () => {
        try{
            const response = await fetch('http://localhost:5000/api/companiesCount',{
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if(!response.ok){
                throw new Error('Şirket-Kullanıcı hesabında bir hata oluştu.');
            }
            const data = await  response.json();
            setCount(data); // bir array olarak dönüyor
        } catch (error){

        }
        finally {
            setLoading(false);
        }
    };

/* yorum satırında cunku tek apiden buradaki bilgileride alıyorum.
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

 */

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
                {count.map((item) => (
                    <div key={item.id} className="company-card">
                        <h3>{item.name}</h3>
                        <p>Kod: {item.code}</p>
                        <p>Şehir Plakası: {item.plate}</p>
                        <p>Manager Sayısı: {item.mcount}</p>
                        <p>Personal Sayısı: {item.pcount}</p>
                        <p>Toplam Çalışan Sayısı: {item.total}</p>
                    </div>
                ))}
            </div>
        </div>
</Layout>
    );
}
