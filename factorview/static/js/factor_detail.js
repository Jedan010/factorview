import { filterByDate, calcNav, calcDrawdown, calcICStats, calcPerf } from './utils.js';

// 数据筛选函数
function filterData() {
    const factorName = window.location.pathname.split('/').pop();
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    fetch(`/api/factors/${factorName}?start=${startDate}&end=${endDate}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            try {
                plotCharts(data);
            } catch (error) {
                console.error('Error plotting charts:', error);
                alert('图表绘制失败，请检查数据格式');
            }
        })
        .catch(error => {
            console.error('Error fetching filtered factor data:', error);
            alert('数据加载失败，请稍后重试');
        });
}

// 绘制图表函数
function plotCharts(data) {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    // 过滤数据
    try {
        data = {
            ic: filterByDate(data.ic?.values, data.ic?.index, startDate, endDate),
            group: filterByDate(data.group?.values, data.group?.index, startDate, endDate),
            backtest_ret: filterByDate(data.backtest_ret?.values, data.backtest_ret?.index, startDate, endDate)
        };

        // 检查过滤后的数据是否为空
        if (!data.ic.values.length || !data.group.values.length || !data.backtest_ret.values.length) {
            throw new Error('过滤后数据为空，请检查日期范围');
        }
    } catch (error) {
        console.error('数据过滤失败:', error);
        alert('数据过滤失败，请检查数据格式');
        return;
    }

    // Plot IC Chart
    Plotly.newPlot('ic-chart', [
        {
            x: data.ic.index,
            y: data.ic.values.map(v => v[0]),
            type: 'bar',
            name: 'Daily IC',
            marker: { color: '#1a73e8' }
        },
        {
            x: data.ic.index,
            y: data.ic.values.map(v => v[1]),
            type: 'scatter',
            mode: 'lines',
            name: '252-Day Rolling Avg',
            line: {
                color: '#ff9900',
                width: 5
            }
        }
    ], {
        title: { text: 'IC Series', font: { size: 20, family: 'Arial, sans-serif', color: '#000', weight: 'bold' } },
        xaxis: { title: { text: 'Date', font: { size: 16, family: 'Arial, sans-serif', color: '#000', weight: 'bold' } } },
        yaxis: { title: { text: 'IC', font: { size: 16, family: 'Arial, sans-serif', color: '#000', weight: 'bold' } } },
        barmode: 'group',
        legend: {
            orientation: 'h',
            y: -0.2,
            x: 0.5,
            xanchor: 'center',
            font: { size: 14, family: 'Arial, sans-serif', color: '#000', weight: 'bold' }
        },
    });

    // 更新统计表格数据
    const stats = calcICStats(data.ic.values);
    document.getElementById('factor-name-cell').textContent = factorName;
    document.getElementById('ic-cell').textContent = stats.ic.toFixed(3);
    document.getElementById('icir-cell').textContent = stats.icir.toFixed(3);
    document.getElementById('tvalue-cell').textContent = stats.tvalue.toFixed(2);
    document.getElementById('positive-ratio-cell').textContent = `${(stats.positiveRatio * 100).toFixed(1)}%`;
    document.getElementById('negative-ratio-cell').textContent = `${(stats.negativeRatio * 100).toFixed(1)}%`;

    // Plot Group Returns Chart
    if (!data.group || !data.group.values || !Array.isArray(data.group.values[0])) {
        console.error('Invalid group data format:', data.group);
        return;
    }

    // 计算每个 group 的绩效指标
    const groupData = data.group.values[0].map((_, i) => ({
        x: data.group.index,
        y: calcNav(data.group.values.map(v => v[i])),
        type: 'scatter',
        mode: 'lines',
        name: i < 10 ? `Group ${i + 1}` : 'LS Hedge',
        line: {
            width: i === 10 ? 6 : 2,
            color: i === 10 ? '#ff0000' : `hsl(${i * 36}, 80%, 50%)`,
            dash: undefined
        }
    }));

    // 增加 LS Hedge 的回撤曲线
    const lsHedgeDrawdown = {
        x: data.group.index,
        y: calcDrawdown(data.group.values.map(v => v[10])),
        type: 'scatter',
        mode: 'lines',
        name: 'LS Hedge Drawdown',
        yaxis: 'y2', // 添加 yaxis 属性指定使用第二个y轴
        fill: 'tozeroy',
        fillcolor: 'rgba(255,0,0,0.3)',
        line: {
            width: 0
        }
    };

    groupData.push(lsHedgeDrawdown);

    Plotly.newPlot('group-chart', groupData, {
        title: { text: 'Group Returns', font: { size: 20, family: 'Arial, sans-serif', color: '#000', weight: 'bold' } },
        xaxis: { title: { text: 'Date', font: { size: 16, family: 'Arial, sans-serif', color: '#000', weight: 'bold' } } },
        yaxis: { title: { text: 'Return', font: { size: 16, family: 'Arial, sans-serif', color: '#000', weight: 'bold' } } },
        yaxis2: { // 添加第二个y轴配置
            title: { text: 'Drawdown', font: { size: 16, family: 'Arial, sans-serif', color: '#000', weight: 'bold' } },
            overlaying: 'y',
            side: 'right',
            tickformat: ',.1%' // 添加百分数格式
        },
        legend: {
            orientation: 'h',
            y: -0.15,
            x: 0.5,
            xanchor: 'center',
            font: { size: 14, family: 'Arial, sans-serif', color: '#000', weight: 'bold' }
        },
    });

    // 更新绩效统计表
    data.group.values[0].forEach((_, i) => {
        const groupReturns = data.group.values.map(v => v[i]);
        const perfStats = calcPerf(groupReturns);

        const row = document.createElement('tr');
        if (i === 10) {
            row.style.backgroundColor = '#fff0f0';
            row.style.fontWeight = 'bold';
        }
        row.innerHTML = `
            <td>${factorName}</td>
            <td>${i < 10 ? `Group ${i + 1}` : 'LS Hedge'}</td>
            <td>${(perfStats.cumulativeReturn * 100).toFixed(2)}%</td>
            <td>${(perfStats.annualizedReturn * 100).toFixed(2)}%</td>
            <td>${(perfStats.annualizedVolatility * 100).toFixed(2)}%</td>
            <td>${(perfStats.maxDrawdown * 100).toFixed(2)}%</td>
            <td>${perfStats.sharpeRatio.toFixed(2)}</td>
            <td>${perfStats.calmarRatio.toFixed(2)}</td>
        `;
        document.getElementById('group-stats-table-container').querySelector('table tbody').appendChild(row);
    });

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
        title: { text: 'Backtest Results', font: { size: 20, family: 'Arial, sans-serif', color: '#000', weight: 'bold' } },
        xaxis: { title: { text: 'Date', font: { size: 16, family: 'Arial, sans-serif', color: '#000', weight: 'bold' } } },
        yaxis: { title: { text: 'Return', font: { size: 16, family: 'Arial, sans-serif', color: '#000', weight: 'bold' } } },
        yaxis2: { // 添加第二个y轴配置
            title: { text: 'Drawdown', font: { size: 16, family: 'Arial, sans-serif', color: '#000', weight: 'bold' } },
            overlaying: 'y',
            side: 'right',
            tickformat: ',.1%' // 添加百分数格式
        },
        legend: {
            orientation: 'h',
            y: -0.15,
            x: 0.5,
            xanchor: 'center',
            font: { size: 14, family: 'Arial, sans-serif', color: '#000', weight: 'bold' }
        }
    });

    // 更新回测统计表
    backtest_names.forEach((name, i) => {
        const returns = data.backtest_ret.values.map(v => v[i]);
        const perfStats = calcPerf(returns);

        // 计算总年数
        const firstDate = new Date(data.backtest_ret.index[0]);
        const lastDate = new Date(data.backtest_ret.index[data.backtest_ret.index.length - 1]);
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
            <td>${factorName}</td>
            <td>${name}</td>
            <td>${(perfStats.cumulativeReturn * 100).toFixed(2)}%</td>
            <td>${totalYears.toFixed(1)}</td>
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

// 页面加载时获取数据并设置事件监听
const factorName = window.location.pathname.split('/').pop();
document.getElementById('factor-name').textContent = factorName;

// 从localStorage读取保存的日期
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');
startDateInput.value = localStorage.getItem('startDate') || '';
endDateInput.value = localStorage.getItem('endDate') || '';

// 设置筛选按钮点击事件
document.querySelector('button').addEventListener('click', () => {
    // 保存选择的日期
    localStorage.setItem('startDate', startDateInput.value);
    localStorage.setItem('endDate', endDateInput.value);
    filterData();
});

fetch(`/api/factors/${factorName}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        try {
            plotCharts(data);
        } catch (error) {
            console.error('Error plotting charts:', error);
            alert('图表绘制失败，请检查数据格式');
        }
    })
    .catch(error => {
        console.error('Error fetching factor data:', error);
        alert('数据加载失败，请稍后重试');
    });
