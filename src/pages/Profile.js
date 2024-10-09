import {useNavigate} from "react-router-dom";
import Layout from "../layouts/Layout";

export default function Profile() {
    const navigate = useNavigate();
    return (
        <Layout>
            <div>
                <div>
                    profile sayfası
                </div>

                <button onClick={() => navigate('/dashboard')}>
                    dash sayfasına git
                </button>

            </div>
        </Layout>
    )
        ;
}