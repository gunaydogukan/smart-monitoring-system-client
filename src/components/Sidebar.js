import SidebarItem from "./SidebarItem";
import {useAuth} from "../contexts/AuthContext";

export default function Sidebar() {

    const { user } = useAuth();

    const adminNavs = [
        { name: 'Admin Nav 1', href: '/admin/dashboard' },
        { name: 'Admin Nav 2', href: '/admin/settings' }
    ];

    const personelNavs = [
        { name: 'Personel Nav 1', href: '/personel/tasks' },
        { name: 'Personel Nav 2', href: '/personel/profile' }
    ];

    const managerNavs = [
        { name: 'Manager Nav 1', href: '/manager/overview' },
        { name: 'Manager Nav 2', href: '/manager/reports' }
    ];


    return (
        <div style={{width: '100%', height: '100%', backgroundColor: '#e5e7eb'}}>

            <div style={{padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '8px'}}>

                {user.role === 'administrator' && (
                    <>
                        {adminNavs.map((nav, idX) => {
                            return (
                                <SidebarItem style={{ backgroundColor: 'black' }}>
                                    {nav.name}
                                </SidebarItem>
                            );
                        })}
                    </>
                )}

                {user.role === 'manager' && (
                    <>
                        {managerNavs.map((nav, idX) => {
                            return (
                                <SidebarItem style={{ backgroundColor: 'blue'}}>
                                    {nav.name}
                                </SidebarItem>
                            );
                        })}
                    </>
                )}

                {user.role === 'personal' && (
                    <>
                        {personelNavs.map((nav, idX) => {
                            return (
                                <SidebarItem style={{ backgroundColor: 'red'}}>
                                    {nav.name}
                                </SidebarItem>
                            );
                        })}
                    </>
                )}

            </div>
        </div>
    );
}