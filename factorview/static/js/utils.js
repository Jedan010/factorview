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

// 计算日期范围
function getDateRange(period, options = {}) {
  const now = options.date || new Date();
  const format = options.format || 'YYYY-MM-DD';
  const timezone = options.timezone || 'UTC';

  const formatDate = (date) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const parts = formatter.format(date);
    return format
      .replace('YYYY', parts[2])
      .replace('MM', parts[0])
      .replace('DD', parts[1]);
  };

  const getStartDate = (years = 0, months = 0, days = 0) => {
    const startDate = new Date(now);
    startDate.setFullYear(now.getFullYear() - years);
    startDate.setMonth(now.getMonth() - months);
    startDate.setDate(now.getDate() - days);
    return startDate;
  };

  const periods = {
    ytd: () => ({
      start_date: formatDate(getStartDate(0, now.getMonth(), now.getDate() - 1)),
      end_date: formatDate(now)
    }),
    '3m': () => ({
      start_date: formatDate(getStartDate(0, 3)),
      end_date: formatDate(now)
    }),
    '1y': () => ({
      start_date: formatDate(getStartDate(1)),
      end_date: formatDate(now)
    }),
    '3y': () => ({
      start_date: formatDate(getStartDate(3)),
      end_date: formatDate(now)
    }),
    '5y': () => ({
      start_date: formatDate(getStartDate(5)),
      end_date: formatDate(now)
    }),
    custom: () => ({
      start_date: options.start_date || null,
      end_date: options.end_date || null
    })
  };

  return periods[period] ? periods[period]() : periods.custom();
}

// 通用表格排序
function sortTable(table, column, options = {}) {
  const {
    dataType = 'auto', // auto|number|string|date
    order = 'asc', // asc|desc
    nullsFirst = true,
    caseSensitive = false,
    customSortFn = null
  } = options;

  const tbody = table.querySelector('tbody');
  if (!tbody) return;

  const rows = Array.from(tbody.querySelectorAll('tr'));
  if (rows.length === 0) return;

  const getCellValue = (row, index) => {
    const cell = row.children[index];
    if (!cell) return null;
    let value = cell.textContent.trim();
    
    if (value === 'N/A' || value === '') return null;
    
    if (dataType === 'number' || (dataType === 'auto' && !isNaN(value))) {
      return parseFloat(value.replace('%', ''));
    }
    
    if (dataType === 'date') {
      return new Date(value);
    }
    
    return caseSensitive ? value : value.toLowerCase();
  };

  const compare = (a, b) => {
    if (a === null && b === null) return 0;
    if (a === null) return nullsFirst ? -1 : 1;
    if (b === null) return nullsFirst ? 1 : -1;
    
    if (customSortFn) {
      return customSortFn(a, b);
    }
    
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }
    
    return a.localeCompare(b, undefined, { numeric: true });
  };

  rows.sort((a, b) => {
    const aValue = getCellValue(a, column);
    const bValue = getCellValue(b, column);
    return order === 'asc' ? compare(aValue, bValue) : compare(bValue, aValue);
  });

  // 清空并重新插入排序后的行
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }
  rows.forEach(row => tbody.appendChild(row));

  // 更新表头样式
  const headers = table.querySelectorAll('th');
  headers.forEach(header => header.classList.remove('sorted-asc', 'sorted-desc'));
  headers[column].classList.add(order === 'asc' ? 'sorted-asc' : 'sorted-desc');
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
    calcPerf,
    getDateRange,
    sortTable
};
