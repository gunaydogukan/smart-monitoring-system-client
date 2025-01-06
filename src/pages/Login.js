import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Ekranın mobil boyutta olup olmadığını takip eden state
    const [isMobile, setIsMobile] = useState(false);

    const { login, loading } = useAuth();
    const navigate = useNavigate();

    // Pencere boyutunu izleyip <768 ise isMobile = true yapıyoruz
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err?.response?.data?.error || 'Bilinmeyen bir hata oluştu');
        }
    };

    if (loading) {
        return <div>Yükleniyor...</div>;
    }

    // Masaüstünde width: '60%', mobilde neredeyse tam: '95%'
    const dynamicContentStyle = {
        ...styles.content,
        width: isMobile ? '95%' : '60%',
    };

    // Sol taraf, mobilde tamamen gizlensin
    const dynamicLeftSectionStyle = {
        ...styles.leftSection,
        display: isMobile ? 'none' : 'flex',
    };

    return (
        <div style={styles.container}>
            <div style={dynamicContentStyle}>
                <div style={dynamicLeftSectionStyle}>
                    <h1 style={styles.title}>Hoş Geldiniz!</h1>
                    <p style={styles.description}>
                        Tüm sensörlerinizi tek bir yerden yönetin, gerçek zamanlı
                        analizlere göz atın ve akıllı uyarılarla işlerinizi kolaylaştırın.
                    </p>
                </div>
                <div style={styles.rightSection}>
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <h2 style={styles.formTitle}>Giriş Yap</h2>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={styles.input}
                        />
                        <input
                            type="password"
                            placeholder="Şifre"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={styles.input}
                        />
                        <button type="submit" style={styles.button}>
                            Giriş Yap
                        </button>
                        <p style={styles.footerText}>
                            Şifremi unuttum{' '}
                            <a href="/reset-password" style={styles.link}>
                                Şifremi sıfırla
                            </a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f1f3',
        fontFamily: 'Arial, sans-serif',
        // Dikey kaydırma gerekebilecek durumda sayfanın kesilmesini engellemek için:
        overflowY: 'auto',
        padding: '20px',
        boxSizing: 'border-box',
    },
    content: {
        display: 'flex',
        flexDirection: 'row',
        maxWidth: '1300px',
        height: '70vh',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        borderRadius: '20px',
        overflow: 'hidden',
        // width: '60%'  -> dinamikte ayarlanacak
    },
    leftSection: {
        flex: 1,
        padding: '60px',
        backgroundColor: '#e5e7eb',
        color: '#333',
        textAlign: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.1)',
        // Mobilde display: 'none' olacak
    },
    rightSection: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.05)',
        padding: '40px',
    },
    title: {
        fontSize: '48px',
        fontWeight: 'bold',
        marginBottom: '20px',
    },
    description: {
        fontSize: '22px',
        maxWidth: '500px',
        margin: '0 auto',
    },
    form: {
        width: '100%',
        maxWidth: '450px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
        padding: '20px',
    },
    formTitle: {
        textAlign: 'center',
        marginBottom: '20px',
        color: '#4a5568',
        fontSize: '32px',
    },
    input: {
        padding: '15px',
        marginBottom: '15px',
        borderRadius: '8px',
        border: '1px solid #cbd5e0',
        fontSize: '16px',
    },
    button: {
        padding: '15px',
        borderRadius: '8px',
        border: 'none',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '18px',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        marginTop: '15px',
    },
    footerText: {
        marginTop: '10px',
        textAlign: 'center',
        color: '#718096',
    },
    link: {
        color: '#667eea',
        textDecoration: 'none',
        fontWeight: 'bold',
    },
};
