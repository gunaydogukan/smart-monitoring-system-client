import React, { useState } from "react";
import styles from "../styles/Dashboard.css";

export default function SensorTable({ sensors }) {
    const [sortedSensors, setSortedSensors] = useState(sensors); // İlk başta sensörler olduğu gibi gösterilir
    const [sortOrder, setSortOrder] = useState("none"); // Sıralama durumu: "none", "active", "passive"

    const handleSortByStatus = () => {
        let newSortedSensors;
        if (sortOrder === "none" || sortOrder === "passive") {
            // "Aktif" sensörleri önce göstermek için sıralama
            newSortedSensors = [...sensors].sort((a, b) =>
                a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1
            );
            setSortOrder("active");
        } else if (sortOrder === "active") {
            // "Pasif" sensörleri önce göstermek için sıralama
            newSortedSensors = [...sensors].sort((a, b) =>
                a.isActive === b.isActive ? 0 : a.isActive ? 1 : -1
            );
            setSortOrder("passive");
        } else {
            // Varsayılan duruma geri dön
            newSortedSensors = [...sensors];
            setSortOrder("none");
        }

        setSortedSensors(newSortedSensors); // Sıralanmış sensörleri güncelle
    };

    return (
        <div className={styles.tableContainer}>
            <table className={styles.sensorTable}>
                <thead>
                <tr>
                    <th>Adı</th>
                    <th
                        onClick={handleSortByStatus}
                        style={{cursor: "pointer"}}
                    >
                        Durumu
                        {sortOrder === "active" && " 🔼"}
                        {sortOrder === "passive" && " 🔽"}
                    </th>
                </tr>
                </thead>
                <tbody>
                {sortedSensors.map((sensor) => (
                    <tr key={sensor.id}>
                        <td>{sensor.name}</td>
                        <td className={sensor.isActive ? "active" : "passive"}>
                            {sensor.isActive ? "Aktif" : "Pasif"}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>

    );
}
