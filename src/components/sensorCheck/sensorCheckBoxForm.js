import React, { useState, useEffect } from 'react';
import '../../styles/sensorCheck/sensorCheckBoxForm.css';

function SensorCheckBoxForm({ selectedSensor, onClose }) {
    const [formData, setFormData] = useState({
        sagUstNem: false,
        sagAltNem: false,
        solAltNem: false,
        yagis: false,
        mesafe: false,
        turkcell: false,
        vodafone: false,
        turkTelekom: false,
    });
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    useEffect(() => {
        // selectedSensor kontrolü
        if (selectedSensor && selectedSensor.name) {
            const fetchData = async () => {
                try {
                    const response = await fetch(`http://localhost:5000/api/sensors/${encodeURIComponent(selectedSensor.name)}`);
                    if (response.ok) {
                        const data = await response.json();
                        setFormData({
                            sagUstNem: data.sagUstNem || false,
                            sagAltNem: data.sagAltNem || false,
                            solAltNem: data.solAltNem || false,
                            yagis: data.yagis || false,
                            mesafe: data.mesafe || false,
                            turkcell: data.turkcell || false,
                            vodafone: data.vodafone || false,
                            turkTelekom: data.turkTelekom || false,
                        });
                    }
                } catch (error) {
                    console.error('Veri çekme hatası:', error);
                }
            };
            fetchData();
        }
    }, [selectedSensor]);

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setFormData({ ...formData, [name]: checked });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/sensors/checkBoxChanges', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: selectedSensor.name, tur: selectedSensor.tur, ...formData }),
            });
            if (response.ok) {
                setShowSuccessMessage(true);
                setTimeout(() => {
                    setShowSuccessMessage(false);
                    onClose();
                }, 2000);
            } else {
                alert('Veriler kaydedilirken hata oluştu');
            }
        } catch (error) {
            console.error('Veri gönderme hatası:', error);
            alert('Bir hata oluştu, lütfen tekrar deneyin');
        }
    };

    return (
        <div className="modal">
            <div className="sensor-modal-content">
                <span className="sensor-close" onClick={onClose}>&times;</span>
                <form onSubmit={handleSubmit}>
                    <h2>{selectedSensor ? `${selectedSensor.name} / ${selectedSensor.tur}` : 'Sensör Seçilmedi'}</h2>
                    <label className="sensor-label">
                        Sağ Üst Nem
                        <input type="checkbox" className="sensor-checkbox" name="sagUstNem" checked={formData.sagUstNem} onChange={handleCheckboxChange} />
                    </label>
                    <label className="sensor-label">
                        Sağ Alt Nem
                        <input type="checkbox" className="sensor-checkbox" name="sagAltNem" checked={formData.sagAltNem} onChange={handleCheckboxChange} />
                    </label>
                    <label className="sensor-label">
                        Sol Alt Nem
                        <input type="checkbox" className="sensor-checkbox" name="solAltNem" checked={formData.solAltNem} onChange={handleCheckboxChange} />
                    </label>
                    <label className="sensor-label">
                        Yağış
                        <input type="checkbox" className="sensor-checkbox" name="yagis" checked={formData.yagis} onChange={handleCheckboxChange} />
                    </label>
                    <label className="sensor-label">
                        Mesafe
                        <input type="checkbox" className="sensor-checkbox" name="mesafe" checked={formData.mesafe} onChange={handleCheckboxChange} />
                    </label>
                    <label className="sensor-label">
                        Turkcell
                        <input type="checkbox" className="sensor-checkbox" name="turkcell" checked={formData.turkcell} onChange={handleCheckboxChange} />
                    </label>
                    <label className="sensor-label">
                        Vodafone
                        <input type="checkbox" className="sensor-checkbox" name="vodafone" checked={formData.vodafone} onChange={handleCheckboxChange} />
                    </label>
                    <label className="sensor-label">
                        Turk Telekom
                        <input type="checkbox" className="sensor-checkbox" name="turkTelekom" checked={formData.turkTelekom} onChange={handleCheckboxChange} />
                    </label>
                    <button type="submit" className="sensor-button">Kaydet</button>
                </form>
                {showSuccessMessage && <div className="success-message">Veriler başarıyla kaydedildi</div>}
            </div>
        </div>
    );
}

export default SensorCheckBoxForm;