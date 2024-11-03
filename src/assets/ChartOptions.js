export const getSensorChartOptions = (sensorType, data, interval) => {
    const validData = Array.isArray(data) ? data : [];
    console.log("Valid Data for chart options:", validData);

    // Tarih formatları
    const dateFormatOptions = {
        dakikalık: { hour: '2-digit', minute: '2-digit' },
        saatlik: { month: '2-digit', day: '2-digit', hour: '2-digit' },
        günlük: { month: '2-digit', day: '2-digit' },
        aylık: { year: 'numeric', month: '2-digit' },
        yıllık: { year: 'numeric' }
    };

    const commonOptions = {
        tooltip: {
            trigger: 'axis',
            formatter: (params) => {
                const date = new Date(params[0].axisValue);
                if (isNaN(date)) return params[0].axisValue; // Geçerli bir tarih değilse olduğu gibi göster
                const options = dateFormatOptions[interval] || { hour: '2-digit', minute: '2-digit' };
                const formattedDate = date.toLocaleString('tr-TR', options);
                return `${formattedDate}<br/>${params.map(p => `${p.seriesName}: ${p.data[p.encode.y[0]]}`).join('<br/>')}`;
            }
        },
        xAxis: {
            type: 'category',
            name: 'Time',
            nameLocation: 'middle',
            axisLabel: {
                formatter: function (value) {
                    const date = new Date(value);
                    if (isNaN(date)) return value; // Eğer geçerli bir tarih değilse olduğu gibi göster
                    const options = dateFormatOptions[interval] || { hour: '2-digit', minute: '2-digit' };
                    return date.toLocaleString('tr-TR', options);
                }
            },
        },
        yAxis: {
            name: 'Value',
        },
    };

    // Grafik serilerinin tanımlanması
    switch (sensorType) {
        case 1: // Sıcaklık sensörü
            return [
                {
                    ...commonOptions,
                    title: { text: 'Üst Sağ Nem' },
                    dataset: [{ id: 'dataset_sagUstNem', source: validData }],
                    series: [{
                        type: 'line',
                        name: 'Üst Sağ Nem',
                        datasetId: 'dataset_sagUstNem',
                        showSymbol: false,
                        encode: {
                            x: 'time',
                            y: 'sagUstNem',
                        },
                    }],
                },
                {
                    ...commonOptions,
                    title: { text: 'Üst Sağ Sıcaklık' },
                    dataset: [{ id: 'dataset_sagUstSıcaklık', source: validData }],
                    series: [{
                        type: 'line',
                        name: 'Üst Sağ Sıcaklık',
                        datasetId: 'dataset_sagUstSıcaklık',
                        showSymbol: false,
                        encode: {
                            x: 'time',
                            y: 'sagUstSıcaklık',
                        },
                    }],
                },
                // Diğer alt grafikler buraya eklenebilir...
            ];
        case 2: // Mesafe sensörü
            return {
                ...commonOptions,
                title: { text: 'Mesafe Sensörü' },
                dataset: [{ id: 'dataset_distance', source: validData }],
                series: [{
                    type: 'line',
                    name: 'Mesafe',
                    datasetId: 'dataset_distance',
                    showSymbol: false,
                    encode: {
                        x: 'time',
                        y: 'distance',
                    },
                }],
            };

        case 3: // Yağmur sensörü
            return {
                ...commonOptions,
                title: { text: 'Yağmur Sensörü' },
                dataset: [{ id: 'dataset_rainfall', source: validData }],
                series: [{
                    type: 'line',
                    name: 'Yağmur Miktarı',
                    datasetId: 'dataset_rainfall',
                    showSymbol: false,
                    encode: {
                        x: 'time',
                        y: 'rainFall',
                    },
                }],
            };

        default: // Diğer sensör türleri
            return {
                ...commonOptions,
                title: { text: 'Diğer Sensör Verisi' },
                dataset: [{ id: 'dataset_other', source: validData }],
                series: [{
                    type: 'line',
                    name: 'Değer',
                    datasetId: 'dataset_other',
                    showSymbol: false,
                    encode: {
                        x: 'time',
                        y: 'value',
                    },
                }],
            };
    }
};
