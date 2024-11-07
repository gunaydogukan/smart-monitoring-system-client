// src/services/sensorService.js

export async function fetchSensorData(name) {
    const response = await fetch(`http://localhost:5000/api/sensors/${name}`);
    if (!response.ok) throw new Error("Sensör verisi alınamadı");
    return response.json();
}

export async function updateSensorData(name, data) {
    const response = await fetch('http://localhost:5000/api/sensors/checkBoxChanges', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, ...data }),
    });
    if (!response.ok) throw new Error("Veri güncellenemedi");
    return response.json();
}

