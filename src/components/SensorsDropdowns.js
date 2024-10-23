import React from 'react';

export default function SensorsDropdowns({
                                             role,
                                             companies = [],
                                             managers = [],
                                             personals = [],
                                             selectedCompany,
                                             selectedManager,
                                             selectedPersonal,
                                             onChange,
                                             onMapRedirect // Yeni prop ekleniyor
                                         }) {
    return (
        <div style={styles.container}>
            {/* Haritayı Görüntüle Butonu */}
            <button
                onClick={onMapRedirect}
                style={styles.button}
            >
                Haritayı Görüntüle
            </button>

            {/* Şirketler Dropdown (Sadece administrator görebilir) */}
            {role === 'administrator' && (
                <select
                    style={styles.dropdown}
                    onChange={(e) => onChange('company', e.target.value)}
                    value={selectedCompany}
                >
                    <option value="">Tüm Şirketler</option>
                    {companies.map((company) => (
                        <option key={company.code} value={company.code}>
                            {company.name} - {company.code}
                        </option>
                    ))}
                </select>
            )}

            {/* Managerlar Dropdown (Sadece administrator görebilir ve şirket seçilmeden kilitli) */}
            {role === 'administrator' && (
                <select
                    style={styles.dropdown}
                    value={selectedManager}
                    onChange={(e) => onChange('manager', e.target.value)}
                    disabled={!selectedCompany}  // Şirket seçilmezse manager kilitli
                >
                    <option value="">Tüm Managerlar</option>
                    {managers.map((manager) => (
                        <option key={manager.id} value={manager.id}>
                            {manager.name} {manager.lastname}
                        </option>
                    ))}
                </select>
            )}

            {/* Personeller Dropdown (Hem administrator hem de manager için aktif) */}
            <select
                style={styles.dropdown}
                value={selectedPersonal}
                onChange={(e) => onChange('personal', e.target.value)}
                disabled={role === 'administrator' && !selectedManager}  // Admin ise manager seçilmeden personel kilitli
            >
                <option value="">Tüm Personeller</option>
                {personals.map((personal) => (
                    <option key={personal.id} value={personal.id}>
                        {personal.name} {personal.lastname}
                    </option>
                ))}
            </select>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
        padding: '20px',
    },
    dropdown: {
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        backgroundColor: '#f9f9f9',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        fontSize: '1rem',
        transition: 'border-color 0.3s',
        cursor: 'pointer',
        outline: 'none',
        minWidth: '200px',
    },
    button: {
        padding: '10px 20px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#007BFF',
        color: 'white',
        fontSize: '1rem',
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.3s',
        outline: 'none',
    }
};
