import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from "../layouts/Layout";

export default function SensorForm() {
    const location = useLocation();
    const { villageId, villageName } = location.state || {};

    const [datacode, setDatacode] = useState('');
    const [name, setName] = useState('');
    const [lat, setLat] = useState('');
    const [lng, setLng] = useState('');
    const [def, setDef] = useState('');
    const [typeId, setTypeId] = useState('');
    const [companyCode, setCompanyCode] = useState('');
    const [managerId, setManagerId] = useState('');
    const [types, setTypes] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [managers, setManagers] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Backend'den verileri alma
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' // JSON content type ekledik
                };

                const urls = [
                    'http://localhost:5000/api/type',
                    'http://localhost:5000/api/companies',
                    'http://localhost:5000/api/users'
                ];

                // Promise.all ile tüm istekleri paralel olarak başlatıyoruz
                const responses = await Promise.all(
                    urls.map((url) => fetch(url, { headers }))
                );
                console.log(responses);
                // Her bir isteğin durumunu kontrol et
                responses.forEach((response) => {
                    if (!response.ok) {
                        throw new Error('Veriler alınırken hata oluştu!');
                    }
                });

                // Tek seferde tüm json body'leri okuyalım
                const [typesData, companiesData, usersData] = await Promise.all(
                    responses.map((response) => response.json())
                );

                setTypes(typesData);
                setCompanies(companiesData);

                // Sadece 'manager' rolündeki kullanıcıları filtrele
                const managerList = usersData.filter((user) => user.role === 'manager');
                setManagers(managerList);

            } catch (error) {
                console.error('Veri alınırken hata:', error);
                setError('Veri alınırken hata oluştu. Lütfen tekrar deneyin.');
            }
        };

        fetchData();
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:5000/api/sensors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    datacode,
                    name,
                    lat: parseFloat(lat),
                    lng: parseFloat(lng),
                    def,
                    type_id: parseInt(typeId),
                    village_id: parseInt(villageId),
                    company_code: companyCode,
                    manager_id: parseInt(managerId),
                }),
            });

            if (!response.ok) {
                const { message } = await response.json();
                setError(message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
                return;
            }

            console.log('Sensör başarıyla eklendi');
            navigate('/sensors');
        } catch (error) {
            console.error('Sensör eklenirken hata:', error);
            setError('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    return (
        <Layout>
            <div style={{ padding: '20px' }}>
                <h1>Yeni Sensör Ekle</h1>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Company: </label>
                        <select
                            value={companyCode}
                            onChange={(e) => setCompanyCode(e.target.value)}
                            required
                        >
                            <option value="">Şirket Seç</option>
                            {companies.map((company) => (
                                <option key={company.id} value={company.code}>
                                    {company.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>Manager: </label>
                        <select
                            value={managerId}
                            onChange={(e) => setManagerId(e.target.value)}
                            required
                        >
                            <option value="">Yönetici Seç</option>
                            {managers.map((manager) => (
                                <option key={manager.id} value={manager.id}>
                                    {manager.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>Data Kodu: </label>
                        <input
                            type="text"
                            value={datacode}
                            onChange={(e) => setDatacode(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label>İsim: </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label>Lat (Enlem): </label>
                        <input
                            type="number"
                            value={lat}
                            onChange={(e) => setLat(e.target.value)}
                            step="any"
                            required
                        />
                    </div>

                    <div>
                        <label>Lng (Boylam): </label>
                        <input
                            type="number"
                            value={lng}
                            onChange={(e) => setLng(e.target.value)}
                            step="any"
                            required
                        />
                    </div>

                    <div>
                        <label>Açıklama (Opsiyonel): </label>
                        <textarea
                            value={def}
                            onChange={(e) => setDef(e.target.value)}
                        />
                    </div>

                    <div>
                        <label>Tip: </label>
                        <select
                            value={typeId}
                            onChange={(e) => setTypeId(e.target.value)}
                            required
                        >
                            <option value="">Tip Seç</option>
                            {types.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>Köy: </label>
                        <input type="text" value={villageName} readOnly />
                    </div>

                    {error && <p style={{ color: 'red' }}>{error}</p>}

                    <button type="submit" style={{ marginTop: '20px' }}>
                        Ekle
                    </button>
                </form>
            </div>
        </Layout>
    );
}