import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from "../layouts/Layout";
import { FaEnvelope, FaPhone, FaBuilding } from 'react-icons/fa';
import userIcon from '../assets/profile-icon.avif'; // Profil resmi için modern ikon

export default function Profile() {
    const { token } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error('Profil bilgisi alınırken hata oluştu.');

                const data = await response.json();
                setProfileData(data);
            } catch (error) {
                console.error('Profil bilgisi hatası:', error);
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
    const companyName = profileData.company?.name || 'Kurum bulunamadı';
    const companyCode = profileData.company?.code || 'Kurum kodu bulunamadı';

    return (
        <Layout>
            <div style={styles.container}>
                <div style={styles.profileContent}>
                    <div style={styles.avatarContainer}>
                        <img src={userIcon} alt="User Icon" style={styles.avatarImage} />
                    </div>

                    <h2 style={styles.title}>Profil Bilgilerim</h2>

                    <div style={styles.infoContainer}>
                        <div style={styles.infoRow}>
                            <strong>Ad:</strong>
                            <p>{profileData.name}</p>
                        </div>
                        <div style={styles.infoRow}>
                            <strong>Soyad:</strong>
                            <p>{profileData.lastname}</p>
                        </div>
                        <div style={styles.infoRow}>
                            <FaEnvelope style={styles.icon} />
                            <p>{profileData.email}</p>
                        </div>
                        <div style={styles.infoRow}>
                            <FaPhone style={styles.icon} />
                            <p>{profileData.phone}</p>
                        </div>

                        {!isAdministrator && (
                            <>
                                <div style={styles.infoRow}>
                                    <FaBuilding style={styles.icon} />
                                    <p>{companyName}</p>
                                </div>
                                <div style={styles.infoRow}>
                                    <strong>Kurum Kodu:</strong>
                                    <p>{companyCode}</p>
                                </div>
                            </>
                        )}

                        {isAdministrator && (
                            <p style={styles.adminMessage}>
                                <em>Bu kullanıcı bir administrator, kurum bilgisi yok.</em>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f0f0',
    },
    profileContent: {
        width: '400px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatarContainer: {
        marginBottom: '20px',
    },
    avatarImage: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        objectFit: 'cover',
    },
    title: {
        fontSize: '24px',
        marginBottom: '10px',
    },
    infoContainer: {
        width: '100%',
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
        fontSize: '18px',
    },
    icon: {
        marginRight: '8px',
        color: '#4CAF50',
    },
    adminMessage: {
        marginTop: '20px',
        fontStyle: 'italic',
        color: '#777',
    },
};
