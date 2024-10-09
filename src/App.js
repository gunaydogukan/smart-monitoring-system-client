import Login from "./pages/Login";
import {useAuth} from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import {BrowserRouter as Router, Navigate, Route, Routes} from "react-router-dom";
import Profile from "./pages/Profile";

export default function App() {
  const { user } = useAuth();

  return (
      <Router>
          <Routes>
              {/* /login route'u her durumda erişilebilir olmalı */}
              <Route path="/login" element={<Login />} />

              {user ? (
                  <>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/profile" element={<Profile />} />
                      {/* Tanımlanmamış herhangi bir route'a giderse dashboard'a yönlendir */}
                      <Route path="*" element={<Navigate to="/dashboard" />} />
                  </>
              ) : (
                  <Route path="*" element={<Navigate to="/login" />} />
              )}
          </Routes>
      </Router>
  );
}