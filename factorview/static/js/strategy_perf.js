import { filterByDate, calcNav, calcDrawdown, calcPerf, createCell, sortTable, getDateRange } from './utils.js';

// 页面加载时获取数据并设置事件监听
const strategyName = window.location.pathname.split('/').pop();
document.getElementById('strategy-name').textContent = strategyName;

// 因子表功能
const filters = {
    pool: 'all',
    start_date: null,
    end_date: null,
    optimizer_index: '000905.SH',
    benchmark_index: '000905.SH'
};

// 从localStorage读取保存的日期
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');
startDateInput.value = localStorage.getItem('startDate') || '';
endDateInput.value = localStorage.getItem('endDate') || '';

// 筛选器配置
const filterConfig = {
    pool: [
        { value: 'all', text: '全部', selected: true },
        { value: '000300.SH', text: '沪深300' },
        { value: '000905.SH', text: '中证500' },
        { value: '000852.SH', text: '中证1000' },
        { value: '932000.CSI', text: '中证2000' }
    ],
    period: [
        { value: 'all', text: '全部', selected: true },
        { value: 'ytd', text: '年初至今' },
        { value: '3m', text: '近3个月' },
        { value: '1y', text: '近1年' },
        { value: '3y', text: '近3年' },
        { value: '5y', text: '近5年' }
    ],
    benchmark: [
        { value: '000905.SH', text: '中证500', selected: true },
        { value: '000300.SH', text: '沪深300' },
        { value: '000852.SH', text: '中证1000' },
        { value: '932000.CSI', text: '中证2000' }
    ],
    optimizer: [
        { value: '000905.SH', text: '中证500', selected: true },
        { value: '000300.SH', text: '沪深300' },
        { value: '000852.SH', text: '中证1000' },
        { value: '932000.CSI', text: '中证2000' },
        { value: 'NA', text: 'NA' }
    ]
};

// 动态生成筛选器
function generateFilter(containerId, options, labelText) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 创建标签
    const label = document.createElement('label');
    label.textContent = labelText + ':';
    container.appendChild(label);

    // 创建选择框
    const select = document.createElement('select');
    select.id = containerId;

    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.textContent = option.text;
        if (option.selected) {
            opt.selected = true;
        }
        select.appendChild(opt);
    });

    container.appendChild(select);
}

// 初始化筛选控件
generateFilter('pool-filter', filterConfig.pool, '股票池');
generateFilter('period-filter', filterConfig.period, '时间周期');
generateFilter('benchmark-filter', filterConfig.benchmark, '基准指数');
generateFilter('optimizer-filter', filterConfig.optimizer, '优化器');

const applyFiltersBtn = document.getElementById('apply-filters');

// 筛选器事件处理
const filterHandlers = {
    'pool-filter': (value) => {
        filters.pool = value;
        console.log('Updated pool filter:', value);
    },
    'period-filter': (value) => {
        const { start_date, end_date } = getDateRange(value);
        filters.start_date = start_date;
        filters.end_date = end_date;
        console.log('Updated period filter:', value, start_date, end_date);
    },
    'benchmark-filter': (value) => {
        filters.benchmark_index = value;
        console.log('Updated benchmark filter:', value);
    },
    'optimizer-filter': (value) => {
        filters.optimizer_index = value === 'NA' ? null : value;
        console.log('Updated optimizer filter:', value);
    },
    'start-date': (value) => {
        filters.start_date = value;
        localStorage.setItem('startDate', value);
        console.log('Updated start date:', value);
    },
    'end-date': (value) => {
        filters.end_date = value;
        localStorage.setItem('endDate', value);
        console.log('Updated end date:', value);
    }
};

// 事件委托处理所有筛选器
// 处理常规筛选器变化
document.querySelector('.filter-section').addEventListener('change', (e) => {
    const handler = filterHandlers[e.target.id];
    if (handler) {
        handler(e.target.value);
    }
});

// 单独处理日期输入框的input事件
document.getElementById('start-date').addEventListener('input', (e) => {
    filterHandlers['start-date'](e.target.value);
});

document.getElementById('end-date').addEventListener('input', (e) => {
    filterHandlers['end-date'](e.target.value);
});

applyFiltersBtn.addEventListener('click', fetchData);

