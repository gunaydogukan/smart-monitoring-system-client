import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import UserService from "../services/userServices";

const AuthContext = createContext(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
            axios
                .get("http://localhost:5000/api/verifyToken", {
                    headers: { Authorization: `Bearer ${storedToken}` },
                })
                .then(async (response) => {
                    if (response.data.valid) {
                        setUser(JSON.parse(storedUser));
                        setToken(storedToken);

                        try {
                            const role = await UserService.getUserRole(storedToken);
                            setUserRole(role);
                        } catch (error) {
                            console.error("Kullanıcı rolü alınamadı:", error);
                            logout();
                        }
                    } else {
                        logout();
                    }
                })
                .catch(() => {
                    logout();
                })
                .finally(() => setLoading(false)); // Yükleme durumu tamamlanır
        } else {
            setLoading(false); // Kullanıcı yoksa yükleme tamamlanır
        }
    }, []);

    const login = async (email, password, navigate) => {
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

                const role = await UserService.getUserRole(token);
                setUserRole(role);

                if (navigate) {
                    navigate("/dashboard"); // Başarılı girişte yönlendirme
                }
            }
        } catch (error) {
            console.error("Giriş hatası:", error);
            throw error;
        }
    };

    const logout = (navigate) => {
        setUser(null);
        setToken(null);
        setUserRole(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setLoading(false); // Logout sonrası yükleme tamamlanır
        if (navigate) {
            navigate("/login"); // Çıkışta login sayfasına yönlendir
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, userRole, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
