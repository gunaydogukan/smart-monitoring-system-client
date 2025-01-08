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

export default UserService;
