import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import styles from '../styles/SensorsDropdowns.module.css';

export default function SensorsDropdowns({
                                             role,
                                             companies = [],
                                             managers = [],
                                             personals = [],
                                             selectedCompany,
                                             selectedManager,
                                             selectedPersonal,
                                             onChange,
                                             onMapRedirect,
                                         }) {
    const { isDarkMode } = useTheme();

    return (
        <div className={styles.container}>
            <div className={styles.dropdownRow}>
                {role === 'administrator' && (
                    <select
                        className={`${styles.dropdown} ${isDarkMode ? styles.dark : ''}`}
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

                {role === 'administrator' && (
                    <select
                        className={`${styles.dropdown} ${isDarkMode ? styles.dark : ''}`}
                        value={selectedManager}
                        onChange={(e) => onChange('manager', e.target.value)}
                        disabled={!selectedCompany}
                    >
                        <option value="">Tüm Managerlar</option>
                        {managers.map((manager) => (
                            <option key={manager.id} value={manager.id}>
                                {manager.name} {manager.lastname}
                            </option>
                        ))}
                    </select>
                )}

                <select
                    className={`${styles.dropdown} ${isDarkMode ? styles.dark : ''}`}
                    value={selectedPersonal}
                    onChange={(e) => onChange('personal', e.target.value)}
                    disabled={role === 'administrator' && !selectedManager}
                >
                    <option value="">Tüm Personeller</option>
                    {personals.map((personal) => (
                        <option key={personal.id} value={personal.id}>
                            {personal.name} {personal.lastname}
                        </option>
                    ))}
                </select>
            </div>

            <button
                onClick={onMapRedirect}
                className={`${styles.button} ${isDarkMode ? styles.buttonDark : styles.buttonLight}`}
            >
                Haritayı Görüntüle
            </button>
        </div>
    );
}
