import React from "react";
import Sidebar from "../components/Sidebar";
import '../styles/Layout.css'; // CSS dosyasını ekliyoruz
import { useTheme } from "../contexts/ThemeContext"; // Tema bağlamını ekliyoruz

export default function Layout({ children }) {
    const { isDarkMode } = useTheme(); // Tema bağlamından dark mode durumunu alıyoruz

    return (
        <div className={`layout ${isDarkMode ? 'dark-layout' : ''}`}>
            <Sidebar />
            <div className={`content ${isDarkMode ? 'dark-content' : ''}`}>
                {children}
            </div>
        </div>
    );
}
