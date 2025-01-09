import React from 'react';
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
    return (
        <div className={styles.sensorDropdownContainer}>
            {role === 'administrator' && (
                <select
                    className={styles.dropdown}
                    onChange={(e) => onChange('company', e.target.value)}
                    value={selectedCompany}
                >
                    <option value="">Tüm Şirketler</option>
                    {companies.map((company) => (
                        <option key={company.code} value={company.code}>
                            {company.name}
                        </option>
                    ))}
                </select>
            )}
            {role === 'administrator' && (
                <select
                    className={styles.dropdown}
                    value={selectedManager}
                    onChange={(e) => onChange('manager', e.target.value)}
                    disabled={!selectedCompany}
                >
                    <option value="">Tüm Yöneticiler</option>
                    {managers.map((manager) => (
                        <option key={manager.id} value={manager.id}>
                            {manager.name} {manager.lastname}
                        </option>
                    ))}
                </select>
            )}
            {role !=='personal' && (
                <select
                    className={styles.dropdown}
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
            )}
            <button
                onClick={onMapRedirect}
                className={styles.mapButton}
            >
                Tüm Haritayı Görüntüle
            </button>
        </div>
    );
}
