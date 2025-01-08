import React, { useState, useEffect, useCallback } from "react";
import { FaRss, FaPlus } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Toastify CSS
import styles from "../styles/Sensors_definitionPage.module.css";
import Layout from "../layouts/Layout";
import {sensorOwners} from "../services/sensorService";
import {useAuth} from "../contexts/AuthContext";

export default function SensorsDefinitionPage() {
    const API_URL = process.env.REACT_APP_API_URL;

    const { user,userRole } = useAuth();
    const [selectedCompany, setSelectedCompany] = useState(""); // Seçilen kurum
    const [companies, setCompanies] = useState([]); // Kurumlar
    const [sensors, setSensors] = useState([]); // Kuruma ait sensörler
    const [activeUsers, setActiveUsers] = useState([]); // Aktif kullanıcılar (manager veya personal)
    const [selectedSensors, setSelectedSensors] = useState([]); // Seçilen sensörler
    const [selectedUsers, setSelectedUsers] = useState([]); // Seçilen kullanıcılar
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal görünürlük durumu
    //const [userRole, setUserRole] = useState(""); // Kullanıcı rolü
    const [selectedRole, setSelectedRole] = useState(""); // Modal için hedef role (manager veya personal)

    const [originalSensors, setOriginalSensors] = useState([]);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                console.log(userRole.role);
                //setUserRole(user.role); // Kullanıcı rolünü ayarla
            } catch (error) {
                console.error("LocalStorage'daki kullanıcı verisi okunamadı:", error);
            }
        }
    }, [user]);

    // Kurumları API'den çekme
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await fetch(`${API_URL}/api/companies`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                const data = await response.json();
                setCompanies(data || []);
            } catch (error) {
                console.error("Şirket verisi çekilemedi:", error);
            }
        };

        fetchCompanies();
    }, []);

    // Sensörleri ve kullanıcıları çekme
    const fetchSensorsAndUsersByRole = useCallback(async () => {
        if (!selectedCompany || !selectedRole) return;

        try {
            const sensorsResponse = await fetch(`${API_URL}/api/company/${selectedCompany}/sensors`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            const usersResponse = await fetch(`${API_URL}/api/company/${selectedCompany}/users?role=${selectedRole}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!sensorsResponse.ok || !usersResponse.ok) {
                throw new Error("Veri çekme hatası.");
            }

            let sensorsData = await sensorsResponse.json();
            if(userRole.role==="administrator"){
                setOriginalSensors(sensorsData.sensors); // Tam listeyi de saklıyoruz
            }

            const usersData = await usersResponse.json();

            let filteredUsers = usersData.users;
            if (userRole.role === "manager") {
                const storedUser = JSON.parse(localStorage.getItem("user"));
                sensorsData = await sensorOwners(userRole.role,storedUser.id);
                filteredUsers = usersData.users.filter(user => user.creator_id === storedUser.id);
                setOriginalSensors(sensorsData.sensors);
                setSensors(sensorsData.sensors); // Sensörleri güncelle
                setActiveUsers(filteredUsers);   // Kullanıcıları güncelle
            } //Eğer kullanıcı manager ise o managerin personelleri gelir ve maangerin sensörleri gelir.

            setSensors(sensorsData.sensors); // Sensörleri state'e kaydet
            setActiveUsers(filteredUsers);  // Kullanıcıları state'e kaydet
        } catch (error) {
            console.error("Veri çekme hatası:", error);
        }
    }, [selectedCompany, selectedRole]);

    useEffect(() => {
        fetchSensorsAndUsersByRole();
    }, [selectedCompany, selectedRole, fetchSensorsAndUsersByRole]);

    const openModal = (role) => {
        if (!selectedCompany) {
            toast.error("Lütfen bir kurum seçin!", {
                position: "top-center",
                autoClose: 2500,
            });
            return;
        }
        setSelectedSensors([]); // Seçilen sensörleri sıfırla
        setSelectedUsers([]); // Seçilen kullanıcıları sıfırla
        setSelectedRole(role); // Yeni role ayarla (manager veya personal)
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRole(""); // Modal kapandığında role temizlenir
    };

    const handleSelectAllSensors = () => {
        setSelectedSensors(sensors.length === selectedSensors.length ? [] : sensors.map((sensor) => sensor.id));
    };

    const handleSelectAllUsers = () => {
        setSelectedUsers(activeUsers.length === selectedUsers.length ? [] : activeUsers.map((user) => user.id));
    };

    const handleAssign = async () => {
        if (selectedSensors.length === 0 || selectedUsers.length === 0) {
            toast.error("Lütfen hem sensör hem de kullanıcı seçin!", {
                position: "top-center",
                autoClose: 3000,
            });
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/assign-random-sensors`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    sensorIds: selectedSensors,
                    userIds: selectedUsers,
                    role: selectedRole, // Role bilgisini gönderiyoruz
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || "Sensörler başarıyla tanımlandı!", {
                    position: "top-center",
                    autoClose: 3000,
                });
                setSelectedSensors([]);
                setSelectedUsers([]);
                setIsModalOpen(false);
            } else {
                toast.error(data.message || "Tanımlama işlemi başarısız oldu.", {
                    position: "top-center",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error("Tanımlama sırasında hata:", error);
            toast.error("Sunucuyla bağlantı kurulamadı.", {
                position: "top-center",
                autoClose: 3000,
            });
        }
    };
    const usrRole = userRole.role
    const filterSensorsByCreatorPersonal = async (usrRole, userId) => {
        try {
            const response = await sensorOwners(usrRole, userId);
            return response.sensors || [];
        } catch (error) {
            console.error("Sensör filtreleme hatası:", error);
            return [];
        }
    };


    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (userRole.role === "manager") {
                    setSelectedCompany(user.companyCode || ""); // Manager için varsayılan şirket
                }
            } catch (error) {
                console.error("LocalStorage'daki kullanıcı verisi okunamadı:", error);
            }
        }
    }, [userRole.role]);

    useEffect(() => {
        if (selectedUsers.length === 0) {
            setSensors(originalSensors); // Kullanıcı seçilmediyse tüm sensörler
            return;
        }

        if (userRole.role === "administrator" && selectedRole === "personal") {
            const selectedUserId = selectedUsers[0];
            const selectedUser = activeUsers.find((u) => u.id === selectedUserId);

            if (selectedUser && selectedUser.creator_id) {
                filterSensorsByCreatorPersonal(userRole.role, selectedUser.creator_id)
                    .then((filteredSensors) => {
                        setSensors(filteredSensors);
                    })
                    .catch((error) => {
                        console.error("Sensör filtreleme hatası:", error);
                        setSensors([]);
                    });
            } else {
                setSensors([]);
            }
        } else if (userRole.role === "administrator" && selectedRole === "manager") {
            setSensors(originalSensors); // Manager seçiliyken filtreleme yok
        } else if (userRole.role === "manager") {
            const selectedUserId = selectedUsers[0];
            const selectedUser = activeUsers.find((u) => u.id === selectedUserId);

            if (selectedUser && selectedUser.creator_id) {
                filterSensorsByCreatorPersonal(userRole.role, selectedUser.creator_id)
                    .then((filteredSensors) => {
                        setSensors(filteredSensors);
                    })
                    .catch((error) => {
                        console.error("Manager sensör filtreleme hatası:", error);
                        setSensors([]);
                    });
            } else {
                setSensors([]);
            }
        }
    }, [selectedUsers, userRole.role, selectedRole, activeUsers, originalSensors]);

    return (
        <Layout>
            <div className={styles.sensorsDefinitionPage}>
                <ToastContainer />

                <h1 className={styles.pageTitle}>Sensör Tanımla</h1>

                {(userRole.role === "administrator" || userRole.role === "manager") && (
                    <div className={styles.institutionSelect}>
                        <select
                            className={styles.select}
                            value={selectedCompany}
                            onChange={(e) => {
                                setSelectedCompany(e.target.value); // Şirketi güncelle
                                setSelectedSensors([]); // Seçilen sensörleri sıfırla
                                setSelectedUsers([]); // Seçilen kullanıcıları sıfırla
                                setIsModalOpen(false); // Modalı kapalı hale getir
                                setSelectedRole(""); // Role sıfırla
                            }}
                            disabled={userRole.role === "manager"} // Eğer kullanıcı manager ise seçim yapılamaz
                        >
                            {userRole.role === "administrator" ? (
                                <>
                                    <option value="">Kurum Seçin</option>
                                    {companies.map((company) => (
                                        <option key={company.code} value={company.code}>
                                            {company.name}
                                        </option>
                                    ))}
                                </>
                            ) : (
                                // Manager için yalnızca kendi kurumunun adı
                                <option value={selectedCompany}>
                                    {companies.find((company) => company.code === selectedCompany)?.name || "Kurumunuz"}
                                </option>
                            )}
                        </select>
                    </div>
                )}

                <div className={styles.mainContent}>
                    {userRole.role === "administrator" && (
                        <>
                            <div
                                className={`${styles.card} ${styles.managerCard}`}
                                onClick={() => openModal("manager")}
                            >
                                <div className={`${styles.cardIcon} ${styles.fullHeight}`}>
                                    <FaRss />
                                    <FaPlus className={styles.plusIcon} />
                                </div>
                                <h3>Managerlere Sensör Tanımla</h3>
                            </div>

                            <div
                                className={`${styles.card} ${styles.personalCard}`}
                                onClick={() => openModal("personal")}
                            >
                                <div className={`${styles.cardIcon} ${styles.fullHeight}`}>
                                    <FaRss />
                                    <FaPlus className={styles.plusIcon} />
                                </div>
                                <h3>Personellere Sensör Tanımla</h3>
                            </div>
                        </>
                    )}

                    {userRole.role === "manager" && (
                        <div
                            className={`${styles.card} ${styles.personalCard}`}
                            onClick={() => openModal("personal")}
                        >
                            <div className={`${styles.cardIcon} ${styles.fullHeight}`}>
                                <FaRss />
                                <FaPlus className={styles.plusIcon} />
                            </div>
                            <h3>Personellere Sensör Tanımla</h3>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <button className={styles.closeButton} onClick={closeModal}>
                            X
                        </button>
                        <h2>
                            {selectedCompany} Şirketi Sensörler
                            ve {selectedRole === "manager" ? "Managerler" : "Personeller"}
                        </h2>

                        {/* Kullanıcılar Tablosu */}
                        <div className={styles.tableContainer}>
                            <h3>Aktif {selectedRole === "manager" ? "Managerler" : "Personeller"}</h3>
                            <table>
                                <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.length === activeUsers.length}
                                            onChange={handleSelectAllUsers}
                                        />
                                        Seç
                                    </th>
                                    <th>Ad</th>
                                    <th>Soyad</th>
                                    {selectedRole === "personal" && <th>Manager</th>} {/* Personal için Manager sütunu */}
                                </tr>
                                </thead>
                                <tbody>
                                {activeUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            {/* ADMİN PERSONELE SENSÖR ATARKEN ÖZELLEŞTİRİLDİ... */}
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user.id)}
                                                disabled={
                                                    userRole.role === "administrator" &&
                                                    selectedRole === "personal" && // Sadece personel atamada geçerli
                                                    selectedUsers.length > 0 &&
                                                    user.creator_id !== activeUsers.find((u) => u.id === selectedUsers[0])?.creator_id
                                                }
                                                onChange={() => {
                                                    setSelectedUsers((prevSelectedUsers) => {
                                                        if (prevSelectedUsers.includes(user.id)) {
                                                            // Kullanıcıyı kaldır
                                                            return prevSelectedUsers.filter((id) => id !== user.id);
                                                        } else {
                                                            // Kullanıcıyı ekle
                                                            return [...prevSelectedUsers, user.id];
                                                        }
                                                    });
                                                }}


                                            />

                                        </td>
                                        <td>{user.name}</td>
                                        <td>{user.lastname}</td>
                                        {selectedRole === "personal" && (
                                            <td>
                                                {user.manager
                                                    ? `${user.manager.name} ${user.manager.lastname}`
                                                    : "Yönetici Yok"}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Sensörler Tablosu */}
                        <div className={styles.tableContainer}>
                            <h3>Kuruma Ait Sensörler</h3>
                            <table>
                                <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            checked={selectedSensors.length === sensors.length}
                                            onChange={handleSelectAllSensors}
                                        />
                                        Seç
                                    </th>
                                    <th>Sensor Adı</th>
                                    <th>Sensör Tipi</th>
                                </tr>
                                </thead>
                                <tbody>
                                {sensors.map((sensor) => (
                                    <tr key={sensor.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedSensors.includes(sensor.id)}
                                                onChange={() =>
                                                    setSelectedSensors((prev) =>
                                                        prev.includes(sensor.id)
                                                            ? prev.filter((id) => id !== sensor.id)
                                                            : [...prev, sensor.id]
                                                    )
                                                }
                                            />
                                        </td>
                                        <td>{sensor.name}</td>
                                        <td>{sensor.typeName}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Seçilen Öğeler */}
                        <div>
                            <h3>Seçilen Sensörler:</h3>
                            <div className={styles.selectedListContainer}>
                                <ul>
                                    {selectedSensors.map((id) => {
                                        const sensor = sensors.find((sensor) => sensor.id === id);
                                        return <li key={id}>{sensor?.name}</li>;
                                    })}
                                </ul>
                            </div>

                            <h3>Seçilen {selectedRole === "manager" ? "Managerler" : "Personeller"}:</h3>
                            <div className={styles.selectedListContainer}>
                                <ul>
                                    {selectedUsers.map((id) => {
                                        const user = activeUsers.find((user) => user.id === id);
                                        return <li key={id}>{user?.name} {user?.lastname}</li>;
                                    })}
                                </ul>
                            </div>
                        </div>

                        <div className={styles.actionContainer}>
                            <button className={styles.assignButton} onClick={handleAssign}>
                                Tanımla
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </Layout>
    );
}
