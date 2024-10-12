import React, { useState, useEffect, useCallback } from 'react';
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
    const [cityName, setCityName] = useState('');
    const [districtName, setDistrictName] = useState('');

    const navigate = useNavigate();

    // İller (Provinces) Verisini Getirme
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await fetch('http://turkiyeapi.dev/api/v1/provinces');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setProvinces(data.data || []);
            } catch (error) {
                console.error('İller çekilirken hata:', error);
            }
        };
        fetchProvinces();
    }, []);

    // İlçeleri (Districts) Getirme
    useEffect(() => {
        if (selectedProvinceId) {
            const province = provinces.find(p => p.id === parseInt(selectedProvinceId));
            setCityName(province ? province.name : '');

            const fetchDistricts = async () => {
                try {
                    const response = await fetch(
                        `http://turkiyeapi.dev/api/v1/districts?provinceId=${selectedProvinceId}`
                    );
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    setDistricts(data.data || []);
                } catch (error) {
                    console.error('İlçeler çekilirken hata:', error);
                }
            };
            fetchDistricts();
        }
    }, [selectedProvinceId, provinces]);

    // Mahalleleri (Neighborhoods) Getirme
    useEffect(() => {
        if (selectedDistrictId) {
            const district = districts.find(d => d.id === parseInt(selectedDistrictId));
            setDistrictName(district ? district.name : '');

            const fetchNeighborhoods = async () => {
                try {
                    const response = await fetch(
                        `http://turkiyeapi.dev/api/v1/neighborhoods?districtId=${selectedDistrictId}`
                    );
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    setNeighborhoods(data.data || []);
                } catch (error) {
                    console.error('Mahalleler çekilirken hata:', error);
                }
            };
            fetchNeighborhoods();
        }
    }, [selectedDistrictId, districts]);

    // Form Submit İşlemi
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        const neighborhood = neighborhoods.find(n => n.id === parseInt(selectedNeighborhoodId));
        const neighborhoodName = neighborhood ? neighborhood.name : '';

        const addressData = {
            plate: parseInt(selectedProvinceId),
            city: cityName,
            districts: [
                {
                    district: districtName,
                    neighborhoods: [
                        {
                            neighborhood: neighborhoodName,
                            villages: [village],
                        }
                    ],
                }
            ],
        };
        console.log("Gönderilen veri:", addressData);

        try {
            const token = localStorage.getItem('token');
            console.log("Token:", token);
            const response = await fetch('http://localhost:5000/api/address', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(addressData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Adres başarıyla eklendi:', result);

            navigate('/next', {
                state: { selectedProvinceId, selectedDistrictId, selectedNeighborhoodId, village },
            });
        } catch (error) {
            console.error('Adres ekleme hatası:', error);
        }
    }, [cityName, districtName, navigate, neighborhoods, selectedDistrictId, selectedNeighborhoodId, selectedProvinceId, village]);

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
