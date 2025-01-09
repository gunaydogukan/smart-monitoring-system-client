import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import styles from '../styles/UpdateUserModal.module.css';

const UpdateUserModal = ({ modalVisible, handleCloseModal, selectedUser, handleUpdateUser }) => {
    const [formData, setFormData] = useState(selectedUser || {}); // Kullanıcı bilgilerini yönet
    const [message, setMessage] = useState(''); // Başarı/Hata mesajı
    const [messageType, setMessageType] = useState(''); // Mesaj tipi (success/error)

    // Seçilen kullanıcı değiştiğinde formu güncelle
    useEffect(() => {
        if (selectedUser) {
            setFormData({ ...selectedUser });
            setMessage('');
        }
    }, [selectedUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateForm = () => {
        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
            setMessage('Lütfen geçerli bir e-posta adresi girin.');
            setMessageType('error');
            return false;
        }
        if (!formData.name || formData.name.trim() === '') {
            setMessage('Ad alanı boş bırakılamaz.');
            setMessageType('error');
            return false;
        }
        if (!formData.lastname || formData.lastname.trim() === '') {
            setMessage('Soyad alanı boş bırakılamaz.');
            setMessageType('error');
            return false;
        }
        if (!formData.phone || !/^[0-9]{10,15}$/.test(formData.phone)) {
            setMessage('Lütfen geçerli bir telefon numarası girin (10-15 rakam).');
            setMessageType('error');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (validateForm()) {
            await handleUpdateUser(formData); // Kullanıcıyı güncelle
            setMessage('Kullanıcı başarıyla güncellendi!');
            setMessageType('success');
            setTimeout(() => {
                handleCloseModal();
            }, 3000);
        }
    };

    if (!selectedUser) return null; // Seçili kullanıcı yoksa modal gösterilmez

    return (
        <div className={`${styles.modal} ${modalVisible ? styles.active : ''}`}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3>Kullanıcı Bilgilerini Güncelle</h3>
                    <button className={styles.closeButton} onClick={handleCloseModal}>
                        <FaTimes />
                    </button>
                </div>

                <form className={styles.modalForm} onSubmit={(e) => e.preventDefault()}>
                    {/* Mesaj Alanı */}
                    {message && (
                        <div
                            className={`${styles.message} ${
                                messageType === 'success' ? styles.successMessage : styles.errorMessage
                            }`}
                        >
                            {message}
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label htmlFor="name">Ad</label>
                        <input
                            id="name"
                            className={styles.modalInput}
                            type="text"
                            name="name"
                            placeholder="Ad"
                            value={formData.name || ''}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="lastname">Soyad</label>
                        <input
                            id="lastname"
                            className={styles.modalInput}
                            type="text"
                            name="lastname"
                            placeholder="Soyad"
                            value={formData.lastname || ''}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="email">E-posta</label>
                        <input
                            id="email"
                            className={styles.modalInput}
                            type="email"
                            name="email"
                            placeholder="E-posta"
                            value={formData.email || ''}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="phone">Telefon</label>
                        <input
                            id="phone"
                            className={styles.modalInput}
                            type="text"
                            name="phone"
                            placeholder="Telefon"
                            value={formData.phone || ''}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="companyCode">Şirket Kodu</label>
                        <input
                            id="companyCode"
                            className={styles.modalInput}
                            type="text"
                            name="companyCode"
                            placeholder="Şirket Kodu"
                            value={formData.companyCode || ''}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Butonlar */}
                    <div className={styles.buttonGroup}>

                        <button type="button" className={styles.cancelButton} onClick={handleCloseModal}>
                            İptal
                        </button>
                        <button type="button" className={styles.modalButton} onClick={handleSubmit}>
                            Güncelle
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateUserModal;
