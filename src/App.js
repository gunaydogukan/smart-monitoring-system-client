import Login from "./pages/Login";
import { useAuth } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Address from "./pages/Address";
import Register from "./components/Register";
import SensorForm from "./pages/SensorForm";
import SensorShow from "./components/SensorShow"; // SensorShow bileşeni import edildi
import CompanyAdd from "./components/CompanyAdd";
import RoleBasedRedirect from './components/RoleBasedRedirect';
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";

export default function App() {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>; // Yüklenme ekranı

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />

                {user ? (
                    <>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/address" element={<Address />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/sensorform" element={<SensorForm />} />
                        <Route path="/sensors" element={<RoleBasedRedirect />} /> {/* SensorShow rotası */}
                        <Route path="/CompanyAdd" element={<CompanyAdd />} />
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                    </>
                ) : (
                    <Route path="*" element={<Navigate to="/login" />} />
                )}
            </Routes>
        </Router>
    );
}
