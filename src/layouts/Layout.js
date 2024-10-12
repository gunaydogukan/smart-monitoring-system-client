import Sidebar from "../components/Sidebar";
import '../styles/Layout.css'; // CSS dosyasını ekliyoruz

export default function Layout({ children }) {
    return (
        <div className="layout">
            <Sidebar />
            <div className="content">
                {children}
            </div>
        </div>
    );
}
