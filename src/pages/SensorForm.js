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
        return (
            companyCode &&
            managerId &&
            datacode &&
            name &&
            lat &&
            lng &&
            typeId
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid()) {
            setError('Lütfen tüm zorunlu alanları doldurun.');
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
                        <label>Company:</label>
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
                        <label>Manager:</label>
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
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>İsim:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Lat (Enlem):</label>
                        <input
                            type="number"
                            value={lat}
                            onChange={(e) => setLat(e.target.value)}
                            step="any"
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Lng (Boylam):</label>
                        <input
                            type="number"
                            value={lng}
                            onChange={(e) => setLng(e.target.value)}
                            step="any"
                            required
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
                            {types.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.type}
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
