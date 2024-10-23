import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // useParams ile URL parametrelerini al
import styles from '../styles/Users.module.css';
import Layout from "../layouts/Layout";
import { useTheme } from "../contexts/ThemeContext"; // Tema bağlamını kullan

export default function Users() {
    const [companies, setCompanies] = useState([]); // Şirketler
    const [filteredData, setFilteredData] = useState([]); // Filtrelenmiş manager veya personal
    const [selectedCompany, setSelectedCompany] = useState(''); // Seçilen şirket
    const { type } = useParams(); // URL'den manager mı personal mı çekileceğini al
    const { isDarkMode } = useTheme(); // Tema bağlamından dark mode durumunu al

    useEffect(() => {
        fetchCompanies(); // Şirketleri yükle
        fetchDataByCompany(type); // Seçilen tipe göre veriyi yükle (manager veya personal)
    }, [type]);

    const fetchCompanies = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/companies', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const data = await response.json();
            setCompanies(data || []); // Gelen şirket verilerini ayarla
        } catch (error) {
            console.error('Şirket verisi çekilemedi:', error);
        }
    };

    const fetchDataByCompany = async (type, companyCode = '') => {
        try {
            const url = companyCode
                ? `http://localhost:5000/api/${type}?companyCode=${encodeURIComponent(companyCode)}`
                : `http://localhost:5000/api/${type}`; // managers veya personals çekmek için istek

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Veri çekme hatası');
            }

            const data = await response.json();
            setFilteredData(data || []); // Manager veya Personal verilerini ayarla
        } catch (error) {
            console.error(`${type} verisi çekilemedi:`, error);
        }
    };

    const handleCompanyChange = (e) => {
        const companyCode = e.target.value;
        setSelectedCompany(companyCode);

        if (companyCode) {
            fetchDataByCompany(type, companyCode); // Seçilen şirkete göre manager veya personal getir
        } else {
            fetchDataByCompany(type); // Şirket seçilmediyse tüm manager veya personal'ları getir
        }
    };

    return (
        <Layout>
            <div className={`${styles.container} ${isDarkMode ? styles.dark : ''}`}>
                <h2 className={`${styles.title} ${isDarkMode ? styles.darkTitle : ''}`}>
                    {type === 'managers' ? 'Yöneticiler (Managers)' : 'Personeller (Personals)'}
                </h2>
                <div>
                    <label htmlFor="companySelect" className={styles.label}>Şirket Seçin:</label>
                    <select
                        id="companySelect"
                        value={selectedCompany}
                        onChange={handleCompanyChange}
                        className={`${styles.select} ${isDarkMode ? styles.darkSelect : ''}`}
                    >
                        <option value="">Tüm Şirketler</option>
                        {companies.map(company => (
                            <option key={company.code} value={company.code}>
                                {company.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={`${styles.cardsContainer} ${isDarkMode ? styles.darkCardsContainer : ''}`}>
                    {filteredData.length > 0 ? (
                        filteredData.map(person => (
                            <div key={person.id} className={`${styles.card} ${isDarkMode ? styles.darkCard : ''}`}>
                                <h4 className={`${styles.cardTitle} ${isDarkMode ? styles.darkCardTitle : ''}`}>{person.name}</h4>
                                <p className={`${styles.cardText} ${isDarkMode ? styles.darkCardText : ''}`}>{person.email}</p>
                                <p className={`${styles.cardText} ${isDarkMode ? styles.darkCardText : ''}`}>
                                    Şirket: {person.companyCode}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className={`${styles.message} ${isDarkMode ? styles.darkMessage : ''}`}>
                            Bu şirkete ait {type === 'managers' ? 'yönetici' : 'personel'} yok.
                        </p>
                    )}
                </div>
            </div>
        </Layout>
    );
}
