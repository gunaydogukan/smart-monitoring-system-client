// src/App.js
import React, {useState} from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

import "./styles/App.css";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Address from "./pages/Address";
import Register from "./components/Register";
import SensorForm from "./pages/SensorForm";
import CompanyAdd from "./components/CompanyAdd";
import RoleBasedRedirect from './components/RoleBasedRedirect';
import Users from './components/users';
import DisplayMap from './components/DisplayMap';
import CompanyList from './pages/CompanyList';
import ChartPage from './pages/ChartPage';
import SensorControl from './pages/sensorCheck/MapPage';
import AddType from "./components/AddType";
import SensorIpControlPage from "./pages/SensorIpControlPage";
import SensorDataControllPage from "./pages/sensorDataControllPage";
import SensorsDefination from "./pages/Sensors_definitionPage";

export default function App() {

    const [isSidebarOpen] = useState(false); // Sidebar durumu tanımlandı

    const { user, loading, userRole } = useAuth();


    if (loading) return <div>Loading...</div>; // Yüklenme ekranı

    if (!user) {
        console.log("Kullanıcı yok");
    }

    if (!userRole || !userRole.role) {
        console.log("Role bilgisi yok");
    } else {
        console.log("Role var:", userRole.role);
    }

    return (
        <Router>
            <Routes>
                {user ? (
                    <>
                        {/* Sadece admin görebilir */}
                        {userRole?.role && userRole.role !== "manager" && userRole.role !== "personal" && (
                            <>
                                <Route path="/companies" element={<CompanyList />} />
                                <Route path="/register-manager" element={<Register />} />
                                <Route
                                    path="/sensorControl/kurulum"
                                    element={<SensorControl isSidebarOpen={isSidebarOpen} />}
                                />
                                <Route path="/add-sensor-type" element={<AddType />} />
                                <Route path="/add-company" element={<CompanyAdd />} />
                            </>
                        )}

                        {/* Manager ve adminin görebileceği şeyler */}
                        {userRole?.role && userRole.role !== "personal" && (
                            <>
                                <Route path="/register-personal" element={<Register />} />
                                <Route path="/add-sensor" element={<SensorForm />} />
                                <Route path="/users/:type" element={<Users />} />
                                <Route path="/sensor-definition" element={<SensorsDefination />} />
                                <Route path="/add-address" element={<Address />} />
                            </>
                        )}

                        {/* Ortak olarak herkesin erişebileceği rotalar */}
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/sensors" element={<RoleBasedRedirect />} />
                        <Route path="/map" element={<DisplayMap />} />
                        <Route path="/charts" element={<ChartPage />} />
                        <Route path="/sensorControl/ip" element={<SensorIpControlPage />} />
                        <Route path="/sensorControl/data" element={<SensorDataControllPage />} />
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                    </>
                ) : (
                    <>
                        <Route path="/login" element={<Login />} />
                        <Route path="*" element={<Navigate to="/login" />} />
                    </>
                )}
            </Routes>
        </Router>
    );
}

