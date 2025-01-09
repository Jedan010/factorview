document.addEventListener('DOMContentLoaded', function() {
    const strategyId = window.location.pathname.split('/').pop();
    fetch(`/api/strategies/${strategyId}`)
        .then(response => response.json())
        .then(data => {
            const strategyData = data.data.values;
            
            // 更新策略名称
            document.getElementById('strategy-name').textContent = strategyData.factor_name[0];
            
            // 更新基本信息
            document.getElementById('strategy-factor-name').textContent = strategyData.factor_name[0];
            document.getElementById('strategy-benchmark-index').textContent = strategyData.benchmark_index[0];
            document.getElementById('strategy-optimizer-index').textContent = strategyData.optimizer_index[0];
            document.getElementById('strategy-pool').textContent = strategyData.pool[0];
            document.getElementById('strategy-status').textContent = strategyData.status[0];
            document.getElementById('strategy-insert-time').textContent = strategyData.insert_time[0];
            document.getElementById('strategy-update-time').textContent = strategyData.update_time[0];

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
