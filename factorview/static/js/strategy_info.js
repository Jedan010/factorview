// 导入工具函数
import { getDateRange, sortTable, createCell } from './utils.js';

// 策略表功能
document.addEventListener('DOMContentLoaded', function () {
  const table = document.querySelector('#strategy-table');
  if (!table) return;

  let allStrategies = []; // 存储所有策略数据
  const filters = {
    pool: 'all',
    benchmark_index: '000905.SH',
    optimizer_index: '000905.SH'
  };

  // 初始化表格
  table.setAttribute('data-sort', 'asc');

  // 筛选器配置
  const filterConfig = {
    pool: [
      { value: 'all', text: '全部', selected: true },
      { value: '000300.SH', text: '沪深300' },
      { value: '000905.SH', text: '中证500' },
      { value: '000852.SH', text: '中证1000' },
      { value: '932000.CSI', text: '中证2000' }
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
      { value: '932000.CSI', text: '中证2000' }
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
  generateFilter('benchmark-filter', filterConfig.benchmark, '基准指数');
  generateFilter('optimizer-filter', filterConfig.optimizer, '优化器');

  const applyFiltersBtn = document.getElementById('apply-filters');

  // 统一事件监听器
  const filterHandlers = {
    'pool-filter': (value) => {
      filters.pool = value;
      console.log('Updated pool filter:', value);
    },
    'benchmark-filter': (value) => {
      filters.benchmark_index = value;
      console.log('Updated benchmark filter:', value);
    },
    'optimizer-filter': (value) => {
      filters.optimizer_index = value;
      console.log('Updated optimizer filter:', value);
    },
  };

  // 事件委托处理所有筛选器
  document.querySelector('.filter-section').addEventListener('change', (e) => {
    const handler = filterHandlers[e.target.id];
    if (handler) {
      handler(e.target.value);
    }
  });

  applyFiltersBtn.addEventListener('click', fetchStrategies);

  // 加载数据
  function fetchStrategies() {
    const queryParams = new URLSearchParams({
      pool: filters.pool,
      benchmark_index: filters.benchmark_index || '',
      optimizer_index: filters.optimizer_index || ''
    });

    fetch(`/api/strategy?${queryParams.toString()}`)
      .then(response => response.json())
      .then(response => {
        console.log('API Response:', response); // Debug logging


        renderTable(response.strategy_info);
        initSorting();
      });
  }

  // 渲染表格
  function renderTable(strategy) {
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';

    for (let i = 0; i < strategy.index.length; i++) {
      const row = document.createElement('tr');


      // 创建链接单元格
      const linkCell = document.createElement('td');
      const link = document.createElement('a');
      link.href = `/strategy/${strategy.index[i]}`;
      link.className = 'strategy-link';
      link.textContent = strategy.index[i];
      linkCell.appendChild(link);

      // 添加所有单元格
      row.appendChild(linkCell);
      row.appendChild(createCell(strategy.values.benchmark_index[i]));
      row.appendChild(createCell(strategy.values.optimizer_index[i]));
      row.appendChild(createCell(strategy.values.pool[i]));
      row.appendChild(createCell(strategy.values.status[i]));
      row.appendChild(createCell(strategy.values.insert_time[i], { isDate: true }));
      row.appendChild(createCell(strategy.values.update_time[i], { isDate: true }));

      tbody.appendChild(row);
    }
  }

  // 初始化排序功能
  function initSorting() {
    const headers = table.querySelectorAll('th');
    headers.forEach((header, index) => {
      const sortBtn = document.createElement('div');
      sortBtn.className = 'sort-btn';
      sortBtn.innerHTML = '⇅';
      header.appendChild(sortBtn);

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

  // 初始加载
  fetchStrategies();
});
