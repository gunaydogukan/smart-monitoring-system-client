import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import '../styles/Layout.css';

export default function Layout({ children }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className={`layout ${isSidebarOpen ? "" : "sidebar-closed"}`}>
            <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="content">{children}</div>
        </div>
    );
}
