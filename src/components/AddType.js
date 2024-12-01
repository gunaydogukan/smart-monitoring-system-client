import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from "../layouts/Layout";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AddSensorType() {
    const [sensorType, setSensorType] = useState({
        type: '',
        dataCount: 1, // Başlangıçta 1 veri sayısı
        dataNames: [''],
    });

    const navigate = useNavigate();
    const location = useLocation();

    // Role kontrolünü localStorage üzerinden alalım
    const role = location.state?.role;
    console.log(role);

    useEffect(() => {
        // Eğer role yoksa veya 'administrator' değilse yönlendiriyoruz
        if (role !== 'administrator') {
            toast.error('Bu işlemi yapmaya yetkiniz yok!');
            setTimeout(() => navigate('/dashboard'), 3000); // Yetkisiz kullanıcıyı yönlendiriyoruz
        }
    }, [role, navigate]);

    const handleDataCountChange = (e) => {
        const count = e.target.value;
        setSensorType((prev) => {
            const dataNames = Array.from({ length: count }, () => ''); // Yeni veri ismi alanları ekle
            return { ...prev, dataCount: count, dataNames };
        });
    };

    const handleDataNameChange = (e, index) => {
        const newDataNames = [...sensorType.dataNames];
        newDataNames[index] = e.target.value;
        setSensorType((prev) => ({ ...prev, dataNames: newDataNames }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Gönderilen veri: ", sensorType);
        try {
            // Sensör tipi verilerini backend'e gönderme
            const response = await fetch('http://localhost:5000/api/add-new-type', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, // Eğer token varsa
                },
                body: JSON.stringify(sensorType),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Sensör tipi başarıyla eklendi!');
                console.log("Backend'den gelen veri:", data);
                // Başarılı olduğunda, kullanıcıyı yönlendirebilirsiniz
                setTimeout(() => navigate('/dashboard'), 3000); // Yönlendirme
            } else {
                // Hata durumunda
                toast.error(data.error || 'Bir hata oluştu, lütfen tekrar deneyin.');
            }
        } catch (error) {
            console.error('Veri gönderme hatası:', error);
            toast.error('Sunucu hatası. Lütfen tekrar deneyin.');
        }
    };

    // Eğer rol 'administrator' değilse, erişimi engelliyoruz
    if (role !== 'administrator') {
        return <h3>Bu işlemi yapmaya yetkiniz yok.</h3>; // Yetkisiz erişim mesajı
    }

    return (
        <Layout>
            <ToastContainer />
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2 style={styles.formTitle}>Sensör Tipi Ekle</h2>

                {/* Sensör Tipi */}
                <div>
                    <label style={styles.label}>Tip İsmi:</label>
                    <input
                        type="text"
                        name="type"
                        value={sensorType.type}
                        onChange={(e) => setSensorType({ ...sensorType, type: e.target.value })}
                        placeholder="Sensör Tipi"
                        required
                        style={styles.input}
                    />
                </div>

                {/* Veri Sayısı */}
                <div>
                    <label style={styles.label}>Veri Sayısı:</label>
                    <input
                        type="number"
                        name="dataCount"
                        value={sensorType.dataCount}
                        onChange={handleDataCountChange}
                        min="1"
                        required
                        style={styles.input}
                    />
                </div>

                {/* Veri İsimleri, Veri Sayısına göre dinamik input alanları */}
                {sensorType.dataNames.map((dataName, index) => (
                    <div key={index}>
                        <label style={styles.label}>{`Veri İsmi ${index + 1}:`}</label>
                        <input
                            type="text"
                            value={dataName}
                            onChange={(e) => handleDataNameChange(e, index)}
                            placeholder={`Veri İsmi ${index + 1}`}
                            required
                            style={styles.input}
                        />
                    </div>
                ))}

                <button type="submit" style={styles.button}>Ekle</button>
            </form>
        </Layout>
    );
}

const styles = {
    form: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '450px',  // Formun genişliği 450px ile sınırlandırıldı
        margin: '0 auto',
        padding: '30px',  // Form içine padding eklendi
        borderRadius: '8px',  // Yuvarlatılmış köşeler
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',  // Daha belirgin gölge
        backgroundColor: '#fff',  // Beyaz arka plan
    },
    formTitle: {
        textAlign: 'center',
        marginBottom: '20px',
        fontSize: '28px',
        color: '#333',  // Başlık rengi koyu gri
        fontWeight: 'bold',
    },
    label: {
        fontSize: '16px',
        color: '#555',  // Etiket rengi
        marginBottom: '8px',
        fontWeight: 'bold',
    },
    input: {
        marginBottom: '15px',  // Inputlar arasındaki mesafe artırıldı
        padding: '12px',
        fontSize: '16px',
        borderRadius: '8px',  // Yuvarlatılmış kenarlar
        border: '1px solid #ddd',  // Açık gri kenarlık
        boxSizing: 'border-box',
        outline: 'none',
        transition: 'border-color 0.3s ease',  // Kenarlık rengi geçişi
    },
    button: {
        padding: '12px',  // Butonun paddingi genişletildi
        fontSize: '16px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#4CAF50',  // Buton yeşil
        color: '#fff',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        marginTop: '20px',
    },
};
