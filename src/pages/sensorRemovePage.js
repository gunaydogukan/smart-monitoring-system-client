import React, { useState, useEffect, useCallback } from "react";
import { FaRss, FaPlus } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Toastify CSS
import styles from "../styles/Sensors_definitionPage.module.css";
import Layout from "../layouts/Layout";
import {sensorOwners,fetchSensorsByCompany,getUsersSensors} from "../services/sensorService";
import {useAuth} from "../contexts/AuthContext";
import {fetchCompanies as fetchCompanyList,fetchUsersByCompanyAndRole } from "../services/userServices";

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
                if(userRole.role ==="manager"){
                    const storedUser = JSON.parse(localStorage.getItem("user"));
                    if (storedUser && storedUser.companyCode) {
                        return setSelectedCompany(storedUser.companyCode); // Şirketi otomatik olarak ayarla
                    } else {
                        console.error("Manager rolü için companyCode bulunamadı!");
                    }
                }
                const data = await fetchCompanyList();
                setCompanies(data || []);
            } catch (error) {
                console.error("Şirket verisi çekilemedi:", error);
            }
        };

        fetchCompanies();
    }, []);

    // Kurumlara göre sensörleri ve kullanıcıları çekme...
    const fetchSensorsAndUsersByRole = useCallback(async () => {
        if (!selectedCompany || !selectedRole) return;

        try {
            // Sensörleri çek
            const sensorsData = await fetchSensorsByCompany(API_URL, selectedCompany);

            // Kullanıcıları çek
            const usersData = await fetchUsersByCompanyAndRole(API_URL, selectedCompany, selectedRole);

            if (userRole.role === "administrator") {
                setOriginalSensors(sensorsData.sensors || []); // Tüm sensörleri kaydet
            }

            let filteredUsers = usersData.users || [];
            if (userRole.role === "manager") {
                const storedUser = JSON.parse(localStorage.getItem("user"));
                const managerSensors = await sensorOwners(userRole.role, storedUser.id);
                filteredUsers = filteredUsers.filter(user => user.creator_id === storedUser.id);
                setOriginalSensors(managerSensors.sensors || []);
                setSensors(managerSensors.sensors || []);
                setActiveUsers(filteredUsers);
            } else {
                setSensors(sensorsData.sensors || []);
                setActiveUsers(filteredUsers);
            }
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
            const response = await fetch(`${API_URL}/api/remove-sensors`, {
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
            console.log(data);

            if (response.ok) {
                toast.success(data.message || "Sensörler başarıyla çıkartıldı!", {
                    position: "top-center",
                    autoClose: 3000,
                });
                setSelectedSensors([]);
                setSelectedUsers([]);
                setIsModalOpen(false);
            } else {
                toast.error(data.message || "Sensör çıkartma işlemi başarısız oldu.", {
                    position: "top-center",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error("Sensör .ıkartma sırasında hata:", error);
            toast.error("Sunucuyla bağlantı kurulamadı.", {
                position: "top-center",
                autoClose: 3000,
            });
        }
    };



    useEffect(() => {
        if (selectedUsers.length === 0) {
            setSensors(originalSensors); // Kullanıcı seçilmediyse tüm sensörleri göster
            return;
        }

        // Seçilen kullanıcıların bilgilerini al
        const selectedUserObjects = activeUsers.filter((user) =>
            selectedUsers.includes(user.id)
        );

        if (selectedUserObjects.length === 0) {
            setSensors([]); // Seçilen kullanıcılar bulunamazsa sensörleri temizle
            return;
        }

        // selectedUsers dizisini virgülle ayırarak bir string oluştur
        const userIds = selectedUsers.join(',');
        console.log("User IDs:", userIds); // User ID'lerini kontrol et

        // Kullanıcıların sensörlerini bul ve sadece ortak olanları al
        Promise.all(
            selectedUserObjects.map((user) => getUsersSensors(user.id)) // Her kullanıcı için sensör listesini al
        )
            .then((results) => {
                // Her bir kullanıcının sensör listesini al
                const sensorLists = results.map((res) => res.sensors || []);

                // Eğer sadece bir kullanıcı seçildiyse, onun sensörlerini direkt göster
                if (sensorLists.length === 1) {
                    setSensors(sensorLists[0]); // İlk ve tek sensör listesini güncelle
                    console.log("Tek kullanıcının sensörleri:", sensorLists[0]);
                    return;
                }

                // Birden fazla kullanıcı seçildiyse, ortak sensörleri bul
                const commonSensors = sensorLists.reduce((common, currentList) => {
                    return common.filter(sensor1 =>
                        currentList.some(sensor2 => sensor1.id === sensor2.id)
                    );
                });

                // Çıktı
                if (commonSensors.length > 0) {
                    console.log("Ortak sensörler:", commonSensors);
                    setSensors(commonSensors); // Ortak sensörlerle güncelle
                } else {
                    console.log("Ortak sensör bulunmamaktadır.");
                    setSensors([]); // Sensör listesini boş yap
                }
            })
            .catch((error) => {
                console.error("Sensör filtreleme hatası:", error);
                setSensors([]);  // Hata durumunda sensörleri temizle
            });
    }, [selectedUsers, selectedRole, activeUsers, originalSensors]);



    return (
        <Layout>
            <div className={styles.sensorsDefinitionPage}>
                <ToastContainer />

                <h1 className={styles.pageTitle}>Sensör Çıkart</h1>

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
                                <h3>Yöneticilerden Sensör Çıkart</h3>
                            </div>

                            <div
                                className={`${styles.card} ${styles.personalCard}`}
                                onClick={() => openModal("personal")}
                            >
                                <div className={`${styles.cardIcon} ${styles.fullHeight}`}>
                                    <FaRss />
                                    <FaPlus className={styles.plusIcon} />
                                </div>
                                <h3>Personellerden Sensör Çıkart</h3>
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
                            <h3>Personellerden Sensör Çıkart</h3>
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
                            {selectedUsers.length > 1 && sensors.length === 0 ? (
                                <p>Ortak sensör bulunmamaktadır.</p>
                            ) : (
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
                            )}
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
                                Çıkart
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </Layout>
    );
}
