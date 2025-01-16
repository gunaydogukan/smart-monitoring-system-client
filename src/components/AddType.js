import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from "../layouts/Layout";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from "../styles/AddSensorType.module.css";

export default function AddSensorType() {
    const [sensorType, setSensorType] = useState({
        type: '',
        dataCount: 1,
        dataNames: [''],
    });

    const API_URL = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();
    const location = useLocation();

    const role = location.state?.role;

    useEffect(() => {
        if (role !== 'administrator') {
            toast.error('Bu işlemi yapmaya yetkiniz yok!');
            setTimeout(() => navigate('/dashboard'), 3000);
        }
    }, [role, navigate]);

    const validateField = (name, value) => {
        let error = "";
        if (name === "type") {
            if (!/^[a-zA-ZğüşöçİĞÜŞÖÇ\s]+$/.test(value)) {
                error = "Sadece harfler ve boşluk kullanılabilir.";
            }
        } else if (name === "dataName") {
            if (!/^[a-zA-Z0-9ğüşöçİĞÜŞÖÇ\s]+$/.test(value)) {
                error = "Sadece harfler, rakamlar ve boşluk kullanılabilir.";
            }
        }
        return error;
    };

    const handleDataCountChange = (e) => {
        const count = parseInt(e.target.value, 10);
        setSensorType((prev) => {
            const dataNames = Array.from({ length: count }, (_, index) =>
                prev.dataNames[index] || ''
            );
            return { ...prev, dataCount: count, dataNames };
        });
    };

    const handleDataNameChange = (e, index) => {
        const { value } = e.target;
        const error = validateField("dataName", value);
        if (error) {
            toast.error(error);
            return;
        }
        const newDataNames = [...sensorType.dataNames];
        newDataNames[index] = value;
        setSensorType((prev) => ({ ...prev, dataNames: newDataNames }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/add-new-type`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(sensorType),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Sensör tipi başarıyla eklendi!');
                setTimeout(() => navigate('/dashboard'), 3000);
            } else {
                toast.error(data.error || 'Bir hata oluştu.');
            }
        } catch (error) {
            console.error('Veri gönderme hatası:', error);
            toast.error('Sunucu hatası. Lütfen tekrar deneyin.');
        }
    };

    if (role !== 'administrator') {
        return <h3>Bu işlemi yapmaya yetkiniz yok.</h3>;
    }

    return (
        <Layout>
            <ToastContainer />
            <div className={styles.containerAddSensorType}>
                <form onSubmit={handleSubmit} className={styles.formAddSensorType}>
                    <h2 className={styles.formTitleAddSensorType}>Sensör Tipi Ekle</h2>

                    <label className={styles.labelAddSensorType}>Tip İsmi:</label>
                    <input
                        type="text"
                        name="type"
                        value={sensorType.type}
                        onChange={(e) => {
                            const error = validateField("type", e.target.value);
                            if (error) {
                                toast.error(error);
                                return;
                            }
                            setSensorType({ ...sensorType, type: e.target.value });
                        }}
                        placeholder="Sensör Tipi"
                        required
                        className={styles.inputAddSensorType}
                    />

                    <label className={styles.labelAddSensorType}>Veri Sayısı:</label>
                    <input
                        type="number"
                        name="dataCount"
                        value={sensorType.dataCount}
                        onChange={handleDataCountChange}
                        min="1"
                        required
                        className={styles.inputAddSensorType}
                    />

                    {sensorType.dataNames.map((dataName, index) => (
                        <div key={index}>
                            <label className={styles.labelAddSensorType}>{`Veri İsmi ${index + 1}:`}</label>
                            <input
                                type="text"
                                value={dataName}
                                onChange={(e) => handleDataNameChange(e, index)}
                                placeholder={`Veri İsmi ${index + 1}`}
                                required
                                className={styles.inputAddSensorType}
                            />
                        </div>
                    ))}

                    <button type="submit" className={styles.buttonAddSensorType}>Ekle</button>
                </form>
            </div>
        </Layout>
    );
}
