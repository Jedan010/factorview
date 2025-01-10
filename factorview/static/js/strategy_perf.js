import { filterByDate, calcNav, calcDrawdown, calcPerf } from './utils.js';

// 数据筛选函数
function filterData() {
    const strategyName = window.location.pathname.split('/').pop();
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    fetch(`/api/strategy/${strategyName}?start=${startDate}&end=${endDate}`)
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
            console.error('Error fetching filtered strategy data:', error);
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
            backtest_ret: filterByDate(data.backtest_ret?.values, data.backtest_ret?.index, startDate, endDate)
        };

        // 检查过滤后的数据是否为空
        if (!data.backtest_ret.values.length) {
            throw new Error('过滤后数据为空，请检查日期范围');
        }
    } catch (error) {
        console.error('数据过滤失败:', error);
        alert('数据过滤失败，请检查数据格式');
        return;
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
        title: { text: '回测结果', font: { size: 20, family: 'Arial, sans-serif', color: '#000', weight: 'bold' } },
        xaxis: { title: { text: '日期', font: { size: 16, family: 'Arial, sans-serif', color: '#000', weight: 'bold' } } },
        yaxis: { title: { text: '收益率', font: { size: 16, family: 'Arial, sans-serif', color: '#000', weight: 'bold' } } },
        yaxis2: { // 添加第二个y轴配置
            title: { text: '回撤', font: { size: 16, family: 'Arial, sans-serif', color: '#000', weight: 'bold' } },
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

    // 清空并更新回测统计表
    const backtestStatsTable = document.getElementById('backtest-stats-table-container').querySelector('table tbody');
    backtestStatsTable.innerHTML = '';  // 清空表格
    
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
            <td>${strategyName}</td>
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
const strategyName = window.location.pathname.split('/').pop();
document.getElementById('strategy-name').textContent = strategyName;

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

fetch(`/api/strategy/${strategyName}`)
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
        console.error('Error fetching strategy data:', error);
        alert('数据加载失败，请稍后重试');
    });
