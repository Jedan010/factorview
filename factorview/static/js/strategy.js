document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/strategies')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#strategy-table tbody');
            data.data.forEach(strategy => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><a href="/strategies/${strategy.id}">${strategy.name}</a></td>
                    <td>${strategy.category}</td>
                    <td>${strategy.annual_return.toFixed(2)}%</td>
                    <td>${strategy.max_drawdown.toFixed(2)}%</td>
                    <td>${strategy.sharpe_ratio.toFixed(2)}</td>
                    <td>${strategy.created_at}</td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching strategies:', error));
});
