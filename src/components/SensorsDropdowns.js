import React from 'react';

export default function SensorsDropdowns({ role, companies = [], managers = [], personals = [], onChange }) {
    return (
        <div style={styles.container}>
            {role === 'administrator' && (
                <>
                    {/* Şirketler Dropdown */}
                    <select style={styles.dropdown} onChange={(e) => onChange('company', e.target.value)}>
                        <option value="">Tüm Şirketler</option>
                        {companies.map(company => (
                            <option key={company.code} value={company.code}>
                                {company.name} - {company.code}
                            </option>
                        ))}
                    </select>

                    {/* Managerlar Dropdown */}
                    <select style={styles.dropdown} onChange={(e) => onChange('manager', e.target.value)}>
                        <option value="">Tüm Managerlar</option>
                        {managers.map(manager => (
                            <option key={manager.id} value={manager.id}>
                                {manager.name} {manager.lastname}
                            </option>
                        ))}
                    </select>
                </>
            )}

            {/* Personeller Dropdown (Hem admin hem de manager görebilir) */}
            <select style={styles.dropdown} onChange={(e) => onChange('personal', e.target.value)}>
                <option value="">Tüm Personeller</option>
                {personals.map(personal => (
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
    dropdownHover: {
        borderColor: '#4CAF50',
    },
};
