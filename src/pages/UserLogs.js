import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../layouts/Layout";
import "../styles/Loglar.css";
import LoadingScreen from "../components/LoadingScreen";
import { FaInfoCircle } from "react-icons/fa";

export default function UserLogs() {
    const [userLogs, setUserLogs] = useState({});
    const [summary, setSummary] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/dashboard/getUserLogs`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                console.log("API Response:", response.data);

                setSummary(response.data.summary || {});
                setUserLogs(response.data.logs || {});
            } catch (err) {
                setError("Loglar yüklenirken bir hata oluştu.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [API_URL]);

    const highlightChanges = (differences) => {
        if (!differences || typeof differences !== "object") return <span>Veri yok</span>;

        return Object.entries(differences).map(([key, value]) => {
            if (key === "user") {
                return (
                    <div key={key}>
                        <strong>Kullanıcı:</strong> {value?.name || ""} {value?.lastname || ""}
                    </div>
                );
            } else if (key === "isActive") {
                return (
                    <div key={key}>
                    <span style={{ color: "red", fontWeight: "bold" }}>
                        {key}: {value?.oldValue ? "Aktif" : "Pasif"} → {value?.newValue ? "Aktif" : "Pasif"}
                    </span>
                    </div>
                );
            } else if (typeof value === "object" && value !== null) {
                // Eğer value bir nesne ise, JSON.stringify ile formatla
                return (
                    <div key={key}>
                        <strong>{key}:</strong> {JSON.stringify(value)}
                    </div>
                );
            } else {
                return (
                    <div key={key}>
                    <span style={{ color: "red", fontWeight: "bold" }}>
                        {key}: {value?.oldValue ?? " "} → {value?.newValue ?? " "}
                    </span>
                    </div>
                );
            }
        });
    };

    if (loading) {
        return <LoadingScreen />;
    }

    if (error) {
        return (
            <Layout>
                <div className="loglar-container">
                    <p className="loglar-error">{error}</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="loglar-container">
                <h2 className="loglar-title">Kullanıcı Kayıtları</h2>
                <div className="loglar-info">
                    <FaInfoCircle className="loglar-info-icon" />
                    <span>
                        <strong>Bilgi:</strong> Bu tablodaki kayıtlar kullanıcılar üzerindeki değişiklikleri gösterir.
                    </span>
                </div>

                {/* Özet Bilgisi */}
                <div className="loglar-summary">
                    <h4>Özet:</h4>
                    <ul>
                        {Object.entries(summary).map(([action, count]) => (
                            <li key={action}>
                                <strong>{action}:</strong> {count} adet
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Log Tablosu */}
                <div className="loglar-table-wrapper">
                    <table className="loglar-table">
                        <thead>
                        <tr>
                            <th>Aksiyon</th>
                            <th>Tarih</th>
                            <th>Değişiklikler</th>
                        </tr>
                        </thead>
                        <tbody>
                        {Object.entries(userLogs).map(([action, logGroup]) =>
                            Array.isArray(logGroup.logs) && logGroup.logs.length > 0 ? (
                                logGroup.logs.map((log, index) => (
                                    <tr key={`${action}-${log?.id || index}`}>
                                        <td>{log?.action || "Bilinmiyor"}</td>
                                        <td>
                                            {log?.timestamp
                                                ? new Date(log.timestamp).toLocaleString("tr-TR")
                                                : "Tarih yok"}
                                        </td>
                                        <td>{highlightChanges(log?.differences)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr key={action}>
                                    <td colSpan="3">Bu aksiyon için log bulunamadı.</td>
                                </tr>
                            )
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
}
