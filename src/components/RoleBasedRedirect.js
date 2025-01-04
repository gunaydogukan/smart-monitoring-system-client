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


    // Kullanıcının rolüne göre yönlendirme yap
    switch (userRole.role) {
        case 'administrator':
            return <AdminPage role={user.role} />;
        case 'manager':
            return <ManagerPage role={user.role}/>;
        case 'personal':
            return <PersonnelPage role={user.role} />;
        default:
            return <p>Geçersiz kullanıcı rolü</p>;
    }
}
