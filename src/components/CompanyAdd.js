import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from "../layouts/Layout";

export default function CompanyAdd() {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        city_id: '',
    });

    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    // Şehirleri backend'den çekme
    useEffect(() => {
        let isMounted = true; // Bileşenin mount olup olmadığını kontrol etmek için flag

        const fetchCities = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Token eksik.');

                const response = await fetch('http://localhost:5000/api/cities', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Şehirleri yüklerken hata: ${response.statusText}`);
                }

                const data = await response.json();
                if (isMounted) setCities(data);
                console.log(data);
            } catch (error) {
                console.error('Şehirleri çekerken hata:', error);
                if (isMounted) setError('Şehirleri yüklerken bir hata oluştu.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchCities();

        return () => {
            isMounted = false; // Bileşen unmount olduğunda flag'i false yap
        };
    }, []);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true); // İşlemi başlatırken butonu devre dışı bırak

        try {
            const response = await fetch('http://localhost:5000/api/companies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(formData),
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
            setIsSubmitting(false); // İşlem tamamlandığında butonu aktif hale getir
        }
    };

    if (loading) {
        return <div>Şehirler yükleniyor...</div>; // Yüklenme durumu
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
                <select
                    name="city_id"
                    value={formData.city_id}
                    onChange={handleChange}
                    required
                    style={styles.input}
                >
                    <option value="">Şehir Seçin</option>
                    {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                            {city.city} {/* city.name yerine city.city */}
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
