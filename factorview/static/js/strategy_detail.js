document.addEventListener('DOMContentLoaded', function() {
    const strategyId = window.location.pathname.split('/').pop();
    fetch(`/api/strategies/${strategyId}`)
        .then(response => response.json())
        .then(data => {
            // 更新策略名称
            document.getElementById('strategy-name').textContent = data.name;

            // 更新统计信息
            document.getElementById('annual-return').textContent = `${data.annual_return.toFixed(2)}%`;
            document.getElementById('max-drawdown').textContent = `${data.max_drawdown.toFixed(2)}%`;
            document.getElementById('sharpe-ratio').textContent = data.sharpe_ratio.toFixed(2);
            document.getElementById('win-rate').textContent = `${data.win_rate.toFixed(1)}%`;
            document.getElementById('trade-count').textContent = data.trade_count;
            document.getElementById('avg-holding-period').textContent = `${data.avg_holding_period.toFixed(1)}天`;

            // 绘制图表
            const ctx = document.getElementById('performance-chart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.performance.labels,
                    datasets: [{
                        label: '策略表现',
                        data: data.performance.values,
                        borderColor: '#007bff',
                        fill: false
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        })
        .catch(error => console.error('Error fetching strategy details:', error));
});
