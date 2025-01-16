import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from "../layouts/Layout";
import styles from '../styles/Address.module.css';

export default function Address() {
    const API_URL = process.env.REACT_APP_API_URL;

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
    const [errors, setErrors] = useState({});

    const navigate = useNavigate();

    const filterOptions = (options, searchValue) =>
        options.filter((option) =>
            option.name.toLowerCase().startsWith(searchValue.toLowerCase())
        );

    const validateField = (name, value) => {
        let error = '';
        if (name === 'village' && value.trim() && !/^[a-zA-ZğüşöçİĞÜŞÖÇ\s]+$/.test(value)) {
            error = 'Köy adı yalnızca harfler ve boşluk içerebilir.';
        }
        if (name === 'searchProvince' && value.trim() && !/^[a-zA-ZğüşöçİĞÜŞÖÇ\s]+$/.test(value)) {
            error = 'İl adı yalnızca harfler ve boşluk içerebilir.';
        }
        if (name === 'searchDistrict' && value.trim() && !/^[a-zA-ZğüşöçİĞÜŞÖÇ\s]+$/.test(value)) {
            error = 'İlçe adı yalnızca harfler ve boşluk içerebilir.';
        }
        if (name === 'searchNeighborhood' && value.trim() && !/^[a-zA-ZğüşöçİĞÜŞÖÇ\s]+$/.test(value)) {
            error = 'Mahalle adı yalnızca harfler ve boşluk içerebilir.';
        }
        setErrors((prev) => ({ ...prev, [name]: error }));
        return error === '';
    };

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

    const handleSelectChange = (setId, setSearch, list, id) => {
        setId(id);
        const selectedItem = list.find((item) => item.id === parseInt(id));
        setSearch(selectedItem ? selectedItem.name : '');
    };

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        const addressData = {
            plate: parseInt(selectedProvinceId),
            city: searchProvince,
            districts: [
                {
                    district: searchDistrict,
                    neighborhoods: selectedNeighborhoodId ? [
                        {
                            neighborhood: searchNeighborhood,
                            villages: [village],
                        },
                    ] : [],
                    villages: selectedNeighborhoodId ? [] : [village],
                },
            ],
        };

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/address`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(addressData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Sunucu hatası');
            }

            const result = await response.json();
            navigate('/add-sensor', { state: { villageId: result.villageId, villageName: village } });
        } catch (error) {
            console.error('Adres ekleme hatası:', error);
        }
    }, [selectedProvinceId, searchProvince, searchDistrict, searchNeighborhood, village, navigate]);

    return (
        <Layout>
            <div className={styles.contentContainer}>


            <div className={styles.addressContainer}>
                <h1>Adres Bilgisi</h1>
                <form onSubmit={handleSubmit}>
                    <div className={styles['form-group']}>
                        <label>İl: </label>
                        <input
                            type="text"
                            value={searchProvince}
                            onChange={(e) => {
                                setSearchProvince(e.target.value);
                                validateField('searchProvince', e.target.value);
                            }}
                            placeholder="İl Ara"
                        />
                        {errors.searchProvince && <p className={styles.error}>{errors.searchProvince}</p>}
                        <select
                            value={selectedProvinceId}
                            onChange={(e) =>
                                handleSelectChange(
                                    setSelectedProvinceId,
                                    setSearchProvince,
                                    provinces,
                                    e.target.value
                                )
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

                    <div className={styles['form-group']}>
                        <label>İlçe: </label>
                        <input
                            type="text"
                            value={searchDistrict}
                            onChange={(e) => {
                                setSearchDistrict(e.target.value);
                                validateField('searchDistrict', e.target.value);
                            }}
                            placeholder="İlçe Ara"
                        />
                        {errors.searchDistrict && <p className={styles.error}>{errors.searchDistrict}</p>}
                        <select
                            value={selectedDistrictId}
                            onChange={(e) =>
                                handleSelectChange(
                                    setSelectedDistrictId,
                                    setSearchDistrict,
                                    districts,
                                    e.target.value
                                )
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

                    <div className={styles['form-group']}>
                        <label>Mahalle: </label>
                        <input
                            type="text"
                            value={searchNeighborhood}
                            onChange={(e) => {
                                setSearchNeighborhood(e.target.value);
                                validateField('searchNeighborhood', e.target.value);
                            }}
                            placeholder="Mahalle Ara"
                        />
                        {errors.searchNeighborhood && (
                            <p className={styles.error}>{errors.searchNeighborhood}</p>
                        )}
                        <select
                            value={selectedNeighborhoodId}
                            onChange={(e) =>
                                handleSelectChange(
                                    setSelectedNeighborhoodId,
                                    setSearchNeighborhood,
                                    neighborhoods,
                                    e.target.value
                                )
                            }
                        >
                            <option value="">Mahalle Seç</option>
                            {filteredNeighborhoods.map((neighborhood) => (
                                <option key={neighborhood.id} value={neighborhood.id}>
                                    {neighborhood.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles['form-group']}>
                        <label>Köy: </label>
                        <input
                            type="text"
                            value={village}
                            onChange={(e) => {
                                setVillage(e.target.value);
                                validateField('village', e.target.value);
                            }}
                            placeholder="Buraya özel notunuzu yazın"
                        />
                        {errors.village && <p className={styles.error}>{errors.village}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={
                            !selectedProvinceId ||
                            !selectedDistrictId ||
                            !village.trim()
                        }
                    >
                        İleri
                    </button>
                </form>
            </div>
            </div>
        </Layout>
    );
}
