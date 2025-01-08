import React, { useState, useMemo, useEffect } from "react";
import SensorsDropdowns from "./SensorsDropdowns";
import styles from "../styles/sensorIPList.module.css";
import { useNavigate } from "react-router-dom";
import {
    filterManagersByCompany,
    filterSensorsByCompany,
    filterPersonalsByCompany,
    filterPersonalsByManager,
    filterSensorsByManager,
    filterSensorsByPersonal,
} from "../services/FilterService";

export default function SensorIPControl({
                                            role,
                                            companies,
                                            managers,
                                            personals,
                                            sensors,
                                            sensorOwners,
                                            ipLogs,
                                            types,
                                        }) {
    const API_URL = process.env.REACT_APP_API_URL;

    const [selectedCompany, setSelectedCompany] = useState("");
    const [selectedManager, setSelectedManager] = useState("");
    const [selectedPersonal, setSelectedPersonal] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [sensorColorClasses, setSensorColorClasses] = useState({});
    const [filteredManagers, setFilteredManagers] = useState([]);
    const [filteredPersonals, setFilteredPersonals] = useState([]);


    const navigate = useNavigate();
    // Kullanıcı dostu tarih formatı
    // Tarih formatını dönüştürme işlevi
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString("tr-TR", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    const parseDate = (dateString) => {
        if (!dateString) return null; // Tarih boşsa null döndür

        const [datePart, timePart] = dateString.split(" ");

        if (!datePart || !timePart) {
            console.error(`Geçersiz tarih formatı: ${dateString}`);
            return null;
        }
        const [day, month, year] = datePart.split(".");
        const [hour, minute, second] = timePart.split(":");

        return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
    };

    const getTimeColorClass = async (updatedAt, sensorId, active) => {
        let isActive = true;
        if (!updatedAt || updatedAt === "Zaman Yok") {
            isActive = false;
            await isActiveForIP(sensorId, isActive);
            return styles.defaultBox;
        }

        let updatedTime = parseDate(updatedAt);

        if (isNaN(updatedTime.getTime())) {
            console.error(`Geçersiz tarih: ${updatedAt}`);
            return styles.defaultBox;
        }

        const now = new Date();
        const timeDifferenceInMinutes = (now - updatedTime) / (1000 * 60);

        //eğer 24 saatten az sürede ip geldiyse active durumuna geçir
        if (timeDifferenceInMinutes <= 5) {
            if (!active) {
                try {
                    await isActiveForIP(sensorId, isActive);
                } catch (error) {
                    console.error(`Sensor update failed for ID ${sensorId}:`, error.message);
                }
            }
            //tekrar aktif olacak
            return styles.greenBox;
        }
        if (timeDifferenceInMinutes <= 1440) {
            if (!active) {
                try {
                    await isActiveForIP(sensorId, isActive);
                } catch (error) {
                    console.error(`Sensor update failed for ID ${sensorId}:`, error.message);
                }
            }
            return styles.yellowBox;
        }

        // 1440 dakikadan fazla geçmişse sensör pasiv yapılacak
        if (timeDifferenceInMinutes > 1440) {
            if (active) {
                try {
                    isActive = false;
                    await isActiveForIP(sensorId, isActive);
                } catch (error) {
                    console.error(`Sensor update failed for ID ${sensorId}:`, error.message);
                }
            }
            return styles.redBox;
        }
        return styles.defaultBox;
    };

    const isActiveForIP = async (sensorId, isActive) => {
        try {
            const response = await fetch(
                `${API_URL}/api/sensor-logs/update/isActiveForIP/${sensorId}/${isActive}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Sensor update failed for ID ${sensorId}:`, error.message);
        }
    };


    // IP ve zaman eşleştirme
    const enrichedSensors = useMemo(() => {
        const normalizeIpLogs = (ipLogs) => {
            if (!ipLogs) {
                console.warn("IP Logs boş veya undefined!");
                return [];
            }

            if (Array.isArray(ipLogs)) {
                return ipLogs.map((log) => ({
                    ...log,
                    datacode: log.sensorName?.trim().toLowerCase() || "",
                }));
            }

            console.warn("IP Logs beklenmeyen bir formatta!");
            return [];
        };

        const normalizedIpLogs = normalizeIpLogs(ipLogs);

        return sensors.map((sensor) => {
            const matchingLog = normalizedIpLogs.find(
                (log) => log.datacode === sensor.datacode.trim().toLowerCase()
            );
            return {
                ...sensor,
                ip: matchingLog?.ip || "IP Yok",
                timestamp: matchingLog?.time ? formatDate(matchingLog.time) : "Zaman Yok",
            };
        });
    }, [sensors, ipLogs]);

    // Sensör renklerini hesaplama
    // Sensör renklerini hesaplama
    useEffect(() => {
        const calculateColors = async () => {
            const colorClasses = {};
            for (const sensor of enrichedSensors) {
                try {
                    const colorClass = await getTimeColorClass(sensor.timestamp, sensor.id, sensor.isActive);
                    colorClasses[sensor.id] = colorClass;
                } catch (error) {
                    console.error(`Error calculating color for sensor ID ${sensor.id}:`, error.message);
                    colorClasses[sensor.id] = styles.defaultBox; // Hata durumunda varsayılan sınıf
                }
            }
            setSensorColorClasses(colorClasses);
        };

        calculateColors();
    }, [enrichedSensors]);

    // Filtreleme işlemleri
    const filteredByCompany = useMemo(
        () => filterSensorsByCompany(enrichedSensors, selectedCompany),
        [enrichedSensors, selectedCompany]
    );
    const filteredByManager = useMemo(
        () => filterSensorsByManager(filteredByCompany, sensorOwners, selectedManager),
        [filteredByCompany, sensorOwners, selectedManager]
    );
    const filteredByPersonal = useMemo(
        () => filterSensorsByPersonal(filteredByManager, sensorOwners, selectedPersonal),
        [filteredByManager, sensorOwners, selectedPersonal]
    );

    const filteredSensors = useMemo(() => {
        return filteredByPersonal.filter((sensor) =>
            sensor.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [filteredByPersonal, searchQuery]);

    // Filter managers when company changes
    useEffect(() => {
        const updatedManagers = filterManagersByCompany(managers, selectedCompany);
        setFilteredManagers(updatedManagers);
    }, [managers, selectedCompany]); // Re-filter managers based on selected company

    useEffect(() => {
        const updatedPersonals = selectedManager
            ? filterPersonalsByManager(personals, selectedManager)
            : filterPersonalsByCompany(personals, selectedCompany);
        setFilteredPersonals(updatedPersonals);
    }, [personals, selectedCompany, selectedManager]);

    // Dropdown değişikliklerini yönetme
    const handleDropdownChange = (type, value) => {
        if (type === "company") {
            setSelectedCompany(value);
            managers = filterManagersByCompany(managers, selectedCompany);
            setSelectedManager("");
            setSelectedPersonal("");
        } else if (type === "manager") {
            setSelectedManager(value);
            setSelectedPersonal("");
        } else if (type === "personal") {
            setSelectedPersonal(value);
        }
    };

    // Sensör tipini belirleme
    const handleType = (typeId) => {
        if (!types || types.length === 0) return "Bilinmiyor";
        const foundType = types.find((type) => type.id === typeId);
        return foundType ? foundType.type : "Bilinmiyor";
    };


    const handleMapRedirect = () => {
        // Filtrelenmiş sensörleri sessionStorage'a kaydediyoruz
        sessionStorage.setItem('sensorsForMap', JSON.stringify(filteredSensors));

        // Yeni sekmede /map rotasını açıyoruz
        window.open('/map', '_blank');
    };

    // İlgili sensörün konumuna yönlendirme
    const handleViewOnMap = (sensor) => {
        // Önce eski veriyi temizle
        sessionStorage.removeItem('sensorsForMap');

        // Yeni sensör verisini sessionStorage'a kaydet
        sessionStorage.setItem('sensorsForMap', JSON.stringify(sensor));

        // Cache etkisini bypass etmek için benzersiz bir timestamp ekleyerek yeni sekme aç
        const timestamp = Date.now(); // Benzersiz bir zaman damgası
        window.open(`/map`, '_blank');
    };


    return (
        <>
            <div className={styles.mainContainerIP}>

            <h2 className={styles.header}>Sensor IP Kontrol Paneli</h2>
            <div className={styles.filterArea}>
                <SensorsDropdowns
                    role={role}
                    companies={companies}
                    managers={filteredManagers}
                    personals={filteredPersonals}
                    selectedCompany={selectedCompany}
                    selectedManager={selectedManager}
                    selectedPersonal={selectedPersonal}
                    onChange={handleDropdownChange}
                    onMapRedirect={handleMapRedirect}
                />
            </div>
            <div className={styles.sensorListContainer}>

                <div className={styles.tableContainer}>
                    <div className={styles.searchBar}>
                        <input
                            type="text"
                            placeholder="Ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>

                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>Ad</th>
                            <th>Tip</th>
                            <th>IP</th>
                            <th>Durum</th>
                            <th>Zaman</th>
                            <th>Haritada Göster</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredSensors.map((sensor) => (
                            <tr key={sensor.id}>
                                <td>{sensor.name}</td>
                                <td>{handleType(sensor.type)}</td>
                                <td>{sensor.ip}</td>
                                <td>
                                    <span
                                        className={
                                            sensor.isActive
                                                ? styles.activeStatus
                                                : styles.inactiveStatus
                                        }
                                    >
                                        {sensor.isActive ? "Aktif" : "Pasif"}
                                    </span>
                                </td>
                                <td>
                                    <span className={sensorColorClasses[sensor.id]}>
                                        {sensor.timestamp}
                                    </span>
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
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
            </div>
        </>
    );

}
