import React, { useState, useEffect ,useCallback } from "react";
import { useParams ,useLocation } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import styles from "../styles/Users.module.css";
import Layout from "../layouts/Layout";

import UpdateUserModal from "../components/UpdateUserModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Users() {
    const API_URL = process.env.REACT_APP_API_URL;

    const location = useLocation();
    const { type } = useParams();
    const [companies, setCompanies] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [actionType, setActionType] = useState("");

    const [role, setRole] = useState("");
    const [undefinedUsersModalVisible, setUndefinedUsersModalVisible] = useState(false);
    const [undefinedUsers, setUndefinedUsers] = useState([]);
    const [activeManagers, setActiveManagers] = useState([]);
    const [selectedManager, setSelectedManager] = useState("");
    const [selectedPersonals, setSelectedPersonals] = useState([]);
    const [notificationUser,setNotificationUser] = useState("");
    const [notificationMessage, setNotificationMessage] = useState("");
    const [undefinedCount, setUndefinedCount] = useState(0); // Tanımsız personel sayısını tutar
    const [filteredManagers, setFilteredManagers] = useState([]); // Filtrelenmiş yöneticiler


    const [changeManagerModalVisible, setChangeManagerModalVisible] = useState(false);
    const [selectedPersonalForManagerChange, setSelectedPersonalForManagerChange] = useState(null);

    //global olarak tanımlandı...
    const usr = JSON.parse(localStorage.getItem("user"));

    const fetchUndefinedUsersAndManagers = useCallback(async (companyCode) => {
        const currentCompany = companyCode || selectedCompany;
        try {
            const url = currentCompany
                ? `${API_URL}/api/company/${currentCompany}/undefined-users-and-managers`
                : `${API_URL}/api/users/undefined-users-and-managers`;

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                throw new Error("Veri çekme hatası.");
            }

            const data = await response.json();

            if (currentCompany) {
                console.log("seçili şirket alt personel filtreleme");
                // Şirket seçildiyse sadece o şirkete ait personelleri filtrele
                const filteredUndefinedUsers = data.undefinedUsers.filter(
                    (user) => user.user.role === "personal" && user.user.companyCode === currentCompany
                );
                setUndefinedUsers(filteredUndefinedUsers);
                setUndefinedCount(filteredUndefinedUsers.length);
            } else {
                console.log("şirket seçili değil tüm personeller ");
                // Tüm şirketler seçiliyse tüm personelleri alın
                const allUndefinedUsers = data.undefinedUsers.filter(
                    (user) => user.user.role === "personal"
                );
                setUndefinedUsers(allUndefinedUsers);
                setUndefinedCount(allUndefinedUsers.length);
            }

            setActiveManagers(data.activeManagers || []);
        } catch (error) {
            console.error("Undefined users veya active managers verisi çekilemedi:", error);
            toast.error("Veri çekme hatası.");
        }
    }, [selectedCompany]);

    const fetchCompanies = async () => {
        try {
            if(usr.role==="manager"){
                //Kullanıcı manager olduğu için direkt olarak kullanıcnın companyCoduna göre işlemi yaoar.
                handleCompanyChange(usr.companyCode);
                setSelectedManager(usr.id);
                return;
            }
            const response = await fetch(`${API_URL}/api/companies`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await response.json();
            console.log(data);
            setCompanies(data || []);
        } catch (error) {
            console.error("Şirket verisi çekilemedi:", error);
        }
    };

    const fetchDataByCompany = async (type, companyCode = "") => {
        try {
            let usr_id = null
            if(usr.role==="manager"){
                companyCode =usr.companyCode;
                usr_id = usr.id;
            }

            const url = companyCode
                ? `${API_URL}/api/${type}?companyCode=${encodeURIComponent(
                    companyCode
                )}`
                : `${API_URL}/api/${type}`;

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                throw new Error("Veri çekme hatası");
            }

            let data = await response.json();

            //ilgili manager sadece kendi managerlerini görür
            if(usr.role==="manager"){
                console.log("ilk gelen data =",data);
                const personal = data.filter((index)=>index.creator_id===usr_id );
                data = personal;
            }

            console.log(companyCode," şirketinin personelleri = ",data);


            setFilteredData(data || []);

        } catch (error) {
            console.error(`${type} verisi çekilemedi:`, error);
        }
    };

    const handleCompanyChange = (e) => {
        let companyCode;
        //companycode değiştirme alanı

        //e.target varsa bir DOM olayı olur
        if (e && e.target) {
            companyCode = e.target.value;
        } else {
            companyCode = usr.companyCode; // Eğer e bir string ise doğrudan companyCode olarak ata
        }
        console.log("company code değişkeni değiştirlid = ",companyCode);
        setSelectedCompany(companyCode);

        if (companyCode) {
            fetchDataByCompany(type, companyCode); // Şirket verilerini getir
            fetchUndefinedUsersAndManagers(companyCode); // Tanımsız personelleri getir
        } else {
            fetchDataByCompany(type); // Tüm şirketler için verileri getir
            fetchUndefinedUsersAndManagers(); // Tüm şirketler için tanımsızları getir
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
            const response = await fetch(`${API_URL}/api/modifyuser`, {
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
            toast.error("Lütfen bir Yönetici seçin.");
            return;
        }
        if (selectedPersonals.length === 0) {
            toast.error("Lütfen en az bir personel seçin.");
            return;
        }


        try {
            const response = await fetch(`${API_URL}/api/assign-personals`, {
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
                    ? `${API_URL}/api/${selectedUser}/deactivate`
                    : `${API_URL}/api/${selectedUser}/activate`;

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

            // Güncellenen kullanıcı için bilgilendirme
            setNotificationUser(data.user?.name + " " + data.user?.lastname || "Kullanıcı");
            setNotificationMessage(data.notification || data.message);
            setRelatedPersonals(data.relatedPersonals || []); // Bağlı personelleri al

            // Eğer kullanıcı pasif hale getirildiyse sensör işlemleri API'sini çağır
            if (actionType === "deactivate") {
                console.log(selectedUser);
                console.log(data.user.role);
                try {
                    const sensorResponse = await fetch(`${API_URL}/api/user/sensor-operations`, {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            userId: selectedUser,
                            role: data.user.role,
                            companyCode:data.user.companyCode
                        }),
                    });

                    if (!sensorResponse.ok) {
                        throw new Error("Sensör işlemleri sırasında bir hata oluştu.");
                    }

                    const sensorData = await sensorResponse.json();
                    console.log("Sensör işlemleri tamamlandı:", sensorData.message);
                } catch (sensorError) {
                    console.error("Sensör işlemleri hatası:", sensorError.message);
                    //toast.error("Sensör işlemleri sırasında bir hata oluştu.");
                }
            }

            // Veri yenileme
            fetchDataByCompany(type, selectedCompany); // Şirket verilerini güncelle
            toast.success(data.notification || "İşlem başarıyla tamamlandı.");
        } catch (error) {
            console.error("İşlem hatası:", error.message);
            toast.error(`İşlem sırasında bir hata oluştu: ${error.message}`);
        } finally {
            setConfirmModalVisible(false);
            setSelectedUser(null);
        }
    };
    const handleAssignNewManager = async () => {
        if (!selectedManager || !selectedPersonalForManagerChange) {
            toast.error("Lütfen bir yönetici seçin.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/assign-manager`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    personalId: selectedPersonalForManagerChange.id,
                    managerId: selectedManager,
                }),
            });

            if (!response.ok) {
                throw new Error("Yönetici değiştirme işlemi sırasında bir hata oluştu.");
            }

            toast.success("Yönetici başarıyla değiştirildi.");
            closeChangeManagerModal(); // Modalı kapat
            fetchDataByCompany(type, selectedCompany); // Tabloyu güncelle
        } catch (error) {
            console.error("Yönetici değiştirme hatası:", error);
            toast.error("Yönetici atanamadı.");
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

    const openChangeManagerModal = (personal) => {
        const filteredManagers = activeManagers.filter(
            (manager) =>
                manager.companyCode === personal.companyCode && // Aynı şirkete ait yöneticiler
                manager.id !== personal.creator_id // Mevcut yöneticiyi hariç tut
        );
        setFilteredManagers(filteredManagers); // Filtrelenmiş yöneticileri state'e ata
        setSelectedPersonalForManagerChange(personal); // Seçilen personeli state'e ata
        setChangeManagerModalVisible(true); // Modalı görünür yap
    };

    const closeChangeManagerModal = () => {
        setSelectedPersonalForManagerChange(null);
        setChangeManagerModalVisible(false); // Modalı kapat
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log(usr);

                if (usr) {
                    setRole(usr.role); // rolü ayarla
                }

                fetchCompanies();
                fetchDataByCompany(type);
            } catch (err) {
                console.error("Hata fetchData içinde:", err.message);
            }
        };

        fetchData();
    }, [type]);

    useEffect(() => {
        fetchUndefinedUsersAndManagers(selectedCompany);
    }, [selectedCompany, fetchUndefinedUsersAndManagers]);

    useEffect(() => {
        if (location.state?.reload) {
            fetchDataByCompany(type, selectedCompany);
            fetchUndefinedUsersAndManagers(selectedCompany);
        }
    }, [type, selectedCompany, location.state?.reload, fetchUndefinedUsersAndManagers]);

    useEffect(() => {
        setUndefinedCount(undefinedUsers.length);
    }, [undefinedUsers]);

    return (
        <Layout>
            <div className={styles.container}>
                <h2 className={styles.title}>
                    {type === "managers" ? " Yöneticiler" : " Personeller"}
                </h2>


            <UpdateUserModal
                modalVisible={modalVisible}
                handleCloseModal={handleCloseModal}

                    selectedUser={selectedUser}
                    handleUpdateUser={handleModifyUserDetails}
                />

                <div className={styles.filterContainer}>
                    {role === "administrator" ? (
                        <select
                            className={`${styles.select}`}
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
                    ) : null}
                    <div className={styles.searchContainer}>
                        <FaSearch className={styles.searchIcon}/>
                        <input
                            type="text"
                            className={`${styles.searchInput}`}
                            placeholder="Ara"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>

                </div>

                {type === "personals" && (
                    <button
                        className={`${styles.actionButtonUsers} ${styles.undefinedButtonUsers}`}
                        onClick={() => {
                            if (!selectedCompany) {
                                toast.error("Lütfen bir kurum seçin.");  {/* Kurum seçilmeden bildirim göster */}
                            } else {
                                fetchUndefinedUsersAndManagers(selectedCompany); {/* Seçilen şirket için verileri çek */}
                                setUndefinedUsersModalVisible(true); {/* Modalı aç */}
                            }
                        }}
                    >
                        Tanımsız Personeller
                        {undefinedCount > 0 && (
                            <span className={styles.notificationBadge}>{undefinedCount}</span>
                        )}
                    </button>
                )}
                <div className={styles.tableContainer}>
                    {filteredResults.length > 0 ? (
                        <table
                            className={`${styles.table} `}
                        >
                            <thead>
                            <tr>
                                <th>Ad</th>
                                <th>Soyad</th>
                                <th>E-posta</th>
                                <th>Şirket</th>
                                <th>Durum</th>
                                {type === "personals" && <th>Yönetici</th>}
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
                                    {type === "personals" && (
                                        <td>
                                            {activeManagers.find((manager) => manager.id === person.creator_id)
                                                ? `${activeManagers.find((manager) => manager.id === person.creator_id).name} ${activeManagers.find((manager) => manager.id === person.creator_id).lastname}`
                                                : "Atanmamış"}
                                        </td>
                                    )}
                                    <td>
                                        <div className={styles.buttonContainer}>
                                            <button
                                                className={`${styles.updateButton}`}
                                                onClick={() => handleUpdateClick(person)}
                                            >
                                                Güncelle
                                            </button>
                                            <button
                                                className={`${
                                                    person.isActive ? styles.deleteButton : styles.activateButton
                                                }`}
                                                onClick={() =>
                                                    handleConfirmAction(person.id, person.isActive ? "deactivate" : "activate")
                                                }
                                            >
                                                {person.isActive ? "Pasif Yap" : "Aktif Yap"}
                                            </button>
                                            {type === "personals" && (
                                                <button
                                                    onClick={() => openChangeManagerModal(person)}
                                                >
                                                    Yönetici Değiştir
                                                </button>
                                            )}
                                        </div>
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
                                Kullanıcı <strong
                                className={styles.notificationHighlight}>{notificationUser}</strong> {notificationMessage}
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
                                <label htmlFor="manager-select">Aktif Yönetici Seç:</label>
                                <select
                                    id="manager-select"
                                    value={usr.role === "manager" ? parseInt(usr.id, 10) : selectedManager}
                                    // Eğer giriş yapan kişi manager ise kendi id'si seçili olur
                                    onChange={(e) => setSelectedManager(e.target.value)}
                                    disabled={usr.role === "manager"} // Eğer giriş yapan kişi manager ise değiştirme engellenir
                                >
                                    {usr.role !== "manager" && (
                                        <option value="">Yönetici Seç</option>
                                    )}
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
                                            <th>
                                                <input
                                                    type="checkbox"
                                                    onChange={(e) => {
                                                        const isChecked = e.target.checked;
                                                        if (isChecked) {
                                                            {/* Tüm undefinedUser'ların id'lerini seç */
                                                            }
                                                            setSelectedPersonals(undefinedUsers.map((u) => u.user.id));
                                                        } else {
                                                            {/* Tüm seçimleri kaldır */
                                                            }
                                                            setSelectedPersonals([]);
                                                        }
                                                    }}
                                                    checked={
                                                        selectedPersonals.length > 0 &&
                                                        selectedPersonals.length ===
                                                        undefinedUsers.filter((u) => u.user.role === "personal").length
                                                    }
                                                />
                                            </th>
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
                                                            checked={selectedPersonals.includes(undefinedUser.user.id)}
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
                                    <div className={styles.undefinedUsersEmptyContainer}>
                                        <p className={styles.undefinedUsersEmpty}>
                                            <strong> Tanımsız personel bulunamadı. </strong>
                                        </p>
                                    </div>
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
                {changeManagerModalVisible && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.changeManagerModal}>
                            <h3>Yönetici Değiştir</h3>
                            <p>
                                <strong>{selectedPersonalForManagerChange?.name} {selectedPersonalForManagerChange?.lastname}</strong> adlı
                                personelin
                                yeni yöneticisini seçin.
                            </p>
                            <div className={styles.changeManagerDropdown}>
                                <label htmlFor="manager-select">Yeni Yönetici Seç:</label>
                                <select
                                    id="manager-select"
                                    value={selectedManager}
                                    onChange={(e) => setSelectedManager(e.target.value)}
                                >
                                    <option value="">Yönetici Seç</option>
                                    {filteredManagers.map((manager) => (
                                        <option key={manager.id} value={manager.id}>
                                            {manager.name} {manager.lastname}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.modalActions}>
                                <button
                                    className={`${styles.modalButton} ${styles.cancel}`}
                                    onClick={closeChangeManagerModal}
                                >
                                    İptal
                                </button>
                                <button
                                    className={`${styles.modalButton} ${styles.assign}`}
                                    onClick={handleAssignNewManager}
                                    disabled={!selectedManager}
                                >
                                    Yönetici Değiştir
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

                />
            </div>
        </Layout>
    );
}
