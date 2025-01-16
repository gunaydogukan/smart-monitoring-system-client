import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from "../layouts/Layout";
import { filterManagersByCompany } from '../services/FilterService';
import styles from '../styles/SensorForm.module.css';
import Modal from '../components/MessageModal';

export default function SensorForm() {
    const API_URL = process.env.REACT_APP_API_URL;

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
    const [allManagers, setAllManagers] = useState([]);
    const [error, setError] = useState('');
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

    const navigate = useNavigate();

    const validateField = (field, value) => {
        let errorMessage = '';

        switch (field) {
            case 'datacode':
                if (!/^[A-Z0-9]{3,10}$/.test(value)) {
                    errorMessage = 'Data kodu 3-10 karakter arasında büyük harf ve rakam içermelidir.';
                }
                break;
            case 'name':
                if (!/^[a-zA-ZğüşöçİĞÜŞÖÇ\s]+$/.test(value)) {
                    errorMessage = 'İsim yalnızca harfler ve boşluk içerebilir.';
                }
                break;
            case 'lat':
            case 'lng':
                if (isNaN(value) || value === '' || value < -90 || value > 90) {
                    errorMessage = 'Geçerli bir enlem veya boylam değeri girin (-90 ile 90 arasında).';
                }
                break;
            default:
                break;
        }

        return errorMessage;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                const urls = [
                    `${API_URL}/api/type`,
                    `${API_URL}/api/companies`,
                    `${API_URL}/api/users`
                ];

                const responses = await Promise.all(
                    urls.map((url) => fetch(url, { headers }))
                );

                responses.forEach((response) => {
                    if (!response.ok) {
                        throw new Error('Veriler alınırken hata oluştu!');
                    }
                });

                const [typesData, companiesData, usersData] = await Promise.all(
                    responses.map((response) => response.json())
                );

                setTypes(typesData);
                setCompanies(companiesData);

                const managerList = usersData.filter((user) => user.role === 'manager');
                setAllManagers(managerList);
                setManagers([]);
            } catch (error) {
                console.error('Veri alınırken hata:', error);
                setError('Veri alınırken hata oluştu. Lütfen tekrar deneyin.');
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const filteredManagers = filterManagersByCompany(allManagers, companyCode);
        setManagers(filteredManagers);
        setManagerId('');
    }, [companyCode, allManagers]);

    const isFormValid = () => {
        const errors = [
            validateField('datacode', datacode),
            validateField('name', name),
            validateField('lat', lat),
            validateField('lng', lng),
        ];
        return errors.every((err) => err === '') && companyCode && managerId && typeId;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid()) {
            setError('Lütfen tüm zorunlu alanları doğru doldurun.');
            setIsErrorModalOpen(true);
            return;
        }

        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_URL}/api/sensors`, {
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
                setIsErrorModalOpen(true);
                return;
            }

            setIsSuccessModalOpen(true);
        } catch (error) {
            console.error('Sensör eklenirken hata:', error);
            setError('Bir hata oluştu. Lütfen tekrar deneyin.');
            setIsErrorModalOpen(true);
        }
    };

    return (
        <Layout>
            <div className={styles.sensorFormContainer}>
                <h1>Yeni Sensör Ekle</h1>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Şirket:</label>
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
                    <div className={styles.formGroup}>
                        <label>Yönetici:</label>
                        <select
                            value={managerId}
                            onChange={(e) => setManagerId(e.target.value)}
                            required
                            disabled={!companyCode}
                        >
                            <option value="">Yönetici Seç</option>
                            {managers.map((manager) => (
                                <option key={manager.id} value={manager.id}>
                                    {manager.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Data Kodu:</label>
                        <input
                            type="text"
                            value={datacode}
                            onChange={(e) => setDatacode(e.target.value)}
                            required
                            onBlur={(e) => setError(validateField('datacode', e.target.value))}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>İsim:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            onBlur={(e) => setError(validateField('name', e.target.value))}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Enlem:</label>
                        <input
                            type="number"
                            value={lat}
                            onChange={(e) => setLat(e.target.value)}
                            required
                            onBlur={(e) => setError(validateField('lat', e.target.value))}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Boylam:</label>
                        <input
                            type="number"
                            value={lng}
                            onChange={(e) => setLng(e.target.value)}
                            required
                            onBlur={(e) => setError(validateField('lng', e.target.value))}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Açıklama (Opsiyonel):</label>
                        <textarea
                            value={def}
                            onChange={(e) => setDef(e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Tip:</label>
                        <select
                            value={typeId}
                            onChange={(e) => setTypeId(e.target.value)}
                            required
                        >
                            <option value="">Tip Seç</option>
                            {types.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.type}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Köy:</label>
                        <input type="text" value={villageName} readOnly />
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                    <button type="submit">Ekle</button>
                </form>

                <Modal isOpen={isSuccessModalOpen} onClose={() => navigate('/sensors')}>
                    <h2>Başarılı!</h2>
                    <p>Yeni sensör başarıyla eklendi.</p>
                </Modal>
                <Modal isOpen={isErrorModalOpen} onClose={() => setIsErrorModalOpen(false)}>
                    <h2>Hata!</h2>
                    <p>{error}</p>
                </Modal>
            </div>
        </Layout>
    );
}
