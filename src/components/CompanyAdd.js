import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from "../layouts/Layout";
import "../styles/CompanyAdd.css";
import LoadingScreen from "./LoadingScreen"; // CSS dosyasını içe aktarıyoruz

export default function CompanyAdd() {
    const API_URL = process.env.REACT_APP_API_URL;

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        plate: '',
        city: '',
    });

    const [provinces, setProvinces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await fetch('https://turkiyeapi.dev/api/v1/provinces');
                const data = await response.json();
                setProvinces(data.data || []);
            } catch (error) {
                console.error('İller çekilirken hata:', error);
                setError('Şehirler yüklenirken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        };
        fetchProvinces();
    }, []);

    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'name':
                if (!/^[a-zA-ZğüşöçİĞÜŞÖÇ\s]+$/.test(value)) {
                    error = 'Kurum adı sadece harflerden ve boşluklardan oluşabilir.';
                }
                break;
            case 'code':
                if (!/^[A-Z0-9]{3,10}$/.test(value)) {
                    error = 'Kurum kodu 3-10 karakter uzunluğunda, harf ve rakamlardan oluşmalıdır.';
                }
                break;
            case 'plate':
                if (!/^\d+$/.test(value)) {
                    error = 'Şehir plaka kodu yalnızca rakamlardan oluşmalıdır.';
                }
                break;
            default:
                break;
        }
        setErrors((prev) => ({ ...prev, [name]: error }));
        return error === '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        validateField(name, value);
    };

    const handleCityChange = (e) => {
        const selectedCity = provinces.find(province => province.id === parseInt(e.target.value));
        setFormData({
            ...formData,
            plate: selectedCity.id,
            city: selectedCity.name,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let isValid = true;
        Object.keys(formData).forEach((key) => {
            if (!validateField(key, formData[key])) {
                isValid = false;
            }
        });

        if (!isValid) {
            alert('Lütfen tüm alanları doğru doldurun.');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_URL}/api/companies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok) {
                alert('Kurum başarıyla eklendi!');
                navigate('/dashboard');
            } else {
                throw new Error(data.error || 'Kurum ekleme başarısız.');
            }
        } catch (error) {
            console.error('Kurum eklenirken hata:', error);
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <Layout>
            <div className="containerCompanyAdd">
            <form onSubmit={handleSubmit} className="formCompanyAdd">
                <h2 className="formTitleCompanyAdd">Kurum Ekle</h2>
                {error && <p className="errorCompanyAdd">{error}</p>}
                <input
                    type="text"
                    name="name"
                    placeholder="Kurum Adı"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="inputCompanyAdd"
                />
                {errors.name && <p className="CompanyAdd">{errors.name}</p>}
                <input
                    type="text"
                    name="code"
                    placeholder="Kurum Kodu"
                    value={formData.code}
                    onChange={handleChange}
                    required
                    className="inputCompanyAdd"
                />
                {errors.code && <p className="errorCompanyAdd">{errors.code}</p>}

                <select
                    name="plate"
                    value={formData.plate}
                    onChange={handleCityChange}
                    required
                    className="inputCompanyAdd"
                >
                    <option value="">Şehir Seçin</option>
                    {provinces.map((province) => (
                        <option key={province.id} value={province.id}>
                            {province.name} ({province.id})
                        </option>
                    ))}
                </select>
                {errors.plate && <p className="errorCompanyAdd">{errors.plate}</p>}

                <button type="submit" className="buttonCompanyAdd" disabled={isSubmitting}>
                    {isSubmitting ? 'Ekleniyor...' : 'Kurum Ekle'}
                </button>
            </form>
            </div>
        </Layout>
    );
}
