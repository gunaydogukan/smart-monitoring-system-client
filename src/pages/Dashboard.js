import React, { useState, useEffect } from "react";
import Layout from "../layouts/Layout";
import "../styles/Dashboard.css";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import SensorTable from "../components/SensorTable";
import SensorChart from "../components/SensorChart";
import UserDashboardDetails from "../components/UserDashboardDetails";
import {useAuth} from "../contexts/AuthContext";
import LoadingScreen from "../components/LoadingScreen";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Dashboard() {
    const { user,userRole } = useAuth(); // Kullanıcı bilgilerini al
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
                console.log(userRole.role);
                if(userRole.role!=="personal"){
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
                }

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
                if(userRole.role==="administrator"){
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
                    console.log(companyStatsData);
                    setCompanyStats(companyStatsData);
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


    if (loading) {
        return <LoadingScreen />;
    }
    if (error) return <div className="error">Hata: {error}</div>;

    if (!data || !sensorTypes) {
        return <div className="error">Veriler yüklenemedi!</div>;
    }
    let companyBarChartData;

    if (userRole.role === "administrator") {
        // Şirket bazlı sensör grafikleri için verileri hazırlama
        companyBarChartData = {
            labels: Object.keys(companyStats.groupedLengths),
            datasets: [
                {
                    label: "Şirket Sensör Dağılımı",
                    data: Object.values(companyStats.groupedLengths),
                    backgroundColor: ["#FF5733", "#33C3FF", "#8D33FF"], // Canlı renkler
                },
            ],
        };
    }
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    generateLabels: (chart) => {
                        const dataset = chart.data.datasets[0];
                        return [
                            {
                                text: dataset.label,
                                fillStyle: "#2d6bb3", // Etiket solundaki dikdörtgenin rengi
                                strokeStyle: "#3498DB", // Çizgi rengi
                                lineWidth: 0,
                                hidden: !chart.isDatasetVisible(0), // Görünürlük durumu
                                datasetIndex: 0,
                            },
                        ];
                    },
                    color: "#2C3E50", // Yazı rengi
                    font: {
                        size: 14,
                        family: "Arial, sans-serif",
                    },
                },
                onClick: (e, legendItem, legend) => {
                    const index = legendItem.datasetIndex;
                    const ci = legend.chart;
                    const meta = ci.getDatasetMeta(index);

                    // Görünürlüğü değiştirme
                    meta.hidden = meta.hidden === null ? !ci.isDatasetVisible(index) : null;
                    ci.update();
                },
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Şirketler",
                    color: "#2C3E50",
                    font: {
                        size: 14,
                        weight: "bold",
                    },
                },
                ticks: {
                    color: "#2C3E50",
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Sensör Sayısı",
                    color: "#2C3E50",
                    font: {
                        size: 14,
                        weight: "bold",
                    },
                },
                ticks: {
                    color: "#2C3E50",
                },
                beginAtZero: true,
            },
        },
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


    return (
        <Layout>
            <div className="dashboardContainer">
                <h1 className="dashboardHeader">Gösterge Paneli</h1>
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

                {userRole.role==="administrator" && (
                    <h2 className="uniqueSectionHeader">Sensörü Olan Şirket İstatistikleri</h2>
                )}
                {userRole.role === "administartor" && (
                    <div className="uniqueChartAndTableSection">
                        <div className="uniqueContentContainer">
                            {/* Grafik Alanı */}
                            <div className="uniqueChartContainer">
                                <Bar data={companyBarChartData} options={chartOptions}/>
                            </div>

                            {/* Tablo Alanı */}
                            <div className="uniqueTableContainer">
                                <table className="uniqueStyledTable">
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
                )}


                <div className="chartAndTableSection">
                    <SensorChart active={data.activeSensorsLen} passive={data.passiveSensorsLen}/>
                    <div className="tableContainer scrollableTable">
                        <h2 className="sectionHeader">Sensör Detayları</h2>
                        <SensorTable sensors={data.sensors}/>
                    </div>
                </div>

                {userRole.role === "administrator"  && userStats && (
                    <div className="userStatsSection">
                        <h2 className="userStatsHeader">Kullanıcı İstatistikleri</h2>
                        <UserDashboardDetails userStats={userStats}/>
                    </div>
                )}
            </div>
        </Layout>
    );
}
