import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from "../layouts/Layout";

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        lastname: '',
        email: '',
        password: '',
        phone: '',
    });

    const { user } = useAuth(); // Giriş yapmış kullanıcının bilgisi
    const navigate = useNavigate();
    const location = useLocation();

    const role = location.state?.role || 'user'; // Role bilgisi (administrator gönderilmez)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Frontend'de administrator rolünün gönderilmesini engelle
        if (role === 'administrator') {
            alert('Administrator rolü ekleyemezsiniz!');
            return;
        }

        try {
            const payload = {
                ...formData,
                role, // Yalnızca manager veya personal rolü gelir
            };

            console.log("Gönderilen payload:", payload);

            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, // Token ekliyoruz
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (response.ok) {
                console.log('Kayıt başarılı:', data);
                navigate('/dashboard');
            } else {
                alert(data.error || 'Kayıt başarısız. Lütfen tekrar deneyin.');
            }
        } catch (error) {
            console.error('Kayıt hatası:', error);
            alert('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
        }
    };

    return (
        <Layout>
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2 style={styles.formTitle}>
                    {role === 'manager' ? 'Manager Ekle' : 'Personal Ekle'}
                </h2>
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
