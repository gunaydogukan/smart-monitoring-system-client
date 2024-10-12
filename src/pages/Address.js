import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from "../layouts/Layout";

export default function Address() {
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [neighborhoods, setNeighborhoods] = useState([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState('');
    const [selectedDistrictId, setSelectedDistrictId] = useState('');
    const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState('');
    const [village, setVillage] = useState('');

    const navigate = useNavigate();

    // İller (Provinces) Verisini Getirme
    useEffect(() => {
        fetch('http://turkiyeapi.dev/api/v1/provinces')
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                if (Array.isArray(data.data)) {
                    setProvinces(data.data); // Veriyi doğru şekilde ayarlıyoruz.
                } else {
                    console.error('Beklenen formatta veri gelmedi.');
                }
            })
            .catch((error) => console.error('İller çekilirken hata:', error));
    }, []);

    // İlçeleri (Districts) Getirme
    useEffect(() => {
        if (selectedProvinceId) {
            fetch(`http://turkiyeapi.dev/api/v1/districts?provinceId=${selectedProvinceId}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    if (Array.isArray(data.data)) {
                        setDistricts(data.data);
                    } else {
                        console.error('Beklenen formatta veri gelmedi.');
                    }
                })
                .catch((error) => console.error('İlçeler çekilirken hata:', error));
        }
    }, [selectedProvinceId]);

    // Mahalleleri (Neighborhoods) Getirme
    useEffect(() => {
        if (selectedDistrictId) {
            fetch(`http://turkiyeapi.dev/api/v1/neighborhoods?districtId=${selectedDistrictId}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    if (Array.isArray(data.data)) {
                        setNeighborhoods(data.data);
                    } else {
                        console.error('Beklenen formatta veri gelmedi.');
                    }
                })
                .catch((error) => console.error('Mahalleler çekilirken hata:', error));
        }
    }, [selectedDistrictId]);

    // Form Submit İşlemi
    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/next', {
            state: { selectedProvinceId, selectedDistrictId, selectedNeighborhoodId, village },
        });
    };

    return (
        <Layout>
            <div style={{ padding: '20px' }}>
                <h1>Adres Bilgisi</h1>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>İl: </label>
                        <select
                            value={selectedProvinceId}
                            onChange={(e) => setSelectedProvinceId(e.target.value)}
                            required
                        >
                            <option value="">İl Seç</option>
                            {provinces.map((province) => (
                                <option key={province.id} value={province.id}>
                                    {province.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginTop: '10px' }}>
                        <label>İlçe: </label>
                        <select
                            value={selectedDistrictId}
                            onChange={(e) => setSelectedDistrictId(e.target.value)}
                            required
                            disabled={!selectedProvinceId}
                        >
                            <option value="">İlçe Seç</option>
                            {districts.map((district) => (
                                <option key={district.id} value={district.id}>
                                    {district.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginTop: '10px' }}>
                        <label>Mahalle: </label>
                        <select
                            value={selectedNeighborhoodId}
                            onChange={(e) => setSelectedNeighborhoodId(e.target.value)}
                            required
                            disabled={!selectedDistrictId}
                        >
                            <option value="">Mahalle Seç</option>
                            {neighborhoods.map((neighborhood) => (
                                <option key={neighborhood.id} value={neighborhood.id}>
                                    {neighborhood.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginTop: '10px' }}>
                        <label>Köy: </label>
                        <input
                            type="text"
                            value={village}
                            onChange={(e) => setVillage(e.target.value)}
                            placeholder="Buraya özel notunuzu yazın"
                        />
                    </div>

                    <button type="submit" style={{ marginTop: '20px' }}>
                        İleri
                    </button>
                </form>
            </div>
        </Layout>
    );
}
