import React from "react";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import "../styles/Dashboard.css";

// Chart.js elemanlarını kaydediyoruz
ChartJS.register(ArcElement, Tooltip, Legend);

export default function SensorChart({ active, passive }) {
    const data = {
        labels: ["Aktif Sensörler", "Pasif Sensörler"],
        datasets: [
            {
                data: [active, passive],
                backgroundColor: ["#5e72e4", "#f5365c"], // Modern renkler
                hoverBackgroundColor: ["#324cdd", "#d9254c"],
                borderWidth: 8,
                borderColor: "#f5f5f5", // Dış kenar rengi
                cutout: "75%", // Donut iç boşluk
            },
        ],
    };

    const options = {
        plugins: {
            legend: {
                display: true, // Legend görünür
                position: "bottom", // Legend sağda konumlanır
                labels: {
                    font: {
                        size: 14,
                        weight: "bold",
                    },
                    color: "#555", // Legend yazı rengi
                },
            },
            tooltip: {
                enabled: true, // Tooltip aktif
                backgroundColor: "#333", // Tooltip arka plan rengi
                titleFont: {
                    size: 14,
                    weight: "bold",
                },
                bodyFont: {
                    size: 12,
                },
                bodyColor: "#fff",
                borderColor: "#444",
                borderWidth: 1,
                padding: 10, // Tooltip iç boşluk
                callbacks: {
                    label: function (tooltipItem) {
                        const value = tooltipItem.raw; // Değerleri alır
                        return ` ${tooltipItem.label}: ${value}`; // Aktif Sensörler: 37
                    },
                },
            },
        },
        maintainAspectRatio: false, // Alan kısıtlaması
    };

    return (
        <div className="chartContainer">
            <h2 className="chartHeader">Sensör Durumu</h2>
            <Doughnut data={data} options={options} />
            <div className="chartLegend">

            </div>
        </div>
    );
}
