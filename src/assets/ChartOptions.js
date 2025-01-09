export const getSensorChartOptions = (sensorTypeDetails, data, interval, chartType = 'line') => {
    const validData = Array.isArray(data) ? data : [];
    console.log(validData);

    if (!validData.length) {
        console.warn("Grafik için geçerli veri yok.");
        return [{ title: { text: "Veri Yok" }, series: [] }];
    }

    if (!sensorTypeDetails) {
        console.error("Sensör tipi bilgileri eksik.");
        return [{ title: { text: "Geçersiz Sensör Tipi Bilgisi" }, series: [] }];
    }

    let { dataCount, dataNames } = sensorTypeDetails;

    try {
        if (typeof dataNames === "string") {
            dataNames = JSON.parse(dataNames.trim());
        }
    } catch (error) {
        console.error("dataNames geçerli bir JSON değil:", error);
        return [{ title: { text: "Geçersiz Veri İsimleri" }, series: [] }];
    }

    dataCount = parseInt(dataCount, 10);
    if (isNaN(dataCount) || dataCount <= 0) {
        console.error("Geçersiz dataCount değeri.");
        return [{ title: { text: "Geçersiz Sensör Tipi Bilgisi" }, series: [] }];
    }

    if (!Array.isArray(dataNames) || dataNames.length !== dataCount) {
        console.error("dataNames uzunluğu ve dataCount değeri eşleşmiyor.");
        return [{ title: { text: "Geçersiz Sensör Tipi Bilgisi" }, series: [] }];
    }

    const dateFormatOptions = {
        dakikalık: { hour: "2-digit", minute: "2-digit" },
        saatlik: { month: "2-digit", day: "2-digit", hour: "2-digit" },
        günlük: { month: "2-digit", day: "2-digit" },
        aylık: { year: "numeric", month: "2-digit" },
        yıllık: { year: "numeric" },
    };

    const commonOptions = {
        tooltip: {
            trigger: "axis",
            formatter: (params) => {
                const date = new Date(params[0]?.axisValue || "zaman alınamadı");

                const formattedDate = isNaN(date)
                    ? params[0]?.axisValue
                    : date.toLocaleString("tr-TR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                    });

                return `${formattedDate}<br/>${params
                    .map((p) => {
                        const value = p.data?.[p.seriesName];
                        const formattedValue =
                            typeof value === "number" ? value.toFixed(2) : value || "N/A";
                        return `${p.seriesName}: ${formattedValue}`;
                    })
                    .join("<br/>")}`;
            },
        },
        xAxis: {
            type: "category",
            name: "\n\nZaman",
            nameLocation: "middle",
            axisLabel: {
                formatter: (value) => {
                    const date = new Date(value);
                    const options =
                        dateFormatOptions[interval] || { hour: "2-digit", minute: "2-digit" };
                    return isNaN(date)
                        ? value
                        : date.toLocaleString("tr-TR", options);
                },
            },
        },
        yAxis: {
            name: "Değer",
        },
    };

    const charts = [];
    for (let i = 0; i < dataCount; i++) {
        const dataName = dataNames[i];

        const selectedData = validData.map((item) => {
            const normalizedKeys = Object.keys(item).reduce((acc, key) => {
                acc[key.toLowerCase()] = key;
                return acc;
            }, {});

            const normalizedDataName = dataName.toLowerCase();
            const actualKey = normalizedKeys[normalizedDataName];
            const value = actualKey ? item[actualKey] : null;

            return {
                time: item.time,
                [dataName]: value !== null ? value : "N/A",
            };
        });

        charts.push({
            ...commonOptions,
            title: { text: `${dataName} (${chartType === 'bar' ? 'Dikdörtgen' : 'Çizgi'})` },
            dataset: { source: selectedData },
            series: [
                {
                    type: chartType,
                    name: dataName,
                    encode: { x: "time", y: dataName },
                    showSymbol: chartType !== 'bar',
                },
            ],
        });
    }

    return charts;
};
