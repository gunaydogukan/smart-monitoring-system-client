export const getSensorChartOptions = (sensorType, data, interval) => {
    const validData = Array.isArray(data) ? data : [];
    //console.log("Valid Data for chart options:", validData);

    // Tarih formatları
    const dateFormatOptions = {
        dakikalık: { hour: '2-digit', minute: '2-digit' },
        saatlik: { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' },
        günlük: { month: '2-digit', day: '2-digit' },
        aylık: { year: 'numeric', month: '2-digit' },
        yıllık: { year: 'numeric' }
    };

    const commonOptions = {
        tooltip: {
            trigger: 'axis',
            formatter: (params) => {
                console.log(params)
                let date = new Date(params[0].axisValue);
                if (isNaN(date)){
                    date =  params[0].axisValue;
                }
                const options = dateFormatOptions[interval] || { hour: '2-digit', minute: '2-digit' };
                const formattedDate = date.toLocaleString('tr-TR', options);

                // Tooltip içeriğini dinamik olarak oluşturuyoruz
                return `${formattedDate}<br/>${params.map(p => {
                    const seriesName = p.seriesName;
                    const value = p.data[seriesName];
                    const time = p.data.time;
                    //console.log(time);
                    return `${time} - ${seriesName}: ${value != null ? value.toFixed(2) : 'N/A'}`;
                }).join('<br/>')}`;
            }
        },
        xAxis: {
            type: 'category',
            name: 'Time',
            nameLocation: 'middle',
            axisLabel: {
                formatter: function (value) {
                    const date = new Date(value);
                    if (isNaN(date)) return value;
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
                        name: 'sagUstNem',
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
                        name: 'sagUstSıcaklık',
                        datasetId: 'dataset_sagUstSıcaklık',
                        showSymbol: false,
                        encode: {
                            x: 'time',
                            y: 'sagUstSıcaklık',
                        },
                    }],
                },
                {
                    ...commonOptions,
                    title: { text: 'Alt Sağ Nem' },
                    dataset: [{ id: 'dataset_sagAltNem', source: validData }],
                    series: [{
                        type: 'line',
                        name: 'sagAltNem',
                        datasetId: 'dataset_sagAltNem',
                        showSymbol: false,
                        encode: {
                            x: 'time',
                            y: 'sagAltNem',
                        },
                    }],
                },
                {
                    ...commonOptions,
                    title: { text: 'Alt Sağ Sıcaklık' },
                    dataset: [{ id: 'dataset_sagAltSıcaklık', source: validData }],
                    series: [{
                        type: 'line',
                        name: 'sagAltSıcaklık',
                        datasetId: 'dataset_sagAltSıcaklık',
                        showSymbol: false,
                        encode: {
                            x: 'time',
                            y: 'sagAltSıcaklık',
                        },
                    }],
                },
                {
                    ...commonOptions,
                    title: { text: 'Alt Sol Nem' },
                    dataset: [{ id: 'dataset_solAltNem', source: validData }],
                    series: [{
                        type: 'line',
                        name: 'solAltNem',
                        datasetId: 'dataset_solAltNem',
                        showSymbol: false,
                        encode: {
                            x: 'time',
                            y: 'solAltNem',
                        },
                    }],
                },
                {
                    ...commonOptions,
                    title: { text: 'Alt Sol Sıcaklık' },
                    dataset: [{ id: 'dataset_solAltSıcaklık', source: validData }],
                    series: [{
                        type: 'line',
                        name: 'solAltSıcaklık',
                        datasetId: 'dataset_solAltSıcaklık',
                        showSymbol: false,
                        encode: {
                            x: 'time',
                            y: 'solAltSıcaklık',
                        },
                    }],
                }
            ];

        case 2: // Mesafe sensörü
            return {
                ...commonOptions,
                title: { text: 'Mesafe Sensörü' },
                dataset: [{ source: validData }],
                series: [{
                    type: 'line',
                    name: 'distance',
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
                dataset: [{ source: validData }],
                series: [{
                    type: 'line',
                    name: 'rainFall',
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
                title: { text: 'Sensör Verisi' },
                dataset: [{ source: validData }],
                series: [{
                    type: 'line',
                    name: 'value',
                    showSymbol: false,
                    encode: {
                        x: 'time',
                        y: 'value',
                    },
                }],
            };
    }
};
