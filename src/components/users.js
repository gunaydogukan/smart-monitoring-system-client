import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import styles from "../styles/Users.module.css";
import Layout from "../layouts/Layout";
import { useTheme } from "../contexts/ThemeContext";
import UpdateUserModal from "../components/UpdateUserModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Users() {
    const [companies, setCompanies] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [actionType, setActionType] = useState("");
    const { type } = useParams();
    const { isDarkMode } = useTheme();
    const [role, setRole] = useState("");
    const [undefinedUsersModalVisible, setUndefinedUsersModalVisible] = useState(false);
    const [undefinedUsers, setUndefinedUsers] = useState([]);
    const [activeManagers, setActiveManagers] = useState([]);
    const [selectedManager, setSelectedManager] = useState("");
    const [selectedPersonals, setSelectedPersonals] = useState([]);
    const [notificationUser,setNotificationUser] = useState("");
    const [notificationMessage, setNotificationMessage] = useState("");

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            setRole(user.role);
        }
        fetchCompanies();
        fetchDataByCompany(type);
    }, [type]);

    const fetchCompanies = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/companies", {
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

    const fetchDataByCompany = async (type, companyCode = "") => {
        try {
            const url = companyCode
                ? `http://localhost:5000/api/${type}?companyCode=${encodeURIComponent(
                    companyCode
                )}`
                : `http://localhost:5000/api/${type}`;

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                throw new Error("Veri çekme hatası");
            }

            const data = await response.json();
            setFilteredData(data || []);
        } catch (error) {
            console.error(`${type} verisi çekilemedi:`, error);
        }
    };

    const handleCompanyChange = (e) => {
        const companyCode = e.target.value;
        setSelectedCompany(companyCode);

        if (companyCode) {
            fetchDataByCompany(type, companyCode);
        } else {
            fetchDataByCompany(type);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredResults = filteredData.filter((person) => {
        const search = searchTerm.toLowerCase();
        if (role === "manager" && person.role !== "personal") return false;

        return (
            person.name.toLowerCase().includes(search) ||
            person.lastname.toLowerCase().includes(search) ||
            person.email.toLowerCase().includes(search) ||
            (person.companyCode
                ? person.companyCode.toLowerCase().includes(search)
                : "kurum yok".includes(search)) ||
            (person.isActive ? "aktif" : "pasif").includes(search)
        );
    });

    const handleModifyUserDetails = async (updatedUser) => {
        try {
            const response = await fetch(`http://localhost:5000/api/modifyuser`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(updatedUser),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Güncelleme sırasında bir hata oluştu."
                );
            }

            setModalVisible(false);
            setSelectedUser(null);
            fetchDataByCompany(type, selectedCompany); // Kullanıcı listesini güncellemek için çağrı
            toast.success("Kullanıcı başarıyla güncellendi.");
        } catch (error) {
            console.error("Güncelleme hatası:", error.message);
            toast.error(`Güncelleme sırasında bir hata oluştu: ${error.message}`);
        }
    };
    const handleAssignPersonals = async () => {
        if (!selectedManager) {
            toast.error("Lütfen bir manager seçin.");
            return;
        }
        if (selectedPersonals.length === 0) {
            toast.error("Lütfen en az bir personel seçin.");
            return;
        }


        try {
            const response = await fetch("http://localhost:5000/api/assign-personals", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    managerId: selectedManager,
                    personalIds: selectedPersonals,
                }),
            });

            if (!response.ok) {
                throw new Error("Atama işlemi sırasında bir hata oluştu.");
            }

            toast.success("Personeller başarıyla atandı.");
            setUndefinedUsers(undefinedUsers.filter(
                (user) => !selectedPersonals.includes(user.user.id)
            ));
            setSelectedPersonals([]);
            setUndefinedUsersModalVisible(false);
        } catch (error) {
            console.error("Atama işlemi sırasında hata:", error);
            toast.error("Personeller atanamadı.");
        }
    };

    const fetchUndefinedUsersAndManagers = async () => {
        if (!selectedCompany) {
            toast.error("Lütfen bir şirket seçin.");
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/company/${selectedCompany}/undefined-users-and-managers`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            const data = await response.json();

            // Sadece "personal" rolündeki kullanıcıları al
            const filteredUndefinedUsers = data.undefinedUsers.filter(
                (user) => user.user.role === "personal"
            );

            setUndefinedUsers(filteredUndefinedUsers); // Yalnızca "personal" rolündeki kullanıcılar
            setActiveManagers(data.activeManagers || []);
        } catch (error) {
            console.error("Undefined users veya active managers verisi çekilemedi:", error);
            toast.error("Veri çekme hatası.");
        }
    };

    const handleConfirmAction = (userId, action) => {
        setActionType(action);
        setSelectedUser(userId);
        setConfirmModalVisible(true);
    };

    const [relatedPersonals,setRelatedPersonals] = useState([]);

    const executeAction = async () => {
        try {
            const endpoint =
                actionType === "deactivate"
                    ? `http://localhost:5000/api/${selectedUser}/deactivate`
                    : `http://localhost:5000/api/${selectedUser}/activate`;

            const response = await fetch(endpoint, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
            }

            // Güncellenen kullanıcının ismi ve mesajını ayarla
            setNotificationUser(data.user?.name + " " + data.user?.lastname || "Kullanıcı");
            setNotificationMessage(data.notification || data.message);
            setRelatedPersonals(data.relatedPersonals || []);  // Bu kısım ilgili personelleri ayarlıyor

            // Undefined users listesi yeniden alınıyor
            fetchUndefinedUsersAndManagers();

            fetchDataByCompany(type, selectedCompany); // Şirket verilerini güncelle

        } catch (error) {
            console.error("İşlem hatası:", error.message);
            toast.error(`İşlem sırasında bir hata oluştu: ${error.message}`);
        } finally {
            setConfirmModalVisible(false);
            setSelectedUser(null);
        }
    };



    const handleUpdateClick = (user) => {
        setSelectedUser(user);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedUser(null);
    };

    return (
        <Layout>
            <div className={`${styles.container} ${isDarkMode ? styles.dark : ""}`}>
                <h2 className={`${styles.title} ${isDarkMode ? styles.darkTitle : ""}`}>
                    {type === "managers" ? " Managers" : " Personals"}
                </h2>

                <UpdateUserModal
                    modalVisible={modalVisible}
                    handleCloseModal={handleCloseModal}
                    selectedUser={selectedUser}
                    handleUpdateUser={handleModifyUserDetails} // handleUpdateUser fonksiyonu eklendi
                />

                <div className={styles.filterContainer}>
                    <select
                        className={`${styles.select} ${
                            isDarkMode ? styles.darkSelect : ""
                        }`}
                        value={selectedCompany}
                        onChange={handleCompanyChange}
                    >
                        <option value="">Tüm Şirketler</option>
                        {companies.map((company) => (
                            <option key={company.code} value={company.code}>
                                {company.name}
                            </option>
                        ))}
                    </select>
                    <div className={styles.searchContainer}>
                        <FaSearch className={styles.searchIcon}/>
                        <input
                            type="text"
                            className={`${styles.searchInput} ${
                                isDarkMode ? styles.darkInput : ""
                            }`}
                            placeholder="Ara"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>

                </div>
                {type === "personals" && (
                    <button
                        className={`${styles.actionButton} ${styles.undefinedButton}`}
                        onClick={() => {
                            if (!selectedCompany) {
                                toast.error("Lütfen bir şirket seçin.");
                                return;
                            }
                            fetchUndefinedUsersAndManagers();
                            setUndefinedUsersModalVisible(true);
                        }}
                    >
                        Tanımsız Personeller
                        {undefinedUsers.length > 0 && (
                            <span className={styles.notificationBadge}>{undefinedUsers.length}</span>
                        )}
                    </button>
                )}

                <div className={styles.tableContainer}>
                    {filteredResults.length > 0 ? (
                        <table
                            className={`${styles.table} ${
                                isDarkMode ? styles.darkTable : ""
                            }`}
                        >
                            <thead>
                            <tr>
                                <th>Ad</th>
                                <th>Soyad</th>
                                <th>E-posta</th>
                                <th>Şirket</th>
                                <th>Durum</th>
                                <th>Rol</th>
                                <th>İşlemler</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredResults.map((person) => (
                                <tr key={person.id}>
                                    <td>{person.name}</td>
                                    <td>{person.lastname}</td>
                                    <td>{person.email}</td>
                                    <td>{person.companyCode || "Kurum Yok"}</td>
                                    <td>
                      <span
                          className={
                              person.isActive
                                  ? styles.statusActive
                                  : styles.statusInactive
                          }
                      >
                        {person.isActive ? "Aktif" : "Pasif"}
                      </span>
                                    </td>
                                    <td>{person.role}</td>
                                    <td>
                                        <button
                                            className={`${styles.actionButton} ${styles.updateButton}`}
                                            onClick={() => handleUpdateClick(person)}
                                        >
                                            Güncelle
                                        </button>
                                        <button
                                            className={`${styles.actionButton} ${
                                                person.isActive
                                                    ? styles.deleteButton
                                                    : styles.activateButton
                                            }`}
                                            onClick={() =>
                                                handleConfirmAction(
                                                    person.id,
                                                    person.isActive ? "deactivate" : "activate"
                                                )
                                            }
                                        >
                                            {person.isActive ? "Pasif Yap" : "Aktif Yap"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className={styles.message}>
                            Bu şirkete ait {type === "managers" ? "yönetici" : "personel"}{" "}
                            bulunamadı.
                        </p>
                    )}
                </div>

                {confirmModalVisible && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <p>
                                {actionType === "deactivate"
                                    ? "Bu kullanıcıyı pasif yapmak istediğinize emin misiniz?"
                                    : "Bu kullanıcıyı aktif yapmak istediğinize emin misiniz?"}
                            </p>
                            <div className={styles.modalActions}>
                                <button
                                    className={`${styles.actionButton} ${styles.deleteButton}`}
                                    onClick={() => setConfirmModalVisible(false)}
                                >
                                    İptal
                                </button>
                                <button
                                    className={`${styles.actionButton} ${styles.updateButton}`}
                                    onClick={executeAction}
                                >
                                    Onayla
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {notificationMessage && (
                    <div className={styles.notificationOverlay}>
                        <div className={styles.notificationModal}>
                            <h3 className={styles.notificationTitle}>Bilgilendirme</h3>
                            <p className={styles.notificationText}>
                                Kullanıcı <strong className={styles.notificationHighlight}>{notificationUser}</strong> {notificationMessage}
                            </p>
                            {relatedPersonals && relatedPersonals.length > 0 && (
                                <p className={styles.notificationInstruction}>
                                    Ona bağlı personeller (
                                    <strong className={styles.notificationHighlight}>{relatedPersonals.length}</strong>)
                                    yeni managerlere atanmayı bekliyor. <br />
                                    Personeller için <strong>"Kullanıcılar > Personals > Tanımsız Personeller"</strong> sekmesine gidin.
                                </p>
                            )}
                            <button
                                className={styles.notificationButton}
                                onClick={() => {
                                    setNotificationMessage("");
                                    setRelatedPersonals([]);
                                }}
                            >
                                Tamam
                            </button>
                        </div>
                    </div>
                )}



                {undefinedUsersModalVisible && (
                    <div className={styles.modalOverlay}>
                <div className={styles.undefinedUsersModal}>
                    <h3>Tanımsız Personelleri Atama</h3>
                    <div className={styles.undefinedUsersDropdown}>
                        <label htmlFor="manager-select">Aktif Manager Seç:</label>
                        <select
                            id="manager-select"
                            value={selectedManager}
                            onChange={(e) => setSelectedManager(e.target.value)}
                        >
                            <option value="">Manager Seç</option>
                            {activeManagers.map((manager) => (
                                <option key={manager.id} value={manager.id}>
                                    {manager.name} {manager.lastname}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.undefinedUsersContainer}>
                        {undefinedUsers.filter((undefinedUser) => undefinedUser.user.role === "personal").length > 0 ? (
                            <table className={styles.undefinedUsersTable}>
                                <thead>
                                <tr>
                                    <th>Seç</th>
                                    <th>Ad</th>
                                    <th>Soyad</th>
                                    <th>Email</th>
                                </tr>
                                </thead>
                                <tbody>
                                {undefinedUsers
                                    .filter((undefinedUser) => undefinedUser.user.role === "personal")
                                    .map((undefinedUser) => (
                                        <tr key={undefinedUser.user.id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    value={undefinedUser.user.id}
                                                    onChange={(e) => {
                                                        const isChecked = e.target.checked;
                                                        setSelectedPersonals((prev) =>
                                                            isChecked
                                                                ? [...prev, undefinedUser.user.id]
                                                                : prev.filter((id) => id !== undefinedUser.user.id)
                                                        );
                                                    }}
                                                />
                                            </td>
                                            <td>{undefinedUser.user.name}</td>
                                            <td>{undefinedUser.user.lastname}</td>
                                            <td>{undefinedUser.user.email}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className={styles.undefinedUsersEmpty}>Pasif personel bulunamadı.</p>
                        )}
                    </div>
                    <div className={styles.modalActions}>
                        <button
                            className={`${styles.modalButton} ${styles.cancel}`}
                            onClick={() => setUndefinedUsersModalVisible(false)}
                        >
                            İptal
                        </button>
                        <button
                            className={`${styles.modalButton} ${styles.assign}`}
                            onClick={handleAssignPersonals}
                            disabled={!selectedManager || selectedPersonals.length === 0}
                        >
                            Atama Yap
                        </button>
                    </div>
                </div>
            </div>
            )}

            <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={true}
                    closeOnClick
                    pauseOnHover
                    draggable
                    theme={isDarkMode ? "dark" : "light"}
                />
            </div>
        </Layout>
    );
}
