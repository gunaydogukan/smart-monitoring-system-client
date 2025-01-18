import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../layouts/Layout";
import "../styles/Loglar.css";
import LoadingScreen from "../components/LoadingScreen";
import { FaInfoCircle } from "react-icons/fa";

export default function Loglar() {
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/dashboard/getSensorLogs`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setLogs(response.data.logs.details);
            } catch (err) {
                setError("Loglar yüklenirken bir hata oluştu.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [API_URL]);

    const highlightChanges = (oldData, newData) => {
        try {
            const oldObj = JSON.parse(oldData);
            const newObj = JSON.parse(newData);

            return Object.keys(newObj).map((key) => {
                if (oldObj[key] !== newObj[key]) {
                    return (
                        <div key={key}>
                            <span style={{ color: "red", fontWeight: "bold" }}>
                                {key}: {newObj[key]}
                            </span>
                        </div>
                    );
                } else {
                    return (
                        <div key={key}>
                            <span>{key}: {newObj[key]}</span>
                        </div>
                    );
                }
            });
        } catch (error) {
            return <span>Veriler karşılaştırılamadı</span>;
        }
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
                <h2 className="loglar-title">Kayıtlar</h2>
                <div className="loglar-info">
                    <FaInfoCircle className="loglar-info-icon"/>
                    <span>
        <strong>Bilgi:</strong> Kırmızı ile renklendirilmiş değerler, eski ve yeni veriler arasındaki değişiklikleri temsil eder.
    </span>
                </div>

                <div className="loglar-table-wrapper">
                    <table className="loglar-table">
                        <thead>
                        <tr>
                            <th>Sensör Adı</th>
                            <th>Aksiyon</th>
                            <th>Tarih</th>
                            <th>Eski Veri</th>
                            <th>Yeni Veri</th>
                        </tr>
                        </thead>
                        <tbody>
                        {Object.entries(logs).map(([category, logEntries]) =>
                            logEntries.map((log, index) => (
                                <tr key={`${category}-${log.id || index}`}>
                                    <td>{log.sensorName}</td>
                                    <td>{log.action}</td>
                                    <td>{new Date(log.timestamp).toLocaleString("tr-TR")}</td>
                                    <td>
                                        {highlightChanges(log.oldData, log.oldData)}
                                    </td>
                                    <td>
                                        {highlightChanges(log.oldData, log.newData)}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
}
