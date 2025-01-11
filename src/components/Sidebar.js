import { useState, useEffect } from "react";
import {
    FaHome, FaMicrochip, FaUser, FaBuilding,
    FaPlus, FaSignOutAlt, FaBars, FaTimes, FaRss, FaTag
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import '../styles/Sidebar.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
export default function Sidebar({ isSidebarOpen, setSidebarOpen }) {
    const { user, logout,userRole } = useAuth();
    const navigate = useNavigate()
    const [isUsersOpen, setIsUsersOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSensorControlOpen, setIsSensorControlOpen] = useState(false);
    const [isSensorMenuOpen, setSensorMenuOpen] = useState(false);

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    const handleNavigation = (path, role) => {
        if (typeof role === 'string') {
            navigate(path, { state: { role } });
        } else if (typeof role === 'object') {
            navigate(path, { state: role });
        } else {
            navigate(path, { state: { role: userRole?.role } });
        }
    };

    const isPersonal = userRole?.role === 'personal';

    if (!user) return null;


    return (
        <>
            <button
                className="custom-sidebar-toggle"
                onClick={() => setSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? (
                    <FontAwesomeIcon icon={faTimes}/>
                ) : (
                    <FontAwesomeIcon icon={faBars}/>
                )}
            </button>


            {/* Sidebar */}
            <div className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
                <div className="menu-group">
                    <div className="menu" onClick={() => handleNavigation("/dashboard")}>
                        <FaHome className="menu-icon"/>
                        <span>Anasayfa</span>
                    </div>
                    <div className="menu" onClick={() => handleNavigation("/profile")}>
                        <FaUser className="menu-icon"/>
                        <span>Profilim</span>
                    </div>
                    <div className="menu" onClick={() => setIsSensorControlOpen(!isSensorControlOpen)}>
                        <FaRss className="menu-icon"/>
                        <span>Sensör Kontrol</span>
                    </div>
                    {isSensorControlOpen && (
                        <ul className="dropdown">


                            {userRole?.role === 'administrator' && (
                                <li onClick={() => window.open("/sensorControl/kurulum", "_blank")}>
                                    <FaRss className="dropdown-icon"/> Kurulu Sistemleri Takip Etme
                                </li>
                            )}
                            <li onClick={() => handleNavigation("/sensorControl/ip")}>
                                <FaRss className="dropdown-icon"/> IP Kontrol
                            </li>
                            <li onClick={() => handleNavigation("/sensorControl/data")}>
                                <FaRss className="dropdown-icon"/> Veri Kontrol
                            </li>
                        </ul>
                    )}

                    <div className="menu" onClick={() => setSensorMenuOpen(!isSensorMenuOpen)}>
                        <FaMicrochip className="menu-icon"/>
                        <span>Sensörler</span>
                    </div>
                    {isSensorMenuOpen && (
                        <ul className="dropdown">
                            <li onClick={() => handleNavigation("/sensors")}>
                                <FaRss className="dropdown-icon"/> Sensörler
                            </li>
                            <li onClick={() => handleNavigation("/sensor-definition")}>
                                <FaRss className="dropdown-icon"/> Sensör Tanımlama
                            </li>
                        </ul>
                    )}

                    <div className="menu" onClick={() => handleNavigation("/soilmoisturemap")}>
                        <FaHome className="menu-icon"/>
                        <span>Nem Haritası</span>
                    </div>

                    {!isPersonal && (
                        <>
                            <div className={`menu ${isUsersOpen ? 'open' : ''}`}
                                 onClick={() => setIsUsersOpen(!isUsersOpen)}>
                                <FaUser className="menu-icon"/>
                                <span>Kullanıcılar</span>
                            </div>
                            {isUsersOpen && (
                                <ul className="dropdown">
                                    {userRole?.role !== 'manager' && (
                                        <li onClick={() => handleNavigation('/users/managers')}>
                                            <FaUser className="dropdown-icon"/> Yöneticiler
                                        </li>
                                    )}
                                    <li onClick={() => handleNavigation('/users/personals')}>
                                        <FaUser className="dropdown-icon"/> Personeller
                                    </li>
                                </ul>
                            )}
                        </>
                    )}
                    {userRole?.role === 'administrator' && (
                        <div className="menu" onClick={() => handleNavigation("/companies")}>
                            <FaBuilding className="menu-icon"/>
                            <span>Kurumlar</span>
                        </div>
                    )}
                    {!isPersonal && (
                        <>
                            <div className={`menu ${isAddOpen ? 'open' : ''}`} onClick={() => setIsAddOpen(!isAddOpen)}>
                                <FaPlus className="menu-icon"/>
                                <span>Ekle</span>
                            </div>
                            {isAddOpen && (
                                <ul className="dropdown">
                                    {userRole?.role === 'administrator' && (
                                        <li onClick={() => handleNavigation('/register-manager', {role: 'manager'})}>
                                            <FaUser className="dropdown-icon"/> Yönetici Ekle
                                        </li>
                                    )}
                                    {(userRole?.role === 'manager' || user?.role === 'administrator') && (
                                        <li onClick={() => handleNavigation('/register-personal', {role: 'personal'})}>
                                            <FaUser className="dropdown-icon"/> Personel Ekle
                                        </li>
                                    )}
                                    {userRole?.role === 'administrator' && (
                                        <li onClick={() => handleNavigation('/add-company')}>
                                            <FaBuilding className="dropdown-icon"/> Kurum Ekle
                                        </li>
                                    )}
                                    {userRole?.role === 'administrator' && (
                                        <li onClick={() => handleNavigation('/add-sensor-type', {role: userRole.role})}>
                                            <FaTag className="dropdown-icon"/> Yeni Sensör Tipi Ekle
                                        </li>
                                    )}
                                    {(userRole?.role === 'manager' || userRole?.role === 'administrator') && (
                                        <li onClick={() => handleNavigation('/add-address')}>
                                            <FaMicrochip className="dropdown-icon"/> Sensör Ekle
                                        </li>
                                    )}
                                </ul>
                            )}
                        </>
                    )}
                    <div
                        className="logout menu" /* logout ve menu stillerini birleştir */
                        onClick={() => {
                            logout();
                            navigate("/login");
                        }}
                    >
                        <FaSignOutAlt className="menu-icon"/>
                        <span>Çıkış Yap</span>
                    </div>
                </div>
            </div>
        </>
    );
}
