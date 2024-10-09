import {createContext, useContext, useEffect, useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";

const AuthContext = createContext(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

export const AuthProvider = ( { children } ) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);


    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:5000/api/login', {
                email,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then((response) => {
                    if (response.data.success && response.data.token) {
                        const { token, user } = response.data;

                        localStorage.setItem('token', token);
                        localStorage.setItem('user', JSON.stringify(user));

                        setToken(token);
                        setUser(user);
                        console.log("Giriş başarılı!");

                    }
                });
        } catch (error) {
            console.error("Giriş Hatası: ", error);
            throw error;
        }
    }

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
    }

    return (
        <AuthContext.Provider value={{
            login,
            logout,
            user,
            token
        }}
        >
            {children}
        </AuthContext.Provider>
    );
}


