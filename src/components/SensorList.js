import React from 'react';

export default function SensorList({ sensors }) {
    return (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
            {sensors.length > 0 ? (
                sensors.map(sensor => (
                    <li key={sensor.id}>
                        {sensor.name} - {sensor.location}
                    </li>
                ))
            ) : (
                <p>Henüz kayıtlı bir sensör yok.</p>
            )}
        </ul>
    );
}
