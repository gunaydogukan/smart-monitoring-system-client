import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from "../layouts/Layout";



export default function CompanyAdd() {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        plate: '',    // Seçilen şehrin id'si
        city: '',     // Seçilen şehrin adı
    });

    const [provinces, setProvinces] = useState([]);  // API'den gelecek şehir bilgileri
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    // Şehirleri dış API'den çekme
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await fetch('https://turkiyeapi.dev/api/v1/provinces');
                const data = await response.json();
                setProvinces(data.data || []);  // Gelen şehir verisini kaydediyoruz
            } catch (error) {
                console.error('İller çekilirken hata:', error);
                setError('Şehirler yüklenirken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        };
        fetchProvinces();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Şehir seçimi yapıldığında, şehir plakası (id) ve adı ile birlikte formData'ya kaydediyoruz
    const handleCityChange = (e) => {
        const selectedCity = provinces.find(province => province.id === parseInt(e.target.value)); // `id` alanını kullanıyoruz
        setFormData({
            ...formData,
            plate: selectedCity.id,  // Şehir id'si
            city: selectedCity.name, // Şehir adı
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('http://localhost:5000/api/companies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(formData),  // Backend'e formData gönderiliyor
            });

            const data = await response.json();
            if (response.ok) {
                console.log('Kurum başarıyla eklendi:', data);
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
        return <div>Şehirler yükleniyor...</div>;
    }

    return (
<Layout>


            <form onSubmit={handleSubmit} style={styles.form}>
                <h2 style={styles.formTitle}>Kurum Ekle</h2>
                {error && <p style={styles.error}>{error}</p>}
                <input
                    type="text"
                    name="name"
                    placeholder="Kurum Adı"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />
                <input
                    type="text"
                    name="code"
                    placeholder="Kurum Kodu"
                    value={formData.code}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />

                {/* Şehir Seçimi Dropdown */}
                <select
                    name="plate"
                    value={formData.plate}
                    onChange={handleCityChange}  // handleCityChange fonksiyonu şehir seçimini işliyor
                    required
                    style={styles.input}
                >
                    <option value="">Şehir Seçin</option>
                    {provinces.map((province) => (
                        <option key={province.id} value={province.id}>
                            {province.name} ({province.id}) {/* Şehir adı ve id'si (plate) */}
                        </option>
                    ))}
                </select>

                <button
                    type="submit"
                    style={styles.button}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Ekleniyor...' : 'Kurum Ekle'}
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
    error: {
        color: 'red',
        marginBottom: '15px',
    },
};