// 加载数据
function fetchData() {
    const strategyName = window.location.pathname.split('/').pop();
    const queryParams = new URLSearchParams({
        pool: filters.pool,
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        benchmark_index: filters.benchmark_index || '',
        optimizer_index: filters.optimizer_index || ''
    });

    fetch(`/api/strategy/${strategyName}?${queryParams.toString()}`)
        .then(response => response.json())
        .then(strategy => {
            plotCharts(strategy);
        });

    fetch(`/api/strategy/${strategyName}/factors?${queryParams.toString()}`)
        .then(response => response.json())
        .then(factor => {
            renderTable(factor);

        });

}

// 绘制图表函数
function plotCharts(data) {
    const strategyName = window.location.pathname.split('/').pop();
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    // 过滤数据
    data = {
        backtest_ret: filterByDate(data.backtest_ret?.values, data.backtest_ret?.index, startDate, endDate)
    };

    // 检查过滤后的数据是否为空
    if (!data.backtest_ret.values.length) {
        throw new Error('过滤后数据为空，请检查日期范围');
    }

    // Plot Backtest Results Chart
    const backtest_names = ["Strategy", "Index", "Excess"]
    const backtestData = backtest_names.map((_, i) => ({
        x: data.backtest_ret.index,
        y: calcNav(data.backtest_ret.values.map(v => v[i])),
        type: 'scatter',
        mode: 'lines',
        name: backtest_names[i],
        line: {
            width: i === 2 ? 4 : 2,
            color: i === 2 ? '#ff0000' : undefined
        }
    }));

    backtestData.push(
        {
            x: data.backtest_ret.index,
            y: calcDrawdown(data.backtest_ret.values.map(v => v[2])),
            type: 'scatter',
            mode: 'lines',
            name: 'Drawdown',
            yaxis: 'y2', // 添加 yaxis 属性指定使用第二个y轴
            fill: 'tozeroy',
            fillcolor: 'rgba(255,0,0,0.3)',
            line: {
                width: 0
            }
        }
    );

    Plotly.newPlot('backtest-chart', backtestData, {
        title: { text: '回测表现', font: { size: 30, color: '#1a73e8', weight: 'bold' } },
        yaxis: { title: { text: '收益率', font: { size: 16, weight: 'bold' } } },
        yaxis2: { // 添加第二个y轴配置
            title: { text: '回撤', font: { size: 16, weight: 'bold' } },
            overlaying: 'y',
            side: 'right',
            tickformat: ',.1%' // 添加百分数格式
        },
        legend: {
            orientation: 'h',
            y: -0.05,
            x: 0.5,
            xanchor: 'center',
            font: { size: 14, weight: 'bold' }
        },
        plot_bgcolor: "rgba(0,0,0,0)",
        paper_bgcolor: "rgba(0,0,0,0)",
    });

    // 清空并更新回测统计表
    const backtestStatsTable = document.getElementById('backtest-stats-table-container').querySelector('table tbody');
    backtestStatsTable.innerHTML = '';  // 清空表格

    backtest_names.forEach((name, i) => {
        const returns = data.backtest_ret.values.map(v => v[i]);
        const perfStats = calcPerf(returns);

        // 计算总年数
        const firstDate = new Date(data.backtest_ret.index[0]);
        const lastDate = new Date(data.backtest_ret.index.at(-1));
        const totalYears = (lastDate - firstDate) / (1000 * 60 * 60 * 24 * 365);

        // 计算新增指标
        const positions = data.backtest_ret.values.map(v => v[v.length - 3]); // 持仓数
        const turnovers = data.backtest_ret.values.map(v => v[v.length - 2]); // 换手率
        const fees = data.backtest_ret.values.map(v => v[v.length - 1]); // 交易费率

        const avgPosition = positions.reduce((a, b) => a + b, 0) / positions.length;
        const annualTurnover = turnovers.reduce((a, b) => a + b, 0) / totalYears;
        const annualFee = fees.reduce((a, b) => a + b, 0) / totalYears;

        const row = document.createElement('tr');
        if (i === 2) {
            row.style.backgroundColor = '#fff0f0';
            row.style.fontWeight = 'bold';
        }
        row.innerHTML = `
            <td>${strategyName}</td>
            <td>${name}</td>
            <td>${data.backtest_ret.index[0]}</td>
            <td>${data.backtest_ret.index.at(-1)}</td>
            <td>${totalYears.toFixed(1)}</td>
            <td>${(perfStats.cumulativeReturn * 100).toFixed(2)}%</td>            
            <td>${(perfStats.annualizedReturn * 100).toFixed(2)}%</td>
            <td>${(perfStats.annualizedVolatility * 100).toFixed(2)}%</td>
            <td>${(perfStats.maxDrawdown * 100).toFixed(2)}%</td>
            <td>${perfStats.sharpeRatio.toFixed(2)}</td>
            <td>${perfStats.calmarRatio.toFixed(2)}</td>
            <td>${avgPosition.toFixed(0)}</td>
            <td>${(annualTurnover).toFixed(0)}</td>
            <td>${(annualFee * 100).toFixed(2)}%</td>
        `;
        document.getElementById('backtest-stats-table-container').querySelector('table tbody').appendChild(row);
    });
}


