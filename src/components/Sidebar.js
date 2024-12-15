// src/components/Sidebar.js
import { useState, useEffect } from "react";
import {
    FaHome, FaMicrochip, FaUser, FaBuilding,
    FaPlus, FaSignOutAlt, FaSun, FaMoon, FaRss, FaTag
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import '../styles/Sidebar.css';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { isDarkMode, toggleDarkMode } = useTheme();

    const [isUsersOpen, setIsUsersOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSensorControlOpen, setIsSensorControlOpen] = useState(false);

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    const handleNavigation = (path) => {
        navigate(path, { state: { reload: Date.now() } }); // Benzersiz bir state gönder
    };


    const isPersonal = user?.role === 'personal';

    if (!user) return null;

    return (
        <div className={`sidebar ${isDarkMode ? 'dark' : ''}`}>
            <div className="menu-group">
                <div className="menu" onClick={() => handleNavigation("/dashboard")}>
                    <FaHome className="menu-icon" />
                    <span>Anasayfa</span>
                </div>
                <div className="menu" onClick={() => handleNavigation("/profile")}>
                    <FaUser className="menu-icon" />
                    <span>Profilim</span>
                </div>
                <div className="menu" onClick={() => handleNavigation("/sensors")}>
                    <FaMicrochip className="menu-icon" />
                    <span>Sensörler</span>
                </div>

                {user?.role === "administrator" && (
                    <>
                        <div className="menu" onClick={() => setIsSensorControlOpen(!isSensorControlOpen)}>
                            <FaRss className="menu-icon" style={{ fontSize: "23px" }} />
                            <span>Sensör Kontrol</span>
                        </div>
                        {isSensorControlOpen && (
                            <ul className="dropdown">
                                <li onClick={() => handleNavigation("/sensorControl/kurulum")}>
                                    <FaRss className="dropdown-icon" /> Kurum Kontrol
                                </li>
                                <li onClick={() => handleNavigation("/sensorControl/ip")}>
                                    <FaRss className="dropdown-icon" /> IP Kontrol
                                </li>
                                <li onClick={() => handleNavigation("/sensorControl/data")}>
                                    <FaRss className="dropdown-icon" /> Veri Kontrol
                                </li>
                            </ul>
                        )}
                    </>
                )}

                {!isPersonal && (
                    <>
                        <div className={`menu ${isUsersOpen ? 'open' : ''}`} onClick={() => setIsUsersOpen(!isUsersOpen)}>
                            <FaUser className="menu-icon" />
                            <span>Kullanıcılar</span>
                        </div>
                        {isUsersOpen && (
                            <ul className="dropdown">
                                <li onClick={() => handleNavigation('/users/managers')}>
                                    <FaUser className="dropdown-icon"/> Managers
                                </li>
                                <li onClick={() => handleNavigation('/users/personals')}>
                                    <FaUser className="dropdown-icon"/> Personals
                                </li>
                            </ul>

                        )}
                    </>
                )}
                <div className="menu" onClick={() => handleNavigation("/companies")}>
                    <FaBuilding className="menu-icon"/>
                    <span>Kurumlar</span>
                </div>
                {!isPersonal && (
                    <>
                        <div className={`menu ${isAddOpen ? 'open' : ''}`} onClick={() => setIsAddOpen(!isAddOpen)}>
                            <FaPlus className="menu-icon" />
                            <span>Ekle</span>
                        </div>
                        {isAddOpen && (
                            <ul className="dropdown">
                                {user?.role === 'administrator' && (
                                    <li onClick={() => handleNavigation('/register-manager')}>
                                        <FaUser className="dropdown-icon" /> Manager Ekle
                                    </li>
                                )}
                                {(user?.role === 'manager' || user?.role === 'administrator') && (
                                    <li onClick={() => handleNavigation('/register-personal')}>
                                        <FaUser className="dropdown-icon" /> Personal Ekle
                                    </li>
                                )}
                                {user?.role === 'administrator' && (
                                    <li onClick={() => handleNavigation('/add-company')}>
                                        <FaBuilding className="dropdown-icon" /> Kurum Ekle
                                    </li>
                                )}
                                {user?.role === 'administrator' && (
                                    <li onClick={() => handleNavigation('/add-sensor-type')}>
                                        <FaTag className="dropdown-icon" /> Yeni Sensör Tipi Ekle
                                    </li>
                                )}
                                {(user?.role === 'manager' || user?.role === 'administrator') && (
                                    <li onClick={() => handleNavigation('/add-address')}>
                                        <FaMicrochip className="dropdown-icon" /> Sensör Ekle
                                    </li>
                                )}
                            </ul>
                        )}
                    </>
                )}
                <div className="logout" onClick={() => { logout(); navigate('/login'); }}>
                    <FaSignOutAlt className="menu-icon" />
                    <span>Çıkış</span>
                </div>
                <button className="toggle-mode" onClick={toggleDarkMode}>
                    {isDarkMode ? <FaSun /> : <FaMoon />}
                </button>
            </div>
        </div>
    );
}
