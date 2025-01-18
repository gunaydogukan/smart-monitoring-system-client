import React, { useState } from "react";
import axios from "axios";
import Layout from "../layouts/Layout";
import "../styles/Raporlama.css";

export default function Raporlama() {
    const [loading, setLoading] = useState({
        sensors: false,
        isActive: false,
        companies: false,
        sensorTypes: false,
        companyStats: false,
        sensorLogs: false,
    });
    const [error, setError] = useState(null);

    const API_URL = process.env.REACT_APP_API_URL;

    const downloadReport = async (endpoint, reportType, loadingKey) => {
        // Eğer zaten yükleniyorsa işlemi tekrar başlatma
        if (loading[loadingKey]) return;

        try {
            setLoading((prev) => ({ ...prev, [loadingKey]: true }));
            setError(null);

            const response = await axios({
                url: `${API_URL}/api/dashboard/${endpoint}`,
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                params: { reportType },
                responseType: "blob",
            });

            const extension = reportType === "pdf" ? "pdf" : "xlsx";

            const fileName = (() => {
                switch (endpoint) {
                    case "getSensors":
                        return `TumSensorlerinRaporu_${Date.now()}.${extension}`;
                    case "getIsActive":
                        return `KullaniciDurumuRaporu_${Date.now()}.${extension}`;
                    case "getAllCompanies":
                        return `TumSirketlerRaporu_${Date.now()}.${extension}`;
                    case "getSensorTypeClass":
                        return `SensorTipleriRaporu_${Date.now()}.${extension}`;
                    case "getCompanySensorStats":
                        return `SirketSensörRaporu_${Date.now()}.${extension}`;
                    case "getSensorLogs":
                        return `SensorLoglariRaporu_${Date.now()}.${extension}`;
                    default:
                        return `Rapor_${Date.now()}.${extension}`;
                }
            })();

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log(`${endpoint} için ${reportType.toUpperCase()} başarıyla indirildi.`);
        } catch (err) {
            console.error(`${endpoint} raporu indirme hatası:`, err.message);

            if (err.message.includes("Network Error")) {
                console.warn("Ağ hatası oluştu. Ancak bu tarayıcı tarafından engelleniyor olabilir.");
            } else {
                setError(`${endpoint} raporu indirilemedi: ${err.message}`);
            }
        } finally {
            setLoading((prev) => ({ ...prev, [loadingKey]: false }));
        }
    };

    return (
        <Layout>
            <div className="raporlama-container">
                <h2 className="raporlama-title">Raporlama</h2>
                {error && <p className="raporlama-error">{error}</p>}

                <div className="raporlama-grid">
                    {/* Tüm Sensörler Raporu */}
                    <div className="raporlama-card">
                        <h3 className="raporlama-card-title">Tüm Sensörler Raporu</h3>
                        <button
                            className="raporlama-button"
                            disabled={loading.sensors}
                            onClick={() =>
                                downloadReport("getSensors", "pdf", "sensors")
                            }
                        >
                            {loading.sensors ? "PDF İndiriliyor..." : "PDF İndir"}
                        </button>
                        <button
                            className="raporlama-button"
                            disabled={loading.sensors}
                            onClick={() =>
                                downloadReport("getSensors", "excel", "sensors")
                            }
                        >
                            {loading.sensors ? "Excel İndiriliyor..." : "Excel İndir"}
                        </button>
                    </div>

                    {/* Aktif ve Pasif Kullanıcılar Raporu */}
                    <div className="raporlama-card">
                        <h3 className="raporlama-card-title">Aktif ve Pasif Kullanıcılar Raporu</h3>
                        <button
                            className="raporlama-button"
                            disabled={loading.isActive}
                            onClick={() =>
                                downloadReport("getIsActive", "pdf", "isActive")
                            }
                        >
                            {loading.isActive ? "PDF İndiriliyor..." : "PDF İndir"}
                        </button>
                        <button
                            className="raporlama-button"
                            disabled={loading.isActive}
                            onClick={() =>
                                downloadReport("getIsActive", "excel", "isActive")
                            }
                        >
                            {loading.isActive ? "Excel İndiriliyor..." : "Excel İndir"}
                        </button>
                    </div>

                    {/* Şirketler Raporu */}
                    <div className="raporlama-card">
                        <h3 className="raporlama-card-title">Tüm Şirketler Raporu</h3>
                        <button
                            className="raporlama-button"
                            disabled={loading.companies}
                            onClick={() =>
                                downloadReport("getAllCompanies", "pdf", "companies")
                            }
                        >
                            {loading.companies ? "PDF İndiriliyor..." : "PDF İndir"}
                        </button>
                        <button
                            className="raporlama-button"
                            disabled={loading.companies}
                            onClick={() =>
                                downloadReport("getAllCompanies", "excel", "companies")
                            }
                        >
                            {loading.companies ? "Excel İndiriliyor..." : "Excel İndir"}
                        </button>
                    </div>

                    {/* Sensör Tipleri Raporu */}
                    <div className="raporlama-card">
                        <h3 className="raporlama-card-title">Sensör Tipleri Raporu</h3>
                        <button
                            className="raporlama-button"
                            disabled={loading.sensorTypes}
                            onClick={() =>
                                downloadReport("getSensorTypeClass", "pdf", "sensorTypes")
                            }
                        >
                            {loading.sensorTypes ? "PDF İndiriliyor..." : "PDF İndir"}
                        </button>
                        <button
                            className="raporlama-button"
                            disabled={loading.sensorTypes}
                            onClick={() =>
                                downloadReport("getSensorTypeClass", "excel", "sensorTypes")
                            }
                        >
                            {loading.sensorTypes ? "Excel İndiriliyor..." : "Excel İndir"}
                        </button>
                    </div>

                    {/* Şirketlere Göre Sensör Raporu */}
                    <div className="raporlama-card">
                        <h3 className="raporlama-card-title">Şirketlere Göre Sensör Raporu</h3>
                        <button
                            className="raporlama-button"
                            disabled={loading.companyStats}
                            onClick={() =>
                                downloadReport("getCompanySensorStats", "pdf", "companyStats")
                            }
                        >
                            {loading.companyStats ? "PDF İndiriliyor..." : "PDF İndir"}
                        </button>
                        <button
                            className="raporlama-button"
                            disabled={loading.companyStats}
                            onClick={() =>
                                downloadReport("getCompanySensorStats", "excel", "companyStats")
                            }
                        >
                            {loading.companyStats ? "Excel İndiriliyor..." : "Excel İndir"}
                        </button>
                    </div>

                    {/* Sensör Logları Raporu */}
                    <div className="raporlama-card">
                        <h3 className="raporlama-card-title">Sensör Logları Raporu</h3>
                        <button
                            className="raporlama-button"
                            disabled={loading.sensorLogs}
                            onClick={() =>
                                downloadReport("getSensorLogs", "pdf", "sensorLogs")
                            }
                        >
                            {loading.sensorLogs ? "PDF İndiriliyor..." : "PDF İndir"}
                        </button>
                        <button
                            className="raporlama-button"
                            disabled={loading.sensorLogs}
                            onClick={() =>
                                downloadReport("getSensorLogs", "excel", "sensorLogs")
                            }
                        >
                            {loading.sensorLogs ? "Excel İndiriliyor..." : "Excel İndir"}
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
