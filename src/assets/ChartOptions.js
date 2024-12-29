export const getSensorChartOptions = (sensorTypeDetails, data, interval) => {
    const validData = Array.isArray(data) ? data : [];
    console.log(validData);
    console.log("deneme");
    if (!validData.length) {
        console.warn("Grafik için geçerli veri yok.");
        return [{ title: { text: "Veri Yok" }, series: [] }];
    }
    console.log("asdasdsad",sensorTypeDetails)
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

                // Veritabanındaki verinin zaman bilgisi
                const realTime = new Date(params[0]?.data?.time);
                const realFormattedDate = realTime.toLocaleString("tr-TR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                });

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

                // Tooltip'ı veritabanındaki zaman bilgisi ile gösteriyoruz
                return `${realFormattedDate}<br/>Zaman: ${formattedDate}<br/>${params
                    .map(
                        (p) =>
                            `${p.seriesName}: ${p.data?.[p.seriesName]?.toFixed(2) || "N/A"}`
                    )
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

        // Veriyi işliyoruz
        const selectedData = validData.map(item => {
            const normalizedKeys = Object.keys(item).reduce((acc, key) => {
                acc[key.toLowerCase()] = key; // Anahtarları küçük harfe çevirip asıl değerle eşleştir
                return acc;
            }, {});

            const normalizedDataName = dataName.toLowerCase(); // dataName'i küçük harfe çevir
            const actualKey = normalizedKeys[normalizedDataName]; // Orijinal anahtarı bul
            let value = actualKey ? item[actualKey] : undefined;

            console.log("Original Data Name:", dataName);
            console.log("Normalized Data Name:", normalizedDataName);
            console.log("Actual Key:", actualKey);
            console.log("Value:", value);

            const selectedDataItem = {
                time: item.time,
                [dataName]: value !== undefined ? value : "N/A", // Varsayılan değer
            };

            return selectedDataItem;
        });



        charts.push({
            ...commonOptions,
            title: { text: `${dataName}` },
            dataset: { source: selectedData  },
            series: [
                {
                    type: "line",
                    name: dataName,
                    encode: { x: "time", y: dataName },
                    showSymbol: false,
                },
            ],
        });
    }

    return charts;
};
