import React, { useState, useEffect, useCallback } from "react";
import { FaRss, FaPlus } from "react-icons/fa";
import styles from "../styles/Sensors_definitionPage.module.css";
import Layout from "../layouts/Layout";

export default function SensorsDefinitionPage() {
    const [selectedCompany, setSelectedCompany] = useState(""); // Seçilen kurum
    const [companies, setCompanies] = useState([]); // Kurumlar
    const [sensors, setSensors] = useState([]); // Kuruma ait sensörler
    const [activeManagers, setActiveManagers] = useState([]); // Aktif yöneticiler
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal görünürlük durumu

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
        if (!selectedCompany) return; // Eğer kurum seçilmemişse veriyi çekme

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

            setSensors(sensorsData.sensors); // typeName dahil sensör verilerini al
            setActiveManagers(managersData.managers);
        } catch (error) {
            console.error("Veri çekme hatası:", error);
        }
    }, [selectedCompany]);

    // Kurum seçimi değiştiğinde sensörler ve yöneticileri çek
    useEffect(() => {
        fetchSensorsAndManagers();
    }, [selectedCompany, fetchSensorsAndManagers]);

    // Kurum seçimi için modal açma
    const openModal = () => {
        if (!selectedCompany) {
            alert("Lütfen bir kurum seçin!");
            return;
        }
        setIsModalOpen(true); // Modal'ı aç
    };

    // Modal kapama
    const closeModal = () => {
        setIsModalOpen(false); // Modal'ı kapat
    };

    // Kurum seçimi değiştiğinde
    const handleCompanyChange = (e) => {
        setSelectedCompany(e.target.value);
    };

    return (
        <Layout>
            <div className={styles.sensorsDefinitionPage}>
                {/* Kurum Seçimi Dropdown */}
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

                {/* Title Section */}
                <h1 className={styles.pageTitle}>Sensör Tanımla</h1>

                <div className={styles.mainContent}>
                    {/* Manager Card */}
                    <div
                        className={`${styles.card} ${styles.managerCard}`}
                        onClick={openModal} // Modal'ı aç
                    >
                        <div className={`${styles.cardIcon} ${styles.fullHeight}`}>
                            <FaRss />
                            <FaPlus className={styles.plusIcon} />
                        </div>
                        <h3>Managerlere Sensör Tanımla</h3>
                        <p>Managerler için yeni sensörler ekle ve düzenle.</p>
                    </div>

                    {/* Personal Card */}
                    <div
                        className={`${styles.card} ${styles.personalCard}`}
                        onClick={openModal} // Modal'ı aç
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
                        <h2>{selectedCompany} İçin Sensörler ve Managerler</h2>
                        <div className={styles.modalBody}>
                            {/* Left Table: Sensors */}
                            <div className={styles.tableContainer}>
                                <h3>Kuruma Ait Sensörler</h3>
                                <table>
                                    <thead>
                                    <tr>
                                        <th>Sensor ID</th>
                                        <th>Sensor Name</th>
                                        <th>Type</th> {/* Type column ekliyoruz */}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {sensors.map((sensor) => (
                                        <tr key={sensor.id}>
                                            <td>{sensor.id}</td>
                                            <td>{sensor.name}</td>
                                            <td>{sensor.typeName}</td> {/* typeName'yi burada gösteriyoruz */}
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Right Table: Active Managers */}
                            <div className={styles.tableContainer}>
                                <h3>Aktif Managerler</h3>
                                <table>
                                    <thead>
                                    <tr>
                                        <th>Manager ID</th>
                                        <th>Manager Name</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {activeManagers.map((manager) => (
                                        <tr key={manager.id}>
                                            <td>{manager.id}</td>
                                            <td>{manager.name}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
