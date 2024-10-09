import {useAuth} from "../contexts/AuthContext";
import {useNavigate} from "react-router-dom";
import Layout from "../layouts/Layout";
import PrimaryButton from "../components/PrimaryButton";

export default function Dashboard() {
    const {user, logout} = useAuth();
    const navigate = useNavigate();

    return (
        <Layout>
            <div>

                {user.role === 'administrator' && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '30px',
                        width: '150px',
                        padding: '10px'
                    }}>
                        <PrimaryButton>
                            Ben Adminim
                        </PrimaryButton>

                        <PrimaryButton onClick={() => navigate('/profile')}>
                            Go to Profile
                        </PrimaryButton>

                        <PrimaryButton onClick={logout}>
                            Çıkış Yap
                        </PrimaryButton>
                    </div>
                )}

                {user.role === 'personal' && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '30px',
                        width: '150px',
                        padding: '10px'
                    }}>
                        <PrimaryButton>
                            Ben Personelim
                        </PrimaryButton>

                        <PrimaryButton onClick={() => navigate('/profile')}>
                            Go to Profile
                        </PrimaryButton>

                        <PrimaryButton onClick={logout}>
                            Çıkış Yap
                        </PrimaryButton>
                    </div>
                )}

            </div>
        </Layout>
    );
}