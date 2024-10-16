import { useState, useEffect } from "react";
import {
    FaHome, FaMicrochip, FaUser, FaBuilding,
    FaPlus, FaSignOutAlt, FaSun, FaMoon
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import '../styles/Sidebar.css'; // CSS dosyasını dahil et

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isUsersOpen, setIsUsersOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        if (!user) navigate('/login'); // Kullanıcı giriş yapmamışsa login sayfasına yönlendirme
    }, [user, navigate]);

    const isPersonal = user?.role === 'personal';
    const isManager = user?.role === 'manager'; // Manager rolünü kontrol et

    useEffect(() => {
        const mode = localStorage.getItem("darkMode") === "true";
        setIsDarkMode(mode);
        document.body.classList.toggle('dark-mode', mode);
    }, []);

    const toggleMode = () => {
        setIsDarkMode((prevMode) => {
            const newMode = !prevMode;
            localStorage.setItem("darkMode", newMode);
            document.body.classList.toggle('dark-mode', newMode);
            return newMode;
        });
    };

    const goTo = (path) => navigate(path);

    const handleLogout = () => {
        logout();
        goTo('/login');
    };

    return (
        <div className={`sidebar ${isDarkMode ? 'dark' : ''}`}>
            <div className="menu-group">
                <div className="menu" onClick={() => goTo("/dashboard")}>
                    <FaHome className="menu-icon"/>
                    <span>Anasayfa</span>
                </div>

                <div className="menu" onClick={() => goTo("/profile")}>
                    <FaUser className="menu-icon"/>
                    <span>Profilim</span>
                </div>

                <div className="menu" onClick={() => goTo("/sensors")}>
                    <FaMicrochip className="menu-icon"/>
                    <span>Sensörler</span>
                </div>

                {!isPersonal && (
                    <>
                        <div
                            className={`menu ${isUsersOpen ? 'open' : ''}`}
                            onClick={() => setIsUsersOpen(!isUsersOpen)}
                        >
                            <FaUser className="menu-icon"/>
                            <span>Kullanıcılar</span>
                        </div>
                        {isUsersOpen && (
                            <ul className="dropdown">
                                <li onClick={() => goTo('/admin/users')}>
                                    <FaUser className="dropdown-icon"/> Managers
                                </li>
                                <li onClick={() => goTo('/users')}>
                                    <FaUser className="dropdown-icon"/> Personals
                                </li>
                            </ul>
                        )}
                    </>
                )}

                <div className="menu" onClick={() => goTo("/organisations")}>
                    <FaBuilding className="menu-icon"/>
                    <span>Kurumlar</span>
                </div>

                {!isPersonal && (
                    <>
                        <div
                            className={`menu ${isAddOpen ? 'open' : ''}`}
                            onClick={() => setIsAddOpen(!isAddOpen)}
                        >
                            <FaPlus className="menu-icon"/>
                            <span>Ekle</span>
                        </div>
                        {isAddOpen && (
                            <ul className="dropdown">
                                <li onClick={() => navigate('/register', {state: {role: 'manager'}})}>
                                    <FaUser className="dropdown-icon"/> Manager Ekle
                                </li>
                                <li onClick={() => navigate('/register', {state: {role: 'personal'}})}>
                                    <FaUser className="dropdown-icon"/> Personal Ekle
                                </li>
                                {/* Manager rolünde "Kurum Ekle" gösterilmesin */}
                                {!isManager && (
                                    <li onClick={() => goTo('/CompanyAdd')}>
                                        <FaBuilding className="dropdown-icon"/> Kurum Ekle
                                    </li>
                                )}


                                <li onClick={() => goTo('/address')}>
                                    <FaMicrochip className="dropdown-icon"/> Sensör Ekle
                                </li>
                            </ul>
                        )}
                    </>
                )}

                <div className="logout" onClick={handleLogout}>
                    <FaSignOutAlt className="menu-icon"/>
                    <span>Çıkış</span>
                </div>

                <button className="toggle-mode" onClick={toggleMode}>
                    {isDarkMode ? <FaSun/> : <FaMoon/>}
                </button>
            </div>
        </div>
    );
}