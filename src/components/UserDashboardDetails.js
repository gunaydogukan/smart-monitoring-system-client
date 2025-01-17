import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import "../styles/UserDashboardDetails.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function UserDashboardDetails({ userStats }) {
    // Rollere göre kullanıcı dağılımı (administrator hariç)
    const filteredUsers = userStats.activeUsers.filter(user => user.role !== 'administrator');

    const roles = filteredUsers.reduce((acc, user) => {
        const roleName = user.role === 'manager' ? 'Yönetici' : user.role === 'personal' ? 'Personel' : user.role;
        acc[roleName] = (acc[roleName] || 0) + 1;
        return acc;
    }, {});

    // Şirketlere göre kullanıcı dağılımı (administrator hariç)
    const companies = filteredUsers.reduce((acc, user) => {
        const company = user.companyCode || "Belirtilmedi";
        acc[company] = (acc[company] || 0) + 1;
        return acc;
    }, {});

    // Rollere Göre Kullanıcı Dağılımı için veri
    const rolesData = {
        labels: Object.keys(roles),
        datasets: [
            {
                label: 'Kullanıcı Sayısı',
                data: Object.values(roles),
                backgroundColor: "#00c0ff", // Modern ve sade renk
                borderRadius: 8,
                barThickness: 20, // Çubuk kalınlığı
                hoverBackgroundColor: "#008c9e",
            },
        ],
    };

    const rolesOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Roller",
                    color: '#343a40',
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Kullanıcı Sayısı",
                    color: '#343a40',
                },
                beginAtZero: true,
            },
        },
    };

    // Şirketlere Göre Kullanıcı Dağılımı için veri
    const companiesData = {
        labels: Object.keys(companies),
        datasets: [
            {
                label: 'Kullanıcı Sayısı',
                data: Object.values(companies),
                backgroundColor: "#007bff", // Modern ve sade renk
                borderRadius: 8,
                barThickness: 20, // Çubuk kalınlığı
                hoverBackgroundColor: "#005f73",
            },
        ],
    };

    const companiesOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Şirketler",
                    color: '#343a40',
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Kullanıcı Sayısı",
                    color: '#343a40',
                },
                beginAtZero: true,
            },
        },
    };

    // Yeni Grafik Verisi (Aktif ve Pasif Kullanıcılar)
    const activeVsPassiveData = {
        labels: ['Aktif ', 'Pasif '],
        datasets: [
            {
                label: 'Kullanıcı Sayısı',
                data: [
                    userStats.activeUsersLen - userStats.activeUsers.filter(user => user.role === 'administrator').length,
                    userStats.passiveUsersLen,
                ],
                backgroundColor: ['#28a745', '#dc3545'],
                borderRadius: 8,
                barThickness: 30,
                hoverBackgroundColor: ['#218838', '#c82333'],
            },
        ],
    };

    const activeVsPassiveOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Durumlar",
                    color: '#343a40',
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Kullanıcı Sayısı",
                    color: '#343a40',
                },
                beginAtZero: true,
            },
        },
    };

    return (
        <div className="user-dashboard">

            <div className="charts-section">
                <div className="chart-container">
                    <h2 className="chart-header">Rollere Göre Kullanıcı Dağılımı</h2>
                    <Bar data={rolesData} options={rolesOptions} />
                </div>

                <div className="chart-container">
                    <h2 className="chart-header">Şirketlere Göre Kullanıcı Dağılımı</h2>
                    <Bar data={companiesData} options={companiesOptions} />
                </div>

                <div className="chart-container">
                    <h2 className="chart-header">Aktif ve Pasif Kullanıcı Dağılımı</h2>
                    <Bar data={activeVsPassiveData} options={activeVsPassiveOptions} />
                </div>
            </div>


            <div className="recent-users">
                <h2 className="chart-header">Son Eklenen Kullanıcılar</h2>
                <table className="recent-users-table">
                    <thead>
                    <tr>
                        <th>Adı Soyadı</th>
                        <th>Şirket</th>
                        <th>Tarih</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredUsers.slice(-5).map((user) => (
                        <tr key={user.id}>
                            <td>{user.name} {user.lastname}</td>
                            <td>{user.companyCode || "Belirtilmedi"}</td>
                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>


            <div className="info-cards">
                <div className="info-card info-card--active">
                    <h3>Aktif Kullanıcılar</h3>
                    <p>{userStats.activeUsersLen - userStats.activeUsers.filter(user => user.role === 'administrator').length}</p>
                </div>
                <div className="info-card info-card--passive">
                    <h3>Pasif Kullanıcılar</h3>
                    <p>{userStats.passiveUsersLen}</p>
                </div>
            </div>
        </div>
    );
}
