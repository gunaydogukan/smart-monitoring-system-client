import React, { useState, useEffect, useMemo } from "react";
import styles from "../styles/SensorDataCheckPage.module.css";
import { useNavigate } from "react-router-dom";

export default function SensorDataControll({ sensors = [], sensorTypes = [], times = [], data = [] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sensorColorClasses, setSensorColorClasses] = useState({});
    const navigate = useNavigate();

    // Sensör ve zaman eşleştirme
    // Sensör ve zaman eşleştirme
    const enrichedSensors = useMemo(() => {
        return sensors.map((sensor) => {
            // 'times' içerisindeki sensöre ait zaman bilgisini buluyoruz
            const matchingTime = times.find((time) => time.datacode === sensor.datacode);

            return {
                ...sensor,
                timestamp: matchingTime?.lastUpdatedTime || "Zaman Yok", // Eşleşen zaman varsa al, yoksa "Zaman verisi yok"
            };
        });
    }, [sensors, times]);

    // Sensör durum renklerini hesaplama
    useEffect(() => {
        const calculateColors = () => {
            const colorClasses = enrichedSensors.reduce((acc, sensor) => {
                const timestamp = sensor.timestamp;
                if (!timestamp) {
                    acc[sensor.id] = styles.redBox; // Varsayılan olarak pasif (kırmızı)
                    return acc;
                }

                const updatedTime = new Date(timestamp);
                const now = new Date();
                const timeDifferenceInMinutes = (now - updatedTime) / (1000 * 60);

                if (timeDifferenceInMinutes <= 5) {
                    acc[sensor.id] = styles.greenBox; // Yeşil (5 dakikadan az veya eşit)
                } else if (timeDifferenceInMinutes <= 1440) {
                    acc[sensor.id] = styles.yellowBox; // Sarı (24 saatten az)
                } else {
                    acc[sensor.id] = styles.redBox; // Kırmızı (24 saatten fazla)
                }
                return acc;
            }, {});
            setSensorColorClasses(colorClasses);
        };

        calculateColors();
    }, [enrichedSensors]);

    // Arama sorgusuna göre sensörleri filtreleme
    const filteredSensors = useMemo(() => {
        return enrichedSensors.filter((sensor) =>
            sensor.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [enrichedSensors, searchQuery]);

    // Sensör tipini belirleme
    const getSensorType = (typeId) => {
        const type = sensorTypes.find((t) => t.id === typeId);
        return type ? type.type : "Bilinmiyor";
    };

    // Harita yönlendirme işlemi
    const handleViewOnMap = (sensor) => {
        navigate("/map", { state: { sensor } });
    };

    // Zamanı formatlama
    const formatTime = (time) => {
        if ((time === "Zaman verisi yok") || !time) return "Zaman Yok";

        if (typeof time === "string" || typeof time === "number") {
            return new Date(time).toLocaleString(); // Tarih ve saat formatlama
        }
        return "Geçersiz Zaman"; // Eğer zaman formatı beklenmeyen bir yapıdaysa
    };

    const lastData = useMemo(() => {
        return sensors.map((sensor) => {
            // 'data' içerisindeki sensöre ait veri bilgisini buluyoruz
            const matchingData = data.find((dataItem) => dataItem.datacode === sensor.datacode);

            // Eğer veri varsa, nesne ise her bir özelliğini metne çeviriyoruz
            const dataValue = matchingData?.data || "Veri Yok"; // Veri varsa al, yoksa "Veri Yok"

            // Eğer veri bir nesne ise, nesnenin her bir özelliğini metin olarak yazdır
            const formattedDataValue = typeof dataValue === "object" && dataValue !== null
                ? Object.entries(dataValue).map(([key, value]) => `${key}: ${value}`).join(", ")
                : dataValue;

            return {
                ...sensor,
                dataValue: formattedDataValue, // Veri değerini düz metin olarak alıyoruz
            };
        });
    }, [sensors, data]);

    return (
        <div className={styles.sensorListContainer}>
            <div className={styles.tableContainer}>
                {/* Arama Çubuğu */}
                <div className={styles.searchBar}>
                    <input
                        type="text"
                        placeholder="Ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                {/* Sensörler Tablosu */}
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th>Ad</th>
                        <th>Tip</th>
                        <th>Durum</th>
                        <th>Zaman</th>
                        <th>Son Veri</th>
                        <th>Haritada Göster</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredSensors.map((sensor) => {
                        const timeData = sensor.timestamp;
                        const isActive = sensor.isActive;
                        const matchingLastData =
                            lastData.find((s) => s.id === sensor.id); // Veriyi sensör ile eşleştiriyoruz

                        return (
                            <tr key={sensor.id}>
                                <td>{sensor.name || "Ad Yok"}</td>
                                <td>{getSensorType(sensor.type)}</td>
                                <td>
                                        <span
                                            className={
                                                sensor.isActive
                                                    ? styles.activeStatus
                                                    : styles.inactiveStatus
                                            }
                                        >
                                            {isActive ? "Aktif" : "Pasif"}
                                        </span>
                                </td>
                                <td>
                                        <span className={sensorColorClasses[sensor.id]}>
                                            {formatTime(timeData)}
                                        </span>
                                </td>
                                <td>
                                    {matchingLastData
                                        ? typeof matchingLastData.dataValue === "object"
                                            ? JSON.stringify(matchingLastData.dataValue) // Nesne ise metne çevir
                                            : matchingLastData.dataValue
                                        : "Veri Yok"}
                                </td>

                                <td>
                                    <button
                                        className={styles.mapButton}
                                        onClick={() => handleViewOnMap(sensor)}
                                    >
                                        Haritada Göster
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
