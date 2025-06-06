import React from 'react';
import { useAuth } from '../contexts/AuthContext'; // Kullanıcının rolünü almak için
import AdminPage from '../pages/AdminSensorPage';
import ManagerPage from '../pages/ManagerSensorPage';
import PersonnelPage from '../pages/PersonalSensorPage';

export default function RoleBasedRedirect() {
    const { user,userRole } = useAuth(); // Kullanıcı bilgilerini al

    if (!user && !userRole) {
        return <p>Kullanıcı bilgisi yükleniyor...</p>;
    }
    console.log(userRole.role)

    // Kullanıcının rolüne göre yönlendirme yap
    switch (userRole.role) {
        case 'administrator':
            return <AdminPage role={userRole.role} />;
        case 'manager':
            return <ManagerPage role={userRole.role}/>;
        case 'personal':
            return <PersonnelPage role={userRole.role} />;
        default:
            return <p>Geçersiz kullanıcı rolü</p>;
    }
}
