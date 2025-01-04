import React from "react";
import "../styles/LoadingScreen.modeule.css";

function LoadingScreen() {
    return (
        <div className="loading-container">
            <div className="dots">
                <span className="dot red"></span>
                <span className="dot green"></span>
                <span className="dot blue"></span>
            </div>
            <p>Yükleniyor...</p>
        </div>
    );
}

export default LoadingScreen;
