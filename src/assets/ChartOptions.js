// client/src/assets/ChartOptions.js
export const getSensorChartOptions = (sensorType, data) => {
    const validData = Array.isArray(data) ? data : []; // Eğer data bir dizi değilse, boş bir dizi olarak ayarla

    console.log("Valid Data for chart options:", validData);

    const commonOptions = {
        tooltip: {
            trigger: 'axis',
        },
        xAxis: {
            type: 'category',
            name: 'Time',
            nameLocation: 'middle',
        },
        yAxis: {
            name: 'Value',
        },
    };

    switch (sensorType) {
        case 1: // Sıcaklık sensörü
            // Sıcaklık sensöründe 6 farklı veri gösterilecek (6 ayrı grafik)
            return [
                {
                    ...commonOptions,
                    title: { text: 'Üst Sağ Nem' },
                    dataset: [{ id: 'dataset_sagUstNem', source: validData }],
                    series: [{
                        type: 'line',
                        datasetId: 'dataset_sagUstNem',
                        showSymbol: false,
                        encode: {
                            x: 'time',
                            y: 'sagUstNem',
                            tooltip: ['sagUstNem'],
                        },
                    }],
                },
                {
                    ...commonOptions,
                    title: { text: 'Üst Sağ Sıcaklık' },
                    dataset: [{ id: 'dataset_sagUstSıcaklık', source: validData }],
                    series: [{
                        type: 'line',
                        datasetId: 'dataset_sagUstSıcaklık',
                        showSymbol: false,
                        encode: {
                            x: 'time',
                            y: 'sagUstSıcaklık',
                            tooltip: ['sagUstSıcaklık'],
                        },
                    }],
                },
                {
                    ...commonOptions,
                    title: { text: 'Alt Sağ Nem' },
                    dataset: [{ id: 'dataset_sagAltNem', source: validData }],
                    series: [{
                        type: 'line',
                        datasetId: 'dataset_sagAltNem',
                        showSymbol: false,
                        encode: {
                            x: 'time',
                            y: 'sagAltNem',
                            tooltip: ['sagAltNem'],
                        },
                    }],
                },
                {
                    ...commonOptions,
                    title: { text: 'Alt Sağ Sıcaklık' },
                    dataset: [{ id: 'dataset_sagAltSıcaklık', source: validData }],
                    series: [{
                        type: 'line',
                        datasetId: 'dataset_sagAltSıcaklık',
                        showSymbol: false,
                        encode: {
                            x: 'time',
                            y: 'sagAltSıcaklık',
                            tooltip: ['sagAltSıcaklık'],
                        },
                    }],
                },
                {
                    ...commonOptions,
                    title: { text: 'Alt Sol Nem' },
                    dataset: [{ id: 'dataset_solAltNem', source: validData }],
                    series: [{
                        type: 'line',
                        datasetId: 'dataset_solAltNem',
                        showSymbol: false,
                        encode: {
                            x: 'time',
                            y: 'solAltNem',
                            tooltip: ['solAltNem'],
                        },
                    }],
                },
                {
                    ...commonOptions,
                    title: { text: 'Alt Sol Sıcaklık' },
                    dataset: [{ id: 'dataset_solAltSıcaklık', source: validData }],
                    series: [{
                        type: 'line',
                        datasetId: 'dataset_solAltSıcaklık',
                        showSymbol: false,
                        encode: {
                            x: 'time',
                            y: 'solAltSıcaklık',
                            tooltip: ['solAltSıcaklık'],
                        },
                    }],
                },
            ];

        case 2: // Mesafe sensörü
            return {
                ...commonOptions,
                title: { text: 'Mesafe Sensörü' },
                dataset: [{ id: 'dataset_distance', source: validData }],
                series: [{
                    type: 'line',
                    datasetId: 'dataset_distance',
                    showSymbol: false,
                    encode: {
                        x: 'time',
                        y: 'distance',
                        tooltip: ['distance'],
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
                    datasetId: 'dataset_rainfall',
                    showSymbol: false,
                    encode: {
                        x: 'time',
                        y: 'rainFall',
                        tooltip: ['rainFall'],
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
                    datasetId: 'dataset_other',
                    showSymbol: false,
                    encode: {
                        x: 'time',
                        y: 'value',
                        tooltip: ['value'],
                    },
                }],
            };
    }
};
