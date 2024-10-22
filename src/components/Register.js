import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from "../layouts/Layout";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        lastname: '',
        email: '',
        password: '',
        phone: '',
        companyCode: '',
        creator_id: '', // Seçilen manager'in id'si burada tutulacak (sadece personal için)
    });

    const [companies, setCompanies] = useState([]);
    const [managers, setManagers] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(''); // Seçilen kurum
    const navigate = useNavigate();
    const location = useLocation();

    // Role'ü location'dan çekiyoruz
    const role = location.state?.role;

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/companies', {
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
    }, []);

    const handleCompanyChange = async (e) => {
        const companyCode = e.target.value;
        setSelectedCompany(companyCode);
        setFormData({ ...formData, companyCode });

        if (companyCode && role === 'personal') { // Eğer personal ekleniyorsa managerları getir
            try {
                const response = await fetch('http://localhost:5000/api/users', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                const data = await response.json();

                // Manager rolüne sahip ve seçilen kuruma ait kullanıcıları filtrele
                const filteredManagers = data.filter(user => user.role === 'manager' && user.companyCode === companyCode);
                setManagers(filteredManagers); // Filtrelenmiş manager'ları ayarla
            } catch (error) {
                console.error('Manager listesi alınırken hata:', error);
            }
        } else {
            setManagers([]); // Manager listesi boşaltılır
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (role === 'administrator') {
            alert('Administrator ekleyemezsiniz!');
            return;
        }

        try {
            const payload = { ...formData, role };
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (response.ok) {
                toast.success('Kayıt başarılı!', { autoClose: 3000 });
                setTimeout(() => navigate('/dashboard'), 3000);
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
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2 style={styles.formTitle}>
                    {role === 'manager' ? 'Manager Ekle' : 'Personal Ekle'}
                </h2>
                {/* Form alanları */}
                <input
                    type="text"
                    name="name"
                    placeholder="İsim"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />
                <input
                    type="text"
                    name="lastname"
                    placeholder="Soyisim"
                    value={formData.lastname}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Şifre"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />
                <input
                    type="tel"
                    name="phone"
                    placeholder="Telefon"
                    value={formData.phone}
                    onChange={handleChange}
                    style={styles.input}
                />

                {/* Kurum seçimi */}
                <select
                    name="companyCode"
                    value={formData.companyCode}
                    onChange={handleCompanyChange}
                    required
                    style={styles.input}
                >
                    <option value="">Kurum Seçin</option>
                    {companies.map((company) => (
                        <option key={company.code} value={company.code}>
                            {company.name} / {company.code}
                        </option>
                    ))}
                </select>

                {/* Manager seçimi sadece personal ekleniyorsa görünsün */}
                {role === 'personal' && (
                    <select
                        name="creator_id"  // Seçilen manager'in id'si
                        value={formData.creator_id}
                        onChange={handleChange}
                        required
                        disabled={!selectedCompany}  // Kurum seçilmeden kilitli olacak
                        style={styles.input}
                    >
                        <option value="">Manager Seçin</option>
                        {managers.map((manager) => (
                            <option key={manager.id} value={manager.id}>
                                {manager.name} {manager.lastname}
                            </option>
                        ))}
                    </select>
                )}

                <button type="submit" style={styles.button}>
                    {role === 'manager' ? 'Manager Ekle' : 'Personal Ekle'}
                </button>
            </form>
        </Layout>
    );
}

const styles = {
    form: {
        display: 'flex',
        flexDirection: 'column',
        width: '400px',
        margin: '0 auto',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
    },
    formTitle: {
        textAlign: 'center',
        marginBottom: '20px',
        fontSize: '24px',
        color: '#333',
    },
    input: {
        marginBottom: '15px',
        padding: '10px',
        fontSize: '16px',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    button: {
        padding: '10px',
        fontSize: '16px',
        borderRadius: '4px',
        border: 'none',
        backgroundColor: '#4CAF50',
        color: '#fff',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
};
