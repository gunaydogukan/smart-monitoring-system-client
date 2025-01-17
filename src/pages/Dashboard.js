import React, { useState, useEffect } from "react";
import Layout from "../layouts/Layout";
import "../styles/Dashboard.css";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import SensorTable from "../components/SensorTable";
import SensorChart from "../components/SensorChart";
import UserDashboardDetails from "../components/UserDashboardDetails";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const [sensorTypes, setSensorTypes] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [companyStats, setCompanyStats] = useState(null); // Şirket bazlı istatistikler

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const sensorResponse = await fetch(`${API_URL}/api/dashboard/getSensors`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (!sensorResponse.ok) {
                    throw new Error(`HTTP error! Status: ${sensorResponse.status}`);
                }

                const sensorData = await sensorResponse.json();
                setData(sensorData);

                const userResponse = await fetch(`${API_URL}/api/dashboard/getIsActive`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (!userResponse.ok) {
                    throw new Error(`HTTP error! Status: ${userResponse.status}`);
                }

                const userData = await userResponse.json();
                setUserStats(userData);

                const sensorTypesResponse = await fetch(`${API_URL}/api/dashboard/getSensorTypeClass`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (!sensorTypesResponse.ok) {
                    throw new Error(`HTTP error! Status: ${sensorTypesResponse.status}`);
                }

                const sensorTypesData = await sensorTypesResponse.json();
                setSensorTypes(sensorTypesData);
                // Şirket bazlı sensör istatistiklerini al
                const companyStatsResponse = await fetch(`${API_URL}/api/dashboard/getCompanySensorStats`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (!companyStatsResponse.ok) {
                    throw new Error(`HTTP error! Status: ${companyStatsResponse.status}`);
                }

                const companyStatsData = await companyStatsResponse.json();
                setCompanyStats(companyStatsData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


    if (loading) return <div className="loading">Yükleniyor...</div>;
    if (error) return <div className="error">Hata: {error}</div>;

    if (!data || !sensorTypes) {
        return <div className="error">Veriler yüklenemedi!</div>;
    }
// Şirket bazlı sensör grafikleri için verileri hazırlama
    const companyBarChartData = {
        labels: Object.keys(companyStats.groupedLengths),
        datasets: [
            {
                label: "Şirket Sensör Sayısı",
                data: Object.values(companyStats.groupedLengths),
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
            },
        ],
    };
    const typesMap = sensorTypes.types.reduce((acc, type) => {
        acc[type.id] = type.type;
        return acc;
    }, {});

    const sensorTypeCounts = Object.keys(sensorTypes.groupedLengths).map(typeId => {
        const type = typesMap[typeId] || "Bilinmeyen";
        const count = sensorTypes.groupedLengths[typeId];
        return { type, count };
    });

    const barChartData = {
        labels: sensorTypeCounts.map(({ type }) => type),
        datasets: [
            {
                label: "Sensör Sayısı",
                data: sensorTypeCounts.map(({ count }) => count),
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
            },
        ],
    };

    const colorPalette = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"];

    return (
        <Layout>
            <div className="dashboardContainer">
                <h1 className="dashboardHeader">Dashboard</h1>
                <div className="summaryCards">
                    <div className="summaryCard summaryCard--total">
                        <h2>Toplam Sensör</h2>
                        <p className="summaryValue">{data.totalSensors}</p>
                    </div>
                    <div className="summaryCard summaryCard--active">
                        <h2>Aktif Sensörler</h2>
                        <p className="summaryValue">{data.activeSensorsLen}</p>
                    </div>
                    <div className="summaryCard summaryCard--passive">
                        <h2>Pasif Sensörler</h2>
                        <p className="summaryValue">{data.passiveSensorsLen}</p>
                    </div>
                </div>

                <div className="chartAndCardsContainer">
                    <div className="chart-container">
                        <h2 className="chart-header">Sensör Türlerine Göre Dağılım</h2>
                        <Bar
                            data={barChartData}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: {display: false},
                                    tooltip: {
                                        callbacks: {
                                            label: function (context) {
                                                return `${context.raw} sensör`;
                                            },
                                        },
                                    },
                                },
                                scales: {
                                    x: {title: {display: true, text: "Sensör Türleri"}},
                                    y: {title: {display: true, text: "Sensör Sayısı"}, beginAtZero: true},
                                },
                            }}
                        />
                    </div>
                    <div className="sensorTypeCardsContainer">
                        {sensorTypeCounts.map(({type, count}, index) => (
                            <div key={index} className="sensorTypeCard">
                                <h3 className="sensorTypeCount">{count}</h3>
                                <p className="sensorTypeName">{type}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="companyStatsSection">
                    <h2 className="companyStatsHeader">Şirket Bazlı Sensör İstatistikleri</h2>
                    <div className="companyStatsContent">
                        <div className="companyStatsChart">
                            <Bar
                                data={companyBarChartData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {display: true},
                                    },
                                    scales: {
                                        x: {title: {display: true, text: "Şirketler"}},
                                        y: {title: {display: true, text: "Sensör Sayısı"}, beginAtZero: true},
                                    },
                                }}
                            />
                        </div>
                        <div className="companyStatsTable">
                            <h3 className="tableHeader">Şirket Sensör Detayları</h3>
                            <table className="styledTable">
                                <thead>
                                <tr>
                                    <th>Şirket Kodu</th>
                                    <th>Sensör Sayısı</th>
                                </tr>
                                </thead>
                                <tbody>
                                {Object.entries(companyStats.groupedLengths).map(([company, count]) => (
                                    <tr key={company}>
                                        <td>{company}</td>
                                        <td>{count}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>


                <div className="chartAndTableSection">
                    <SensorChart active={data.activeSensorsLen} passive={data.passiveSensorsLen}/>
                    <div className="tableContainer scrollableTable">
                        <h2 className="sectionHeader">Sensör Detayları</h2>
                        <SensorTable sensors={data.sensors}/>
                    </div>
                </div>

                {userStats && (
                    <div className="userStatsSection">
                        <h2 className="userStatsHeader">Kullanıcı İstatistikleri</h2>
                        <UserDashboardDetails userStats={userStats}/>
                    </div>
                )}
            </div>
        </Layout>
    );
}
