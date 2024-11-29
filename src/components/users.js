import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // useParams'ı import ettik
import { FaSearch } from 'react-icons/fa'; // Arama ikonu
import styles from '../styles/Users.module.css';
import Layout from "../layouts/Layout";
import { useTheme } from "../contexts/ThemeContext"; // Tema bağlamını kullan
import UpdateUserModal from '../components/UpdateUserModal'; // Modal'ı dahil ediyoruz
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Users() {
    const [companies, setCompanies] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null); // Güncellenmek istenen kullanıcı
    const [modalVisible, setModalVisible] = useState(false); // Modal görünürlüğü
    const { type } = useParams(); // URL'den gelen parametreyi almak için kullanılıyor
    const { isDarkMode } = useTheme();
    const [role, setRole] = useState(''); // Kullanıcı rolü

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setRole(user.role); // Kullanıcı rolünü al
        }
        fetchCompanies();
        fetchDataByCompany(type); // URL parametresi ile veri getirme
    }, [type]);

    const fetchCompanies = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/companies', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const data = await response.json();
            setCompanies(data || []);
        } catch (error) {
            console.error('Şirket verisi çekilemedi:', error);
        }
    };

    const fetchDataByCompany = async (type, companyCode = '') => {
        try {
            const url = companyCode
                ? `http://localhost:5000/api/${type}?companyCode=${encodeURIComponent(companyCode)}`
                : `http://localhost:5000/api/${type}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Veri çekme hatası');
            }

            const data = await response.json();
            setFilteredData(data || []);
        } catch (error) {
            console.error(`${type} verisi çekilemedi:`, error);
        }
    };

    const handleCompanyChange = (e) => {
        const companyCode = e.target.value;
        setSelectedCompany(companyCode);

        if (companyCode) {
            fetchDataByCompany(type, companyCode);
        } else {
            fetchDataByCompany(type);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredResults = filteredData.filter(person => {
        const search = searchTerm.toLowerCase();

        // Yalnızca manager rolü personal'ları görsün
        if (role === 'manager' && person.role !== 'personal') return false;

        return (
            person.name.toLowerCase().includes(search) || // Ad
            person.lastname.toLowerCase().includes(search) || // Soyad
            person.email.toLowerCase().includes(search) || // E-posta
            (person.companyCode
                ? person.companyCode.toLowerCase().includes(search) // Şirket kodu varsa
                : 'kurum yok'.includes(search)) || // Şirket kodu yoksa "Kurum Yok" olarak aransın
            (person.isActive ? 'aktif' : 'pasif').includes(search) // Durum (Aktif/Pasif)
        );
    });



    const handleUpdateClick = (user) => {
        setSelectedUser(user); // Kullanıcıyı seç
        setModalVisible(true); // Modal'ı aç
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedUser(null); // Modal kapandığında seçilen kullanıcıyı sıfırla
    };

    const handleModifyUserDetails = async (updatedUser) => {
        try {
            const response = await fetch(`http://localhost:5000/api/modifyuser`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(updatedUser),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Güncelleme sırasında bir hata oluştu.');
            }

            setModalVisible(false);
            setSelectedUser(null);
            fetchDataByCompany(type, selectedCompany); // Kullanıcı listesini güncellemek için çağrı
            toast.success('Kullanıcı başarıyla güncellendi.');
        } catch (error) {
            console.error('Güncelleme hatası:', error.message);
            toast.error(`Güncelleme sırasında bir hata oluştu: ${error.message}`);
        }
    };



    const handleDeleteUser = async (userId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/${userId}/deactivate`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const { message } = await response.json();
                toast.error(message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
            } else {
                toast.success(
                    <span>
                    Kullanıcı <span style={{ color: 'red', fontWeight: 'bold' }}>Pasif</span> hale getirildi.
                </span>
                );
                fetchDataByCompany(type, selectedCompany);
            }
        } catch (error) {
            console.error('Kullanıcıyı pasif yapma hatası:', error);
            toast.error('Kullanıcıyı pasif yapma sırasında bir hata oluştu.');
        }
    };



    const handleActivateUser = async (userId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/${userId}/activate`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const { message } = await response.json();
                toast.error(message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
            } else {
                toast.success(
                    <span>
                    Kullanıcı <span style={{ color: 'green', fontWeight: 'bold' }}>Aktif</span> hale getirildi.
                </span>
                );
                fetchDataByCompany(type, selectedCompany);
            }
        } catch (error) {
            console.error('Kullanıcıyı aktif yapma hatası:', error);
            toast.error('Kullanıcıyı aktif yapma sırasında bir hata oluştu.');
        }
    };


    return (
        <Layout>
            <div className={`${styles.container} ${isDarkMode ? styles.dark : ''}`}>
                <h2 className={`${styles.title} ${isDarkMode ? styles.darkTitle : ''}`}>
                    {type === 'managers' ? 'Yöneticiler (Managers)' : 'Personeller (Personals)'}
                </h2>

                <UpdateUserModal
                    modalVisible={modalVisible}
                    handleCloseModal={handleCloseModal}
                    selectedUser={selectedUser}
                    handleUpdateUser={handleModifyUserDetails}
                />

                <div className={styles.filterContainer}>


                    <select
                        className={`${styles.select} ${isDarkMode ? styles.darkSelect : ''}`}
                        value={selectedCompany}
                        onChange={handleCompanyChange}
                    >
                        <option value="">Tüm Şirketler</option>
                        {companies.map(company => (
                            <option key={company.code} value={company.code}>
                                {company.name}
                            </option>
                        ))}
                    </select>
                    <div className={styles.searchContainer}>
                        <FaSearch className={styles.searchIcon}/>
                        <input
                            type="text"
                            className={`${styles.searchInput} ${isDarkMode ? styles.darkInput : ''}`}
                            placeholder="Ara"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    {filteredResults.length > 0 ? (
                        <table className={`${styles.table} ${isDarkMode ? styles.darkTable : ''}`}>
                            <thead>
                            <tr>
                                <th>Ad</th>
                                <th>Soyad</th>
                                <th>E-posta</th>
                                <th>Şirket</th>
                                <th>Durum</th>
                                <th>Rol</th>
                                {/* Yeni kolon */}
                                <th>İşlemler</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredResults.map(person => (
                                <tr key={person.id}>
                                    <td>{person.name}</td>
                                    <td>{person.lastname}</td>
                                    <td>{person.email}</td>
                                    <td>{person.companyCode || 'Kurum Yok'}</td>
                                    <td>{person.isActive ? 'Aktif' : 'Pasif'}</td>
                                    <td>{person.role}</td>
                                    {/* Kullanıcı rolü */}
                                    <td>
                                        {/* Yalnızca yetkili rollere buton göster */}
                                        {role === 'administrator' || (role === 'manager' && person.role === 'personal') ? (
                                            <>
                                                <button
                                                    className={`${styles.actionButton} ${styles.updateButton}`}
                                                    onClick={() => handleUpdateClick(person)}
                                                >
                                                    Güncelle
                                                </button>
                                                {person.isActive ? (
                                                    <button
                                                        className={`${styles.actionButton} ${styles.deleteButton}`}
                                                        onClick={() => handleDeleteUser(person.id)}
                                                    >
                                                        Pasif Yap
                                                    </button>
                                                ) : (
                                                    <button
                                                        className={`${styles.actionButton} ${styles.activateButton}`}
                                                        onClick={() => handleActivateUser(person.id)}
                                                    >
                                                        Aktif Yap
                                                    </button>
                                                )}
                                            </>
                                        ) : null}

                                    </td>
                                </tr>
                            ))}
                            </tbody>

                        </table>
                    ) : (
                        <p className={styles.message}>
                            Bu şirkete ait {type === 'managers' ? 'yönetici' : 'personel'} bulunamadı.
                        </p>
                    )}
                </div>
            </div>
            <ToastContainer
                position="top-right" // Mesajın pozisyonu
                autoClose={3000} // Mesajın otomatik kapanma süresi (ms)
                hideProgressBar={false} // İlerleme çubuğu
                newestOnTop={true} // Yeni mesajların üste gelmesi
                closeOnClick // Mesajın tıklamayla kapanması
                pauseOnHover // Üzerine gelindiğinde durdurma
                draggable // Sürüklenebilirlik
                theme={isDarkMode ? 'dark' : 'light'} // Temaya göre toast stili
            />

        </Layout>
    );
}
