// services/FilterService.js

export const filterManagersByCompany = (managers, companyCode) => {
    if (!companyCode) return managers; // Eğer companyCode yoksa tüm managerleri döndür

    return managers.filter(manager => manager.companyCode === companyCode);
};

export const filterSensorsByCompany = (sensors, companyCode) => {
    if (!companyCode) return sensors; // Eğer companyCode yoksa tüm sensörleri döndür

    return sensors.filter(sensor => sensor.company_code === companyCode);
};

export const filterPersonalsByCompany = (personals, companyCode) => {
    if (!companyCode) return personals; // Eğer companyCode yoksa tüm personelleri döndür

    return personals.filter(personal => personal.companyCode === companyCode);
};

export const filterPersonalsByManager = (personals, managerId) => {
    if (!managerId) return personals; // Eğer managerId yoksa tüm personelleri döndür

    return personals.filter(personal => personal.creator_id === parseInt(managerId));
};

export const filterSensorsByManager = (sensors, sensorOwners, managerId) => {
    if (!managerId) return sensors; // Eğer managerId yoksa tüm sensörleri döndür

    const filteredOwner = sensorOwners.filter(owner => owner.sensor_owner === parseInt(managerId));
    const sensorIds = filteredOwner.map(owner => owner.sensor_id);
    return sensors.filter(sensor => sensorIds.includes(sensor.id));
};

export const filterSensorsByPersonal = (sensors, sensorOwners, personalId) => {
    if (!personalId) return sensors; // Eğer personalId yoksa tüm sensörleri döndür

    const filteredOwner = sensorOwners.filter(owner => owner.sensor_owner === parseInt(personalId));
    const sensorIds = filteredOwner.map(owner => owner.sensor_id);
    return sensors.filter(sensor => sensorIds.includes(sensor.id));
};
