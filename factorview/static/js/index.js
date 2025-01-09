// 导入工具函数
import { getDateRange, sortTable } from './utils.js';

// 因子表功能
document.addEventListener('DOMContentLoaded', function () {
  const table = document.querySelector('#factors-table');
  if (!table) return;

  let allFactors = []; // 存储所有因子数据
  const filters = {
    pool: 'all',
    start_date: null,
    end_date: null,
    optimizer_index: '000905.SH',
    benchmark_index: '000905.SH'
  };

  // 初始化表格
  table.setAttribute('data-sort', 'asc');

  // 初始化筛选控件
  const poolFilter = document.getElementById('pool-filter');
  const periodFilter = document.getElementById('period-filter');
  const benchmarkFilter = document.getElementById('benchmark-filter');
  const optimizerFilter = document.getElementById('optimizer-filter');
  const applyFiltersBtn = document.getElementById('apply-filters');

  // 设置筛选控件事件监听
  poolFilter.addEventListener('change', (e) => {
    filters.pool = e.target.value;
  });

  periodFilter.addEventListener('change', (e) => {
    const { start_date, end_date } = getDateRange(e.target.value);
    filters.start_date = start_date;
    filters.end_date = end_date;
  });

  benchmarkFilter.addEventListener('change', (e) => {
    filters.benchmark_index = e.target.value;
  });

  optimizerFilter.addEventListener('change', (e) => {
    filters.optimizer_index = e.target.value === 'NA' ? null : e.target.value;
  });

  applyFiltersBtn.addEventListener('click', () => {
    fetchFactors();
  });

  // 加载数据
  function fetchFactors() {
    const queryParams = new URLSearchParams({
      pool: filters.pool,
      start_date: filters.start_date || '',
      end_date: filters.end_date || '',
      benchmark_index: filters.benchmark_index || '',
      optimizer_index: filters.optimizer_index || ''
    });

    fetch(`/api/factors?${queryParams.toString()}`)
      .then(response => response.json())
      .then(data => {
        // 验证数据格式

        const tbody = table.querySelector('tbody');
        renderTable(data);

        // 初始化排序功能
        initSorting();
      })
      .catch(error => console.error('Error:', error));
  }

  // 初始加载
  fetchFactors();



  function renderTable(factor) {
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';

    for (let i = 0; i < factor.factor_info.index.length; i++) {

      const row = document.createElement('tr');

      // 安全地创建每个单元格
      const createCell = (value, isPercent = false, decimalPlaces = 2) => {
        const cell = document.createElement('td');
        if (value === null || value === undefined) {
          cell.textContent = 'N/A';
        } else {
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            cell.textContent = value;
          } else {
            cell.textContent = isPercent ?
              `${(numValue * 100).toFixed(decimalPlaces)}%` :
              numValue.toFixed(decimalPlaces);
          }
        }
        return cell;
      };

      // 创建链接单元格
      const linkCell = document.createElement('td');
      const link = document.createElement('a');
      link.href = `/factors/${factor.factor_info.index[i]}`;
      link.className = 'factor-link';
      link.dataset.factor = factor.factor_info.index;
      link.textContent = factor.factor_info.index[i];
      linkCell.appendChild(link);

      // 添加所有单元格
      row.appendChild(linkCell);
      row.appendChild(createCell(factor.factor_info.values.class_name[i], false, 0));
      row.appendChild(createCell(factor.ic.values.ic[i], false, 3));
      row.appendChild(createCell(factor.ic.values.icir[i], false, 3));
      row.appendChild(createCell(factor.group.values.top_ret[i], true));
      row.appendChild(createCell(factor.group.values.bottom_ret[i], true));
      row.appendChild(createCell(factor.group.values.long_short_ret[i], true));
      row.appendChild(createCell(factor.backtest_ret.values.annual_return[i], true));
      row.appendChild(createCell(factor.backtest_ret.values.max_drawdown[i], true));
      row.appendChild(createCell(factor.backtest_ret.values.sharpe_ratio[i], false));
      row.appendChild(createCell(factor.backtest_ret.values.calmar_ratio[i], false));
      row.appendChild(createCell(factor.backtest_ret.values.turnover[i], false, 1));

      tbody.appendChild(row);
    }

  };


  function initSorting() {
    // 验证数据格式
    if (!Array.isArray(allFactors)) {
      console.error('Invalid data format in initSorting:', allFactors);
      return;
    }

    const headers = table.querySelectorAll('th');
    headers.forEach((header, index) => {
      // 添加排序按钮
      const sortBtn = document.createElement('div');
      sortBtn.className = 'sort-btn';
      sortBtn.innerHTML = '⇅';
      header.appendChild(sortBtn);

      // 点击排序按钮排序
      sortBtn.addEventListener('click', () => {
        const isAscending = table.getAttribute('data-sort') === 'asc';
        sortTable(table, index, {
          order: isAscending ? 'asc' : 'desc',
          dataType: 'auto'
        });
        table.setAttribute('data-sort', isAscending ? 'desc' : 'asc');
      });
    });
  }
});
