// src/components/LegendCard.js
import React, { useState } from 'react';
import '../../styles/sensorCheck/LegendCard.css';

function LegendCard() {
    const [isOpen, setIsOpen] = useState(true);

    const toggleCard = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`legend-card ${isOpen ? 'open' : ''}`}>
            <div className="legend-header" onClick={toggleCard}>
                <span>🛈 Renklerin Anlamları</span>
                <button className="close-btn">{isOpen ? 'Hide' : 'Show'}</button>
            </div>
            {isOpen && (
                <ul className="legend-content">
                    <li><span className="marker blue-dot"></span> Nem - Yağış</li>
                    <li><span className="marker green-dot"></span> Nem</li>
                    <li><span className="marker yellow-dot"></span> Seviye</li>
                    <li><span className="marker orange-dot"></span> Eski Nem - Yağış</li>
                    <li><span className="marker purple-dot"></span> Eski Seviye</li>
                </ul>
            )}
        </div>
    );
}

export default LegendCard;