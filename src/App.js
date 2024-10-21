import Login from "./pages/Login";
import { useAuth } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Address from "./pages/Address";
import Register from "./components/Register";
import SensorForm from "./pages/SensorForm";
import CompanyAdd from "./components/CompanyAdd";
import RoleBasedRedirect from './components/RoleBasedRedirect';
import CompanyList from './pages/CompanyList';
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
                        <Route path="/companies" element={<CompanyList />} />
                        <Route path="/add-address" element={<Address />} />
                        <Route path="/register-manager" element={<Register />} />
                        <Route path="/register-personal" element={<Register />} />
                        <Route path="/add-sensor" element={<SensorForm />} />
                        <Route path="/sensors" element={<RoleBasedRedirect />} /> {/* SensorShow rotası */}
                        <Route path="/add-company" element={<CompanyAdd />} />
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                    </>
                ) : (
                    <Route path="*" element={<Navigate to="/login" />} />
                )}
            </Routes>
        </Router>
    );
}
