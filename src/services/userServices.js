import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const UserService = {
    // Kullanıcı rolünü al
    getUserRole: async (token) => {
        try {
            const response = await axios.get(`${API_URL}/api/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const { email, role, companyCode } = response.data; // Gerekli alanları çıkar
            return { email, role, companyCode }; // Sadece bu alanları döndür // Sadece role bilgisini döndür
        } catch (error) {
            console.error("Kullanıcı rolü alınamadı:", error);
            throw error;
        }
    },
};

//şirketi getirir
export const fetchCompanies = async () => {
    try {
        const response = await fetch(`${API_URL}/api/companies`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        if (!response.ok) {
            throw new Error("Şirket verisi çekilemedi!");
        }
        return await response.json(); // Şirket listesini döndürür
    } catch (error) {
        console.error("Şirket verisi çekilemedi:", error);
        return []; // Hata durumunda boş array dön
    }
};

//şirkete göre kullanıcıları getirir.
export const fetchUsersByCompanyAndRole = async (API_URL, companyCode, role) => {
    try {
        const response = await fetch(`${API_URL}/api/company/${companyCode}/users?role=${role}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        if (!response.ok) {
            throw new Error("Kullanıcılar alınırken hata oluştu.");
        }
        return await response.json(); // Örn: { users: [...] }
    } catch (error) {
        console.error("Kullanıcılar alınırken hata oluştu:", error);
        return { users: [] }; // Hata durumunda boş bir array dön
    }
};

export default UserService;
