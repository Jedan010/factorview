// 导入工具函数
import { getDateRange, sortTable, createCell } from './utils.js';

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

  // 从localStorage读取保存的日期
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');
  startDateInput.value = localStorage.getItem('startDate') || '';
  endDateInput.value = localStorage.getItem('endDate') || '';

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

  // 统一事件监听器
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

  applyFiltersBtn.addEventListener('click', fetchFactors);

  // 加载数据
  function fetchFactors() {
    const queryParams = new URLSearchParams({
      pool: filters.pool,
      start_date: filters.start_date || '',
      end_date: filters.end_date || '',
      benchmark_index: filters.benchmark_index || '',
      optimizer_index: filters.optimizer_index || ''
    });

    fetch(`/api/factor?${queryParams.toString()}`)
      .then(response => response.json())
      .then(data => {
        renderTable(data);

        // 初始化排序功能
        initSorting();
      })
  }


  // 初始加载
  fetchFactors();


  function renderTable(factor) {
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';

    for (let i = 0; i < factor.factor_info.index.length; i++) {

      const row = document.createElement('tr');


      // 创建链接单元格
      const linkCell = document.createElement('td');
      const link = document.createElement('a');
      link.href = `/factor/${factor.factor_info.index[i]}`;
      link.className = 'factor-link';
      link.dataset.factor = factor.factor_info.index;
      link.textContent = factor.factor_info.index[i];
      linkCell.appendChild(link);

      // 添加所有单元格
      row.appendChild(linkCell);
      row.appendChild(createCell(factor.factor_info.values.class_name[i]));
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