function renderTable(factor) {
    const table = document.getElementById('factor-table');
    const tbody = table.querySelector('tbody');
    tbody.setAttribute('data-sort', 'asc');

    // Clear existing sort buttons
    const headers = table.querySelectorAll('th');
    headers.forEach(header => {
        const existingBtn = header.querySelector('.sort-btn');
        if (existingBtn) {
            header.removeChild(existingBtn);
        }
    });

    tbody.innerHTML = '';

    for (let i = 0; i < factor.factor_info.index.length; i++) {
        const row = document.createElement('tr');

        // 创建链接单元格
        const factorName = factor.factor_info.index[i];
        const linkCell = document.createElement('td');
        const link = document.createElement('a');
        link.href = `/factor/${factorName}`;
        link.className = 'factor-link';
        link.dataset.factor = factor.factor_info.index;
        link.textContent = factorName;
        linkCell.appendChild(link);

        // 添加所有单元格
        row.appendChild(linkCell);
        row.appendChild(createCell(factor.factor_info.values.class_name[i]));
        row.appendChild(createCell(factor.date.values.min[i], { isDate: true }));
        row.appendChild(createCell(factor.date.values.max[i], { isDate: true }));
        row.appendChild(createCell(factor.ic.values.ic[i], { isNum: true, decimalPlaces: 3 }));
        row.appendChild(createCell(factor.ic.values.icir[i], { isNum: true, decimalPlaces: 3 }));
        row.appendChild(createCell(factor.group.values.top_ret[i], { isNum: true, isPercent: true }));
        row.appendChild(createCell(factor.group.values.bottom_ret[i], { isNum: true, isPercent: true }));
        row.appendChild(createCell(factor.group.values.long_short_ret[i], { isNum: true, isPercent: true }));
        row.appendChild(createCell(factor.backtest_ret.values.annual_return[i], { isNum: true, isPercent: true }));
        row.appendChild(createCell(factor.backtest_ret.values.max_drawdown[i], { isNum: true, isPercent: true }));
        row.appendChild(createCell(factor.backtest_ret.values.sharpe_ratio[i], { isNum: true }));
        row.appendChild(createCell(factor.backtest_ret.values.calmar_ratio[i], { isNum: true }));
        row.appendChild(createCell(factor.backtest_ret.values.turnover[i], { isNum: true, decimalPlaces: 1 }));

        tbody.appendChild(row);
    }

    initSorting();

};


function initSorting() {
    const table = document.getElementById('factor-table');
    const tbody = table.querySelector('tbody');

    const headers = table.querySelectorAll('th');
    headers.forEach((header, index) => {
        // 点击表头排序
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => {
            const isAscending = tbody.getAttribute('data-sort') === 'asc';
            sortTable(table, index, {
                order: isAscending ? 'asc' : 'desc',
                dataType: 'auto'
            });
            tbody.setAttribute('data-sort', isAscending ? 'desc' : 'asc');

            // 更新表头样式
            headers.forEach(h => h.classList.remove('sorted-asc', 'sorted-desc'));
            header.classList.add(isAscending ? 'sorted-desc' : 'sorted-asc');
        });
    });
};

// Initial data load
fetchData();
