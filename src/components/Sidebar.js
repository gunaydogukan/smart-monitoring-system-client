import { useState, useEffect } from "react";
import { FaHome, FaMicrochip, FaUser, FaBuilding, FaPlus, FaSignOutAlt, FaSun, FaMoon } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import '../styles/Sidebar.css'; // CSS dosyasını dahil et

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isUsersOpen, setIsUsersOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false); // Gece/Gündüz modu durumu

    // Yerel depolama ile modu kaydet
    useEffect(() => {
        const mode = localStorage.getItem("darkMode");
        setIsDarkMode(mode === "true");
    }, []);

    const toggleMode = () => {
        setIsDarkMode((prevMode) => {
            const newMode = !prevMode;
            localStorage.setItem("darkMode", newMode); // Modu yerel depolamada güncelle
            return newMode;
        });
    };

    return (
        <div className={`sidebar ${isDarkMode ? 'dark' : ''}`}>
            <div className="menu-group">
                <div className="menu" onClick={() => navigate("/dashboard")}>
                    <FaHome className="menu-icon" />
                    <span>Anasayfa</span>
                </div>

                <div className="menu" onClick={() => navigate("/sensors")}>
                    <FaMicrochip className="menu-icon" />
                    <span>Sensörler</span>
                </div>

                <div className={`menu ${isUsersOpen ? 'open' : ''}`} onClick={() => setIsUsersOpen(!isUsersOpen)}>
                    <FaUser className="menu-icon" />
                    <span>Kullanıcılar</span>
                </div>
                {isUsersOpen && (
                    <ul className="dropdown">
                        <li onClick={() => navigate('/admin/users')}>
                            <FaUser className="dropdown-icon" /> Adminler
                        </li>
                        <li onClick={() => navigate('/users')}>
                            <FaUser className="dropdown-icon" /> Kullanıcılar
                        </li>
                    </ul>
                )}

                <div className="menu" onClick={() => navigate("/profile")}>
                    <FaUser className="menu-icon" />
                    <span>Profilim</span>
                </div>

                <div className="menu" onClick={() => navigate("/organisations")}>
                    <FaBuilding className="menu-icon" />
                    <span>Kurumlar</span>
                </div>

                <div className={`menu ${isAddOpen ? 'open' : ''}`} onClick={() => setIsAddOpen(!isAddOpen)}>
                    <FaPlus className="menu-icon" />
                    <span>Ekle</span>
                </div>

                {isAddOpen && (
                    <ul className="dropdown">
                        <li onClick={() => navigate('/manager/dashboard/adminadd/2')}>
                            <FaUser className="dropdown-icon" /> Admin Ekle
                        </li>
                        <li onClick={() => navigate('/add-user')}>
                            <FaUser className="dropdown-icon" /> Kullanıcı Ekle
                        </li>
                        <li onClick={() => navigate('/add-organisation')}>
                            <FaBuilding className="dropdown-icon" /> Kurum Ekle
                        </li>
                        <li onClick={() => navigate('/sensor-dashboard')}>
                            <FaMicrochip className="dropdown-icon" /> Sensör Ekle
                        </li>
                    </ul>
                )}

                <div className="logout" onClick={logout}>
                    <FaSignOutAlt className="menu-icon" />
                    <span>Çıkış</span>
                </div>

                {/* Gece/Gündüz Modu Toggle Butonu */}
                <button className="toggle-mode" onClick={toggleMode}>
                    {isDarkMode ? <FaSun /> : <FaMoon />}
                </button>
            </div>
        </div>
    );
}
