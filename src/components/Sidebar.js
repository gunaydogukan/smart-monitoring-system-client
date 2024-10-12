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
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Yerel depolama ile modu kaydet
    useEffect(() => {
        const mode = localStorage.getItem("darkMode");
        setIsDarkMode(mode === "true");
    }, []);

    const toggleMode = () => {
        setIsDarkMode((prevMode) => {
            const newMode = !prevMode;
            localStorage.setItem("darkMode", newMode);
            return newMode;
        });
    };

    // Manager ve Personal ekleme sayfasına yönlendirme
    const handleNavigateToRegister = (role) => {
        navigate('/register', { state: { role } });
    };

    // Kullanıcı rolü
    const userRole = user?.role || 'guest'; // Varsayılan olarak 'guest'

    return (
        <div className={`sidebar ${isDarkMode ? 'dark' : ''}`}>
            <div className="menu-group">
                <div className="menu" onClick={() => navigate("/dashboard")}>
                    <FaHome className="menu-icon" />
                    <span>Anasayfa</span>
                </div>

                <div className="menu" onClick={() => navigate("/profile")}>
                    <FaUser className="menu-icon" />
                    <span>Profilim</span>
                </div>

                <div className="menu" onClick={() => navigate("/sensors")}>
                    <FaMicrochip className="menu-icon" />
                    <span>Sensörler</span>
                </div>

                {/* Kullanıcılar Menüsü */}
                {userRole !== 'personal' && (
                    <div className={`menu ${isUsersOpen ? 'open' : ''}`} onClick={() => setIsUsersOpen(!isUsersOpen)}>
                        <FaUser className="menu-icon" />
                        <span>Kullanıcılar</span>
                    </div>
                )}
                {isUsersOpen && userRole !== 'personal' && (
                    <ul className="dropdown">
                        {userRole === 'administrator' && (
                            <li onClick={() => navigate('/admin/users')}>
                                <FaUser className="dropdown-icon" /> Managers
                            </li>
                        )}
                        <li onClick={() => navigate('/users')}>
                            <FaUser className="dropdown-icon" /> Personals
                        </li>
                    </ul>
                )}

                <div className="menu" onClick={() => navigate("/organisations")}>
                    <FaBuilding className="menu-icon" />
                    <span>Kurumlar</span>
                </div>

                {/* Ekle Menüsü */}
                {userRole !== 'personal' && (
                    <div className={`menu ${isAddOpen ? 'open' : ''}`} onClick={() => setIsAddOpen(!isAddOpen)}>
                        <FaPlus className="menu-icon" />
                        <span>Ekle</span>
                    </div>
                )}
                {isAddOpen && userRole !== 'personal' && (
                    <ul className="dropdown">
                        {userRole === 'administrator' && (
                            <li onClick={() => handleNavigateToRegister('manager')}>
                                <FaUser className="dropdown-icon" /> Manager Ekle
                            </li>
                        )}
                        <li onClick={() => handleNavigateToRegister('personal')}>
                            <FaUser className="dropdown-icon" /> Personal Ekle
                        </li>
                        {userRole === 'administrator' && (
                            <li onClick={() => navigate('/add-organisation')}>
                                <FaBuilding className="dropdown-icon" /> Kurum Ekle
                            </li>
                        )}
                        <li onClick={() => navigate('/address')}>
                            <FaMicrochip className="dropdown-icon" /> Sensör Ekle
                        </li>
                    </ul>
                )}

                <div className="logout" onClick={logout}>
                    <FaSignOutAlt className="menu-icon" />
                    <span>Çıkış</span>
                </div>

                <button className="toggle-mode" onClick={toggleMode}>
                    {isDarkMode ? <FaSun /> : <FaMoon />}
                </button>
            </div>
        </div>
    );
}
