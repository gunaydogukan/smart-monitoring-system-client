import React, { useState } from 'react';
import {useAuth} from "../contexts/AuthContext";
import {useNavigate} from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState('test@example.com');
    const [password, setPassword] = useState('password');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (error) {
            alert("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#f0f0f0'
        }}>
            <form onSubmit={handleSubmit} style={{
                display: 'flex',
                flexDirection: 'column',
                width: '300px',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                backgroundColor: '#ffffff'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Giriş Yap</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                        padding: '10px',
                        marginBottom: '10px',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                    }}
                />
                <input
                    type="password"
                    placeholder="Şifre"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                        padding: '10px',
                        marginBottom: '20px',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                    }}
                />
                <button type="submit" style={{
                    padding: '10px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: '#007BFF',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}>
                    Giriş Yap
                </button>
            </form>
        </div>
    );
}
