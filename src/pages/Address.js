import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from "../layouts/Layout";

export default function Address() {
    const [provinces, setProvinces] = useState([]);
    const [filteredProvinces, setFilteredProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [filteredDistricts, setFilteredDistricts] = useState([]);
    const [neighborhoods, setNeighborhoods] = useState([]);
    const [filteredNeighborhoods, setFilteredNeighborhoods] = useState([]);

    const [searchProvince, setSearchProvince] = useState('');
    const [searchDistrict, setSearchDistrict] = useState('');
    const [searchNeighborhood, setSearchNeighborhood] = useState('');

    const [selectedProvinceId, setSelectedProvinceId] = useState('');
    const [selectedDistrictId, setSelectedDistrictId] = useState('');
    const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState('');
    const [village, setVillage] = useState('');

    const navigate = useNavigate();

    const isFormValid = useCallback(() => {
        return (
            selectedProvinceId &&
            searchProvince &&
            selectedDistrictId &&
            searchDistrict &&
            selectedNeighborhoodId &&
            searchNeighborhood &&
            village.trim() !== ''
        );
    }, [
        selectedProvinceId,
        searchProvince,
        selectedDistrictId,
        searchDistrict,
        selectedNeighborhoodId,
        searchNeighborhood,
        village,
    ]);

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await fetch('http://turkiyeapi.dev/api/v1/provinces');
                const data = await response.json();
                setProvinces(data.data || []);
                setFilteredProvinces(data.data || []);
            } catch (error) {
                console.error('İller çekilirken hata:', error);
            }
        };
        fetchProvinces();
    }, []);

    useEffect(() => {
        if (selectedProvinceId) {
            const fetchDistricts = async () => {
                try {
                    const response = await fetch(
                        `http://turkiyeapi.dev/api/v1/districts?provinceId=${selectedProvinceId}`
                    );
                    const data = await response.json();
                    setDistricts(data.data || []);
                    setFilteredDistricts(data.data || []);
                } catch (error) {
                    console.error('İlçeler çekilirken hata:', error);
                }
            };
            fetchDistricts();
        }
    }, [selectedProvinceId]);

    useEffect(() => {
        if (selectedDistrictId) {
            const fetchNeighborhoods = async () => {
                try {
                    const response = await fetch(
                        `http://turkiyeapi.dev/api/v1/neighborhoods?districtId=${selectedDistrictId}`
                    );
                    const data = await response.json();
                    setNeighborhoods(data.data || []);
                    setFilteredNeighborhoods(data.data || []);
                } catch (error) {
                    console.error('Mahalleler çekilirken hata:', error);
                }
            };
            fetchNeighborhoods();
        }
    }, [selectedDistrictId]);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            const addressData = {
                plate: parseInt(selectedProvinceId),
                city: searchProvince,
                districts: [
                    {
                        district: searchDistrict,
                        neighborhoods: [
                            {
                                neighborhood: searchNeighborhood,
                                villages: [village],
                            },
                        ],
                    },
                ],
            };

            try {
                const token = localStorage.getItem('token');
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

                console.log('Adres başarıyla eklendi');
                navigate('/next');
            } catch (error) {
                console.error('Adres ekleme hatası:', error);
            }
        },
        [selectedProvinceId, searchProvince, selectedDistrictId, searchDistrict, selectedNeighborhoodId, searchNeighborhood, village, navigate]
    );

    const handleSelect = (setter, setSearchValue, options, selectedId) => {
        const selectedOption = options.find((option) => option.id === parseInt(selectedId));
        setter(selectedId);
        setSearchValue(selectedOption ? selectedOption.name : '');
    };

    return (
        <Layout>
            <div style={{ padding: '20px' }}>
                <h1>Adres Bilgisi</h1>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>İl: </label>
                        <input
                            type="text"
                            value={searchProvince}
                            onChange={(e) => setSearchProvince(e.target.value)}
                            placeholder="İl Ara"
                        />
                        <select
                            value={selectedProvinceId}
                            onChange={(e) =>
                                handleSelect(setSelectedProvinceId, setSearchProvince, provinces, e.target.value)
                            }
                            required
                        >
                            <option value="">İl Seç</option>
                            {filteredProvinces.map((province) => (
                                <option key={province.id} value={province.id}>
                                    {province.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginTop: '10px' }}>
                        <label>İlçe: </label>
                        <input
                            type="text"
                            value={searchDistrict}
                            onChange={(e) => setSearchDistrict(e.target.value)}
                            placeholder="İlçe Ara"
                            disabled={!selectedProvinceId}
                        />
                        <select
                            value={selectedDistrictId}
                            onChange={(e) =>
                                handleSelect(setSelectedDistrictId, setSearchDistrict, districts, e.target.value)
                            }
                            required
                        >
                            <option value="">İlçe Seç</option>
                            {filteredDistricts.map((district) => (
                                <option key={district.id} value={district.id}>
                                    {district.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginTop: '10px' }}>
                        <label>Mahalle: </label>
                        <input
                            type="text"
                            value={searchNeighborhood}
                            onChange={(e) => setSearchNeighborhood(e.target.value)}
                            placeholder="Mahalle Ara"
                            disabled={!selectedDistrictId}
                        />
                        <select
                            value={selectedNeighborhoodId}
                            onChange={(e) =>
                                handleSelect(setSelectedNeighborhoodId, setSearchNeighborhood, neighborhoods, e.target.value)
                            }
                            required
                        >
                            <option value="">Mahalle Seç</option>
                            {filteredNeighborhoods.map((neighborhood) => (
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

                    <button type="submit" style={{ marginTop: '20px' }} disabled={!isFormValid()}>
                        İleri
                    </button>
                </form>
            </div>
        </Layout>
    );
}
