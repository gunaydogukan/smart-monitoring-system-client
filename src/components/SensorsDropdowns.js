import React from 'react';

export default function SensorsDropdowns({ role, companies = [], managers = [], personals = [], onChange }) {
    return (
        <div style={{ display: 'flex', gap: '10px' }}>
            {role === 'administrator' && (
                <>
                    {/* Şirketler Dropdown */}
                    <select onChange={(e) => onChange('company', e.target.value)}>
                        <option value="">Tüm Şirketler</option>
                        {companies.map(company => (
                            <option key={company.code} value={company.code}>
                                {company.name} - {company.code}
                            </option>
                        ))}
                    </select>

                    {/* Managerlar Dropdown */}
                    <select onChange={(e) => onChange('manager', e.target.value)}>
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
            <select onChange={(e) => onChange('personal', e.target.value)}>
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
