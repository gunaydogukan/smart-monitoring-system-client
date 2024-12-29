import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from "../layouts/Layout";
import { FaEnvelope, FaPhone, FaBuilding } from 'react-icons/fa';
import userIcon from '../assets/profile-icon.avif';
import styles from '../styles/Profile.module.css';
import UpdateModal from '../components/profileUpdateModal';

export default function Profile() {
    const { token } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false); // Modal görünürlüğünü kontrol eden state

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Profil bilgisi alınırken hata oluştu.');
                }

                const data = await response.json();
                setProfileData(data);
            } catch (error) {
                setError('Bilgiler alınırken hata oluştu.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [token]);

    if (loading) return <div>Yükleniyor...</div>;
    if (error) return <div>{error}</div>;

    const isAdministrator = profileData.role === 'administrator';

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    return (
        <Layout>
            <div className={styles.content}>
                <div className={styles.profileContent}>
                    <div className={styles.avatarContainer}>
                        <img src={userIcon} alt="User Icon" className={styles.avatarImage} />
                    </div>
                    <h2 className={styles.title}>Profil Bilgilerim</h2>
                    <div className={styles.infoContainer}>
                        <div className={styles.infoRow}>
                            <strong>Ad:</strong>
                            <p>{profileData.name}</p>
                        </div>
                        <div className={styles.infoRow}>
                            <strong>Soyad:</strong>
                            <p>{profileData.lastname}</p>
                        </div>
                        <div className={styles.infoRow}>
                            <FaEnvelope className={styles.icon}/>
                            <p>{profileData.email}</p>
                        </div>
                        <div className={styles.infoRow}>
                            <FaPhone className={styles.icon}/>
                            <p>{profileData.phone}</p>
                        </div>
                        {!isAdministrator && (
                            <>
                                <div className={styles.infoRow}>
                                    <FaBuilding className={styles.icon}/>
                                    <p>{profileData.companyName || 'Kurum bulunamadı'}</p>
                                </div>
                                <div className={styles.infoRow}>
                                    <strong>Kurum Kodu:</strong>
                                    <p>{profileData.companyCode || 'Kurum kodu bulunamadı'}</p>
                                </div>
                            </>
                        )}
                        {isAdministrator && (
                            <p className={styles.adminMessage}>
                                <em>Bu kullanıcı bir administrator, kurum bilgisi yok.</em>
                            </p>
                        )}
                    </div>
                    {/* Güncelle Butonu */}
                    <button onClick={openModal} className={styles.updateButton}>
                        Güncelle
                    </button>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <UpdateModal
                    profileData={profileData}
                    token={token}
                    closeModal={closeModal}
                />
            )}
        </Layout>
    );
}
