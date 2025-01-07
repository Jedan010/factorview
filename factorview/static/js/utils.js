// 通用工具函数

// 计算NAV的函数
function calcNav(dailyReturns) {
    let nav = [1.0]; // 初始净值为1
    for (let i = 0; i < dailyReturns.length; i++) {
        nav.push(nav[i] * (1 + dailyReturns[i]));
    }
    return nav;
}

// 按日期筛选数据
function filterByDate(values = [], index = [], startDate = null, endDate = null) {
    // 输入验证
    if (!Array.isArray(values) || !Array.isArray(index) || values.length !== index.length) {
        console.error('Invalid input data format');
        return { values: [], index: [] };
    }

    const filteredData = [];
    const filteredIndex = [];

    for (let i = 0; i < index.length; i++) {
        const currentDate = index[i];
        // 检查日期是否在范围内
        const afterStart = !startDate || currentDate >= startDate;
        const beforeEnd = !endDate || currentDate <= endDate;

        if (afterStart && beforeEnd) {
            filteredData.push(values[i]);
            filteredIndex.push(currentDate);
        }
    }

    return {
        values: filteredData,
        index: filteredIndex
    };
}

// 计算滚动平均值
function rollingMean(values, period = 252, minPeriod = 60) {
    const rolling = [];
    for (let i = 0; i < values.length; i++) {
        const start = Math.max(0, i - period + 1);
        const slice = values.slice(start, i + 1);
        if (slice.length >= minPeriod) {
            rolling.push(slice.reduce((a, b) => a + b, 0) / slice.length);
        } else {
            rolling.push(null);
        }
    }
    return rolling;
}

// 计算回撤
function calcDrawdown(ret) {
    // 计算累计净值
    const nav = calcNav(ret);
    const dd = [];
    if (nav.length === 0) return dd; // 如果 nav 为空，直接返回空数组

    let currentMax = nav[0];
    dd.push(0); // 第一个回撤为0

    for (let i = 1; i < nav.length; i++) {
        if (nav[i] > currentMax) {
            currentMax = nav[i];
        }
        const drawdownValue = nav[i] / currentMax - 1;
        dd.push(drawdownValue);
    }

    return dd;
}


// 计算最大回撤
function calcMaxDrawdown(ret) {
    const dd = calcDrawdown(ret);
    return Math.min(...dd);
}

// 计算年化收益率
function calcAnnualizedReturn(dailyReturns) {
    if (dailyReturns.length === 0) return 0;
    const totalReturn = calcNav(dailyReturns).slice(-1)[0] - 1;
    return Math.pow(1 + totalReturn, 252 / dailyReturns.length) - 1;
}

// 计算年化波动率
function calcAnnualizedVolatility(dailyReturns) {
    if (dailyReturns.length === 0) return 0;
    return Math.sqrt(252) * Math.sqrt(dailyReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / dailyReturns.length);
}

// 计算夏普比率
function calcSharpeRatio(dailyReturns) {
    const annualizedReturn = calcAnnualizedReturn(dailyReturns);
    const annualizedVol = calcAnnualizedVolatility(dailyReturns);
    return annualizedVol !== 0 ? annualizedReturn / annualizedVol : 0;
}

// 计算卡玛比率
function calcCalmarRatio(dailyReturns) {
    const annualizedReturn = calcAnnualizedReturn(dailyReturns);
    const maxDrawdown = calcMaxDrawdown(dailyReturns);
    return maxDrawdown !== 0 ? annualizedReturn / Math.abs(maxDrawdown) : 0;
}

// 汇总计算所有绩效指标
function calcPerf(dailyReturns) {
    return {
        cumulativeReturn: calcNav(dailyReturns).slice(-1)[0] - 1,
        annualizedReturn: calcAnnualizedReturn(dailyReturns),
        annualizedVolatility: calcAnnualizedVolatility(dailyReturns),
        maxDrawdown: calcMaxDrawdown(dailyReturns),
        sharpeRatio: calcSharpeRatio(dailyReturns),
        calmarRatio: calcCalmarRatio(dailyReturns)
    };
}

// 计算IC统计
function calcICStats(icValues) {
    const icArray = icValues.map(v => v[0]);
    const meanIC = icArray.reduce((sum, value) => sum + value, 0) / icArray.length;
    const stdIC = Math.sqrt(icArray.reduce((sum, value) => sum + Math.pow(value - meanIC, 2), 0) / icArray.length);
    const icir = meanIC / stdIC;
    const tvalue = meanIC / (stdIC / Math.sqrt(icArray.length));
    const positiveCount = icArray.filter(value => value > 0).length;
    const negativeCount = icArray.filter(value => value < 0).length;
    const positiveRatio = positiveCount / icArray.length;
    const negativeRatio = negativeCount / icArray.length;

    return {
        ic: meanIC,
        icir: icir,
        tvalue: tvalue,
        positiveRatio: positiveRatio,
        negativeRatio: negativeRatio
    };
}

// 导出函数供其他模块使用
export {
    calcNav,
    rollingMean,
    filterByDate,
    calcDrawdown,
    calcICStats,
    calcAnnualizedReturn,
    calcAnnualizedVolatility,
    calcSharpeRatio,
    calcCalmarRatio,
    calcPerf
};