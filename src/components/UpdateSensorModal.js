import React, { useState, useEffect, useCallback } from 'react';
import styles from '../styles/UpdateSensorModal.module.css';

export default function UpdateSensorModal({ sensor, isOpen, onClose, onUpdate }) {
    const [formData, setFormData] = useState({
        name: '',
        lat: '',
        lng: '',
        def: '',
        company_code: '',
        village: '',
    });

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [neighborhoods, setNeighborhoods] = useState([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState('');
    const [selectedDistrictId, setSelectedDistrictId] = useState('');
    const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState('');
    const [village, setVillage] = useState('');
    const [message, setMessage] = useState(null); // Başarı veya hata mesajı için state
    const [messageType, setMessageType] = useState(null); // "success" veya "error"

    useEffect(() => {
        if (sensor) {
            setFormData({
                name: sensor.name || '',
                lat: sensor.lat || '',
                lng: sensor.lng || '',
                def: sensor.def || '',
                company_code: sensor.company_code || '',
                village: sensor.village || '',
            });
        }
    }, [sensor]);

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await fetch('http://turkiyeapi.dev/api/v1/provinces');
                const data = await response.json();
                setProvinces(data.data || []);
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
                } catch (error) {
                    console.error('Mahalleler çekilirken hata:', error);
                }
            };
            fetchNeighborhoods();
        }
    }, [selectedDistrictId]);

    const handleSelectChange = (setId, id) => {
        setId(id);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();

            let newVillageId = sensor.village_id;

            if (selectedProvinceId || selectedDistrictId || selectedNeighborhoodId || village) {
                const addressData = {
                    plate: parseInt(selectedProvinceId),
                    city: provinces.find((p) => p.id === parseInt(selectedProvinceId))?.name || '',
                    districts: [
                        {
                            district: districts.find((d) => d.id === parseInt(selectedDistrictId))?.name || '',
                            neighborhoods: selectedNeighborhoodId
                                ? [
                                    {
                                        neighborhood: neighborhoods.find(
                                            (n) => n.id === parseInt(selectedNeighborhoodId)
                                        )?.name || '',
                                        villages: [village],
                                    },
                                ]
                                : [],
                            villages: selectedNeighborhoodId ? [] : [village],
                        },
                    ],
                };

                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch('http://localhost:5000/api/address', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(addressData),
                    });

                    if (!response.ok) {
                        throw new Error('Adres eklenemedi.');
                    }

                    const result = await response.json();
                    newVillageId = result.villageId;

                    setMessage('Adres başarıyla kaydedildi!');
                    setMessageType('success');
                } catch (error) {
                    console.error('Adres eklenirken hata:', error);
                    setMessage('Adres eklenemedi. Lütfen tekrar deneyin.');
                    setMessageType('error');
                    return;
                }
            }

            try {
                await onUpdate(sensor.id, {
                    ...formData,
                    village_id: newVillageId,
                });

                setMessage('Sensör başarıyla güncellendi!');
                setMessageType('success');
                setTimeout(onClose, 3000); // Modalı kapat
            } catch (error) {
                console.error('Sensör güncellenirken hata:', error);
                setMessage('Sensör güncellenemedi. Lütfen tekrar deneyin.');
                setMessageType('error');
            }
        },
        [sensor, formData, selectedProvinceId, selectedDistrictId, selectedNeighborhoodId, village, onUpdate, provinces, districts, neighborhoods, onClose]
    );

    if (!isOpen) return null;

    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <h2>Sensör Güncelle</h2>
                <p className={styles.infoMessage}>
                    Değiştirmediğiniz alanlar mevcut değerleriyle kalacaktır.
                </p>

                {message && (
                    <div
                        className={`${styles.message} ${
                            messageType === 'success' ? styles.success : styles.error
                        }`}
                    >
                        {message}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Sensör Adı</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Latitude</label>
                        <input
                            type="number"
                            name="lat"
                            value={formData.lat}
                            onChange={handleChange}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Longitude</label>
                        <input
                            type="number"
                            name="lng"
                            value={formData.lng}
                            onChange={handleChange}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Açıklama</label>
                        <textarea
                            name="def"
                            value={formData.def}
                            onChange={handleChange}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Şirket Kodu</label>
                        <input
                            type="text"
                            name="company_code"
                            value={formData.company_code}
                            onChange={handleChange}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>İl</label>
                        <select
                            value={selectedProvinceId}
                            onChange={(e) => handleSelectChange(setSelectedProvinceId, e.target.value)}
                        >
                            <option value="">İl Seç</option>
                            {provinces.map((province) => (
                                <option key={province.id} value={province.id}>
                                    {province.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>İlçe</label>
                        <select
                            value={selectedDistrictId}
                            onChange={(e) => handleSelectChange(setSelectedDistrictId, e.target.value)}
                        >
                            <option value="">İlçe Seç</option>
                            {districts.map((district) => (
                                <option key={district.id} value={district.id}>
                                    {district.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Mahalle</label>
                        <select
                            value={selectedNeighborhoodId}
                            onChange={(e) => handleSelectChange(setSelectedNeighborhoodId, e.target.value)}
                        >
                            <option value="">Mahalle Seç</option>
                            {neighborhoods.map((neighborhood) => (
                                <option key={neighborhood.id} value={neighborhood.id}>
                                    {neighborhood.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Köy</label>
                        <input
                            type="text"
                            name="village"
                            value={village}
                            onChange={(e) => setVillage(e.target.value)}
                        />
                    </div>
                    <div className={styles.buttons}>
                        <button type="button" onClick={onClose}>
                            Kapat
                        </button>
                        <button type="submit">Güncelle</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
