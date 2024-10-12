import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext'; // AuthContext'ten login fonksiyonunu alıyoruz
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // Hata durumunu saklıyoruz

    const { login, loading } = useAuth(); // login fonksiyonunu ve loading durumunu alıyoruz
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password); // login işlemi
            console.log('Giriş başarılı!');
            navigate('/dashboard'); // Başarılı girişte yönlendir
        } catch (error) {
            setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.'); // Hata durumunu göster
        }
    };

    if (loading) {
        return <div>Yükleniyor...</div>; // Yüklenme durumunda gösterilecek ekran
    }

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <div style={styles.leftSection}>
                    <h1 style={styles.title}>Hoş Geldiniz!</h1>
                    <p style={styles.description}>
                        Tüm sensörlerinizi tek bir yerden yönetin, gerçek zamanlı analizlere göz atın ve akıllı
                        uyarılarla işlerinizi kolaylaştırın.
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
                            Şifremi unuttum <a href="/reset-password" style={styles.link}>Şifremi sıfırla</a>
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
    },
    content: {
        display: 'flex',
        flexDirection: 'row',
        width: '60%',
        maxWidth: '1300px',
        height: '70vh',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        borderRadius: '20px',
        overflow: 'hidden',
    },
    leftSection: {
        flex: 1,
        padding: '60px',
        backgroundColor: '#e5e7eb',
        color: '#333',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.1)',
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
    rightSection: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.05)',
        padding: '40px',
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
