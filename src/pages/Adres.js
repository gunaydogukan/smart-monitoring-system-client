import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const App = () => {
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [neighborhoods, setNeighborhoods] = useState([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState('');
    const [selectedDistrictId, setSelectedDistrictId] = useState('');
    const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState('');
    const [village, setvillage] = useState('');

    const navigate = useNavigate();


    // İller
    useEffect(() => {
        fetch('/api/v1/provinces')
            .then((response) => response.json())
            .then((data) => setProvinces(data))
            .catch((error) => console.error('İller çekilirken hata:', error));
    }, []);

    //ilçe
    useEffect(() => {
        if (selectedProvinceId) {
            fetch(`/api/v1/districts?provinceId=${selectedProvinceId}`)
                .then((response) => response.json())
                .then((data) => setDistricts(data))
                .catch((error) => console.error('İlçeler çekilirken hata:', error));
        }
    }, [selectedProvinceId]);

    //90697
    // Mahalleleri çekme
    useEffect(() => {
        if (selectedDistrictId) {
            fetch(`/api/v1/neighborhoods?districtId=${selectedDistrictId}`)
                .then((response) => response.json())
                .then((data) => setNeighborhoods(data))
                .catch((error) => console.error('Mahalleler çekilirken hata:', error));
        }
    }, [selectedDistrictId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/next', {
            state: { selectedProvinceId, selectedDistrictId, selectedNeighborhoodId, customInput },
        });
    };

    return (
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

                <div style={{marginTop: '10px'}}>
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

                <div style={{marginTop: '10px'}}>
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

                <div style={{marginTop: '10px'}}>
                    <label>Özel Not: </label>
                    <input
                        type="text"
                        value={village}
                        onChange={(e) => setvillage(e.target.value)}
                        placeholder="Buraya özel notunuzu yazın"
                    />
                </div>

                <button type="submit" style={{marginTop: '20px'}}>
                    İleri
                </button>
            </form>
        </div>
    );
};

