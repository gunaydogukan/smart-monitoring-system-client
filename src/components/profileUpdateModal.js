import React, { useState } from 'react';
import styles from '../styles/ProfileUpdateModal.module.css';

export default function UpdateModal({ profileData, token, closeModal }) {
    const [formData, setFormData] = useState({ ...profileData, password: '' }); // Şifre varsayılan olarak boş
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/update', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Güncelleme başarısız oldu.');
            setMessage('Profil başarıyla güncellendi.');
            setTimeout(closeModal, 2000); // Modalı kapatma
        } catch (error) {
            setMessage(error.message);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Profil Güncelle</h2>
                <form onSubmit={handleSubmit}>
                    <label>Ad:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <label>Soyad:</label>
                    <input
                        type="text"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                        required
                    />
                    <label>E-posta:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <label>Telefon:</label>
                    <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                    <label>Şifre (Boş bırakılırsa değişmez):</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Yeni şifre"
                    />
                    <div className={styles.buttonContainer}>
                        <button type="submit">Güncelle</button>
                        <button type="button" onClick={closeModal}>
                            İptal
                        </button>
                    </div>
                </form>
                {message && <p className={styles.message}>{message}</p>}
            </div>
        </div>
    );
}