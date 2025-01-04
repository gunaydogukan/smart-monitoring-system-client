import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import UserService from '../services/userServices'

//import {useNavigate} from "react-router-dom";


const AuthContext = createContext(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    //console.log(context);
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [userRole, setUserRole] = useState(null);

    const [loading, setLoading] = useState(true); // Yüklenme durumu


    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
            axios
                .get("http://localhost:5000/api/verifyToken", {
                    headers: { Authorization: `Bearer ${storedToken}` },
                })
                .then((response) => {
                    if (response.data.valid) {
                        setUser(JSON.parse(storedUser));
                        setToken(storedToken);


                        // Kullanıcı rolünü almak için UserService'i çağır
                        UserService.getUserRole(storedToken)
                            .then((role) => {
                                setUserRole(role); // Kullanıcı rolünü ayarla
                            })
                            .catch((error) => {
                                console.error("Kullanıcı rolü alınamadı:", error);
                                logout(); // Hata durumunda oturumu kapat
                            });

                    } else {
                        logout();
                    }
                })
                .catch(() => logout())
                .finally(() => setLoading(false)); // Yüklenme bitti
        } else {
            setLoading(false); // Kullanıcı yoksa yüklenme bitti
        }
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post(
                "http://localhost:5000/api/login",
                { email, password },
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.data.success) {
                const { token, user } = response.data;

                localStorage.setItem("user", JSON.stringify(user));
                localStorage.setItem("token", token);

                setUser(user);
                setToken(token);
                console.log("Giriş başarılı!");

                const role = await UserService.getUserRole(token);
                setUserRole(role);

                console.log("Giriş başarılı, kullanıcı rolü:", role);
            }
        } catch (error) {
            console.error("Giriş hatası:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading,userRole }}>
            {children}
        </AuthContext.Provider>
    );
};
