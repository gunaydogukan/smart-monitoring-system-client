import React, { useState, useEffect, useCallback } from "react";
import { FaRss, FaPlus } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Toastify CSS
import styles from "../styles/Sensors_definitionPage.module.css";
import Layout from "../layouts/Layout";

export default function SensorsDefinitionPage() {
    const [selectedCompany, setSelectedCompany] = useState(""); // Seçilen kurum
    const [companies, setCompanies] = useState([]); // Kurumlar
    const [sensors, setSensors] = useState([]); // Kuruma ait sensörler
    const [activeManagers, setActiveManagers] = useState([]); // Aktif yöneticiler
    const [selectedSensors, setSelectedSensors] = useState([]); // Seçilen sensörler
    const [selectedManagers, setSelectedManagers] = useState([]); // Seçilen yöneticiler
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal görünürlük durumu
    const [error] = useState('');

    // API'den kurumları çekme
    useEffect(() => {
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

        fetchCompanies(); // Kurumları al
    }, []);

    // API'den sensörler ve yöneticiler verisini çekme
    const fetchSensorsAndManagers = useCallback(async () => {
        if (!selectedCompany) return;

        try {
            const sensorsResponse = await fetch(`http://localhost:5000/api/company/${selectedCompany}/sensors`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            const managersResponse = await fetch(`http://localhost:5000/api/company/${selectedCompany}/managers`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!sensorsResponse.ok || !managersResponse.ok) {
                throw new Error("Veri çekme hatası.");
            }

            const sensorsData = await sensorsResponse.json();
            const managersData = await managersResponse.json();

            setSensors(sensorsData.sensors);
            setActiveManagers(managersData.managers);
        } catch (error) {
            console.error("Veri çekme hatası:", error);
        }
    }, [selectedCompany]);

    useEffect(() => {
        fetchSensorsAndManagers();
    }, [selectedCompany, fetchSensorsAndManagers]);

    const handleSensorCheckboxChange = (sensorId) => {
        setSelectedSensors((prevSelectedSensors) => {
            if (prevSelectedSensors.includes(sensorId)) {
                return prevSelectedSensors.filter((id) => id !== sensorId);
            } else {
                return [...prevSelectedSensors, sensorId];
            }
        });
    };

    const handleManagerCheckboxChange = (managerId) => {
        setSelectedManagers((prevSelectedManagers) => {
            if (prevSelectedManagers.includes(managerId)) {
                return prevSelectedManagers.filter((id) => id !== managerId);
            } else {
                return [...prevSelectedManagers, managerId];
            }
        });
    };

    const handleSelectAllSensors = () => {
        if (sensors.length === selectedSensors.length) {
            setSelectedSensors([]); // Eğer tüm sensörler seçiliyse, hepsini kaldır
        } else {
            setSelectedSensors(sensors.map((sensor) => sensor.id)); // Tüm sensörleri seç
        }
    };

    const handleSelectAllManagers = () => {
        if (activeManagers.length === selectedManagers.length) {
            setSelectedManagers([]); // Eğer tüm yöneticiler seçiliyse, hepsini kaldır
        } else {
            setSelectedManagers(activeManagers.map((manager) => manager.id)); // Tüm yöneticileri seç
        }
    };

    const openModal = () => {
        if (!selectedCompany) {
            toast.error("Lütfen bir kurum seçin!", {
                position: "top-center",
                autoClose: 2500,
                hideProgressBar: true,
            });
            return;
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleCompanyChange = (e) => {
        setSelectedCompany(e.target.value);
    };
    const handleAssign = async () => {
        if (selectedSensors.length === 0 || selectedManagers.length === 0) {
            toast.error('Lütfen hem sensör hem de yönetici seçin!', {
                position: "top-center",
                autoClose: 3000,
            });
            return;
        }

        try {
            // Backend API çağrısı
            const response = await fetch("http://localhost:5000/api/assign-random-sensors", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    sensorIds: selectedSensors,
                    managerIds: selectedManagers,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || "Sensörler başarıyla tanımlandı!", {
                    position: "top-center",
                    autoClose: 3000,
                });
                // Seçimleri sıfırla
                setSelectedSensors([]);
                setSelectedManagers([]);
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



    return (
        <Layout>
            <div className={styles.sensorsDefinitionPage}>
                <ToastContainer />
                <div className={styles.institutionSelect}>
                    <select
                        className={styles.select}
                        value={selectedCompany}
                        onChange={handleCompanyChange}
                    >
                        <option value="">Kurum Seçin</option>
                        {companies.map((company) => (
                            <option key={company.code} value={company.code}>
                                {company.name}
                            </option>
                        ))}
                    </select>
                </div>

                <h1 className={styles.pageTitle}>Sensör Tanımla</h1>

                <div className={styles.mainContent}>
                    <div
                        className={`${styles.card} ${styles.managerCard}`}
                        onClick={openModal}
                    >
                        <div className={`${styles.cardIcon} ${styles.fullHeight}`}>
                            <FaRss />
                            <FaPlus className={styles.plusIcon} />
                        </div>
                        <h3>Managerlere Sensör Tanımla</h3>
                        <p>Managerler için yeni sensörler ekle ve düzenle.</p>
                    </div>

                    <div
                        className={`${styles.card} ${styles.personalCard}`}
                        onClick={openModal}
                    >
                        <div className={`${styles.cardIcon} ${styles.fullHeight}`}>
                            <FaRss />
                            <FaPlus className={styles.plusIcon} />
                        </div>
                        <h3>Personellere Sensör Tanımla</h3>
                        <p>Personeller için yeni sensörler tanımla ve düzenle.</p>
                    </div>
                </div>
            </div>

            {/* Modal Section */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <button className={styles.closeButton} onClick={closeModal}>
                            X
                        </button>
                        <h2 className={styles.customHeader}>
                            {selectedCompany} Şirketi Sensörler ve Yöneticiler
                        </h2>

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
                                                onChange={() => handleSensorCheckboxChange(sensor.id)}
                                            />
                                        </td>
                                        <td>{sensor.name}</td>
                                        <td>{sensor.typeName}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Managerler Tablosu */}
                        <div className={styles.tableContainer}>
                            <h3>Aktif Managerler</h3>
                            <table>
                                <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            checked={selectedManagers.length === activeManagers.length}
                                            onChange={handleSelectAllManagers}
                                        />
                                        Seç
                                    </th>
                                    <th>Ad</th>
                                    <th>Soyad</th>
                                </tr>
                                </thead>
                                <tbody>
                                {activeManagers.map((manager) => (
                                    <tr key={manager.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedManagers.includes(manager.id)}
                                                onChange={() => handleManagerCheckboxChange(manager.id)}
                                            />
                                        </td>
                                        <td>{manager.name}</td>
                                        <td>{manager.lastname}</td>
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

                            <h3>Seçilen Yöneticiler:</h3>
                            <div className={styles.selectedListContainer}>
                                <ul>
                                    {selectedManagers.map((id) => {
                                        const manager = activeManagers.find((manager) => manager.id === id);
                                        return (
                                            <li key={id}>
                                                {manager?.name} {manager?.lastname}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>

                        <div className={styles.actionContainer}>
                            <button className={styles.assignButton} onClick={handleAssign}>
                                Tanımla
                            </button>
                            {error && <p className={styles.errorMessage}>{error}</p>}
                        </div>

                    </div>
                </div>
            )}

        </Layout>
    );
}
