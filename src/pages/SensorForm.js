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
    const [types, setTypes] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Tipleri backend'den al
    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/type', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setTypes(data);
            } catch (error) {
                console.error('Tipler alınırken hata:', error);
            }
        };

        fetchTypes(); // useEffect içinde çağırıyoruz
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
                    type_id: parseInt(typeId),  // Burada type_id gönderiyoruz
                    village_id: parseInt(villageId),
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
