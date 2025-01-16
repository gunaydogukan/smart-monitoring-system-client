import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from "../layouts/Layout";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/Register.module.css";

export default function Register() {
    const API_URL = process.env.REACT_APP_API_URL;

    const { user, userRole } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        lastname: '',
        email: '',
        password: '',
        phone: '',
        companyCode: '',
        creator_id: '',
    });

    const [errors, setErrors] = useState({});
    const [companies, setCompanies] = useState([]);
    const [managers, setManagers] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const added_role = location.state?.role;
    const activeUseRole = userRole.role;
    const activeUserCompanyCode = userRole.companyCode;

    useEffect(() => {
        if (activeUseRole === 'manager') {
            setSelectedCompany(activeUserCompanyCode);
            setFormData((prev) => ({
                ...prev,
                companyCode: activeUserCompanyCode,
                creator_id: user.id,
            }));
        } else {
            const fetchCompanies = async () => {
                try {
                    const response = await fetch(`${API_URL}/api/companies`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,

                        },
                    });
                    const data = await response.json();
                    setCompanies(data);
                } catch (error) {
                    console.error('Şirketleri çekerken hata:', error);
                }
            };
            fetchCompanies();
        }
    }, [activeUseRole, activeUserCompanyCode, user.id]);

    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'name':
            case 'lastname':
                if (!/^[a-zA-ZğüşöçİĞÜŞÖÇ ]+$/.test(value)) {
                    error = 'Sadece harfler ve boşluk kullanılabilir.';
                }
                break;
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = 'Geçerli bir e-posta adresi girin.';
                }
                break;
            case 'password':
                if (value.length < 6) {
                    error = 'Şifre en az 6 karakter olmalıdır.';
                } else if (!/[A-Z]/.test(value)) {
                    error = 'Şifre en az bir büyük harf içermelidir.';
                } else if (!/[0-9]/.test(value)) {
                    error = 'Şifre en az bir rakam içermelidir.';
                }
                break;
            case 'phone':
                if (!/^\d{10,11}$/.test(value)) {
                    error = 'Telefon numarası 10-11 hane uzunluğunda olmalıdır.';
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

    const handleCompanyChange = async (e) => {
        const companyCode = e.target.value;
        setSelectedCompany(companyCode);
        setFormData((prev) => ({ ...prev, companyCode }));
        if (added_role === 'personal') {
            try {
                const response = await fetch(`${API_URL}/api/users`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,

                    },
                });
                const data = await response.json();
                const filteredManagers = data.filter(
                    (manager) => manager.role === 'manager' && manager.companyCode === companyCode
                );
                setManagers(filteredManagers);
            } catch (error) {
                console.error('Manager listesi alınırken hata:', error);
            }
        } else {
            setManagers([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let valid = true;
        Object.keys(formData).forEach((field) => {
            if (!validateField(field, formData[field])) {
                valid = false;
            }
        });
        if (!valid) {
            toast.error('Lütfen tüm alanları doğru doldurun.');
            return;
        }
        try {
            const payload = { ...formData, role: added_role };
            const response = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (response.ok) {
                toast.success('Kayıt başarılı!', { autoClose: 2500 });
                setTimeout(() => navigate(`/users/${added_role}s`), 3500);
            } else {
                toast.error(data.error || 'Kayıt başarısız. Lütfen tekrar deneyin.');
            }
        } catch (error) {
            console.error('Kayıt hatası:', error);
            toast.error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
        }
    };

    return (
        <Layout>
            <ToastContainer />

            <div className={styles.containerRegister}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <h2 className={styles.formTitle}>
                    {added_role === 'manager' ? 'Yönetici Ekle' : 'Personel Ekle'}
                </h2>
                <input
                    type="text"
                    name="name"
                    placeholder="İsim"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={styles.input}
                />
                {errors.name && <p className={styles.error}>{errors.name}</p>}
                <input
                    type="text"
                    name="lastname"
                    placeholder="Soyisim"
                    value={formData.lastname}
                    onChange={handleChange}
                    required
                    className={styles.input}
                />
                {errors.lastname && <p className={styles.error}>{errors.lastname}</p>}
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={styles.input}
                />
                {errors.email && <p className={styles.error}>{errors.email}</p>}
                <input
                    type="password"
                    name="password"
                    placeholder="Şifre"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className={styles.input}
                />
                {errors.password && <p className={styles.error}>{errors.password}</p>}
                <input
                    type="tel"
                    name="phone"
                    placeholder="Telefon"
                    value={formData.phone}
                    onChange={handleChange}
                    className={styles.input}
                />
                {errors.phone && <p className={styles.error}>{errors.phone}</p>}

                {activeUseRole !== 'manager' && (
                    <select
                        name="companyCode"
                        value={formData.companyCode}
                        onChange={handleCompanyChange}
                        required
                        className={styles.input}
                    >
                        <option value="">Kurum Seçin</option>
                        {companies.map((company) => (
                            <option key={company.code} value={company.code}>
                                {company.name} / {company.code}
                            </option>
                        ))}
                    </select>
                )}

                {activeUseRole !== 'manager' && added_role === 'personal' && (
                    <select
                        name="creator_id"
                        value={formData.creator_id}
                        onChange={(e) =>
                            setFormData({ ...formData, creator_id: e.target.value })
                        }
                        required
                        className={styles.input}
                        disabled={!selectedCompany}
                    >
                        <option value="">Yönetici Seçin</option>
                        {managers.map((manager) => (
                            <option key={manager.id} value={manager.id}>
                                {manager.name} {manager.lastname}
                            </option>
                        ))}
                    </select>
                )}

                <button type="submit" className={styles.button}>
                    {added_role === 'manager' ? 'Yönetici Ekle' : 'Personel Ekle'}
                </button>
            </form>
            </div>
        </Layout>
    );
}
