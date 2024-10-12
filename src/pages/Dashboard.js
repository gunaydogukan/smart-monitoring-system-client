import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Layout from "../layouts/Layout";

export default function Dashboard() {
   // const { user, logout } = useAuth();
   // const navigate = useNavigate();

    return (
        <Layout>
            <div className="dashboard">
                <h1>Dashboard</h1>
                <p>Burada dashboard içeriğiniz olacak.</p>
            </div>
        </Layout>
    );
}
