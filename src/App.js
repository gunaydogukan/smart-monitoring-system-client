// src/App.js
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
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>; // Yüklenme ekranı

    return (

            <Router>
                <Routes>

                    {user ? (
                        <>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/companies" element={<CompanyList />} />
                            <Route path="/add-address" element={<Address />} />
                            <Route path="/register-manager" element={<Register />} />
                            <Route path="/register-personal" element={<Register />} />
                            <Route path="/add-sensor" element={<SensorForm />} />
                            <Route path="/sensors" element={<RoleBasedRedirect />} />
                            <Route path="/map" element={<DisplayMap />} />
                            <Route path="/add-company" element={<CompanyAdd />} />
                            <Route path="/users/:type" element={<Users />} />
                            <Route path="/charts" element={<ChartPage />} />
                            <Route path="/sensorControl/kurulum" element={<SensorControl />} />
                            <Route path="/sensorControl/ip" element={<SensorIpControlPage />} />
                            <Route path="/sensorControl/data" element={<SensorDataControllPage />} />
                            <Route path="/add-sensor-type" element={<AddType/>} />
                            <Route path="/sensor-definition" element={<SensorsDefination/>}/>
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
