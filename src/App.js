import React from "react";
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
import RoleBasedRedirect from "./components/RoleBasedRedirect";
import Users from "./components/users";
import DisplayMap from "./components/DisplayMap";
import CompanyList from "./pages/CompanyList";
import ChartPage from "./pages/ChartPage";
import SensorControl from "./pages/sensorCheck/MapPage";
import AddType from "./components/AddType";
import SensorIpControlPage from "./pages/SensorIpControlPage";
import SensorDataControllPage from "./pages/sensorDataControllPage";
import SensorsDefination from "./pages/Sensors_definitionPage";
import SoilMoistureMap from "./pages/SoilMoistureMap";
export default function App() {
    const { user, loading, userRole } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Yükleme tamamlanana kadar bekleme ekranı göster
    }

    if (!user) {
        return (
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </Router>
        );
    }

    if (!userRole || !userRole.role) {
        console.log("Role bilgisi eksik. Login sayfasına yönlendiriliyor...");
        return (
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </Router>
        );
    }

    const renderRoutes = () => {
        return (
            <>
                {userRole.role === "administrator" && (
                    <>
                        <Route path="/companies" element={<CompanyList />} />
                        <Route path="/register-manager" element={<Register />} />
                        <Route path="/sensorControl/kurulum" element={<SensorControl />} />
                        <Route path="/add-sensor-type" element={<AddType />} />
                        <Route path="/add-company" element={<CompanyAdd />} />
                    </>
                )}

                {(userRole.role === "administrator" || userRole.role === "manager") && (
                    <>
                        <Route path="/register-personal" element={<Register />} />
                        <Route path="/add-sensor" element={<SensorForm />} />
                        <Route path="/users/:type" element={<Users />} />
                        <Route path="/sensor-definition" element={<SensorsDefination />} />
                        <Route path="/add-address" element={<Address />} />
                    </>
                )}

                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/sensors" element={<RoleBasedRedirect />} />
                <Route path="/map" element={<DisplayMap />} />
                <Route path="/charts" element={<ChartPage />} />
                <Route path="/sensorControl/ip" element={<SensorIpControlPage />} />
                <Route path="/sensorControl/data" element={<SensorDataControllPage />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
                <Route path="/soilmoisturemap" element={<SoilMoistureMap />} />

            </>
        );
    };

    return (
        <Router>
            <Routes>{renderRoutes()}</Routes>
        </Router>
    );
}
