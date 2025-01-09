// 因子表功能
document.addEventListener('DOMContentLoaded', function () {
  const table = document.querySelector('#factors-table');
  if (!table) return;

  let allFactors = []; // 存储所有因子数据
  const filters = {
    factor_name: '',
    class_name: '',
    ic: { min: null, max: null },
    icir: { min: null, max: null },
    top_ret: { min: null, max: null },  // 头部收益
    bottom_ret: { min: null, max: null },  // 尾部收益
    long_short_ret: { min: null, max: null },  // 多空收益
    annual_return: { min: null, max: null },  // 年化收益
    max_drawdown: { min: null, max: null },  // 最大回撤
    sharpe_ratio: { min: null, max: null },
    calmar_ratio: { min: null, max: null },  // 卡玛比率
    turnover: { min: null, max: null },
    pool: 'all',
    start_date: null,
    end_date: null,
    optimizer_index: '000905.SH',
    benchmark_index: '000905.SH'
  };

  // 日期计算函数
  function getDateRange(period) {
    const now = new Date();
    switch (period) {
      case 'ytd': {
        const startDate = new Date(now);
        startDate.setMonth(0, 1);
        return {
          start_date: startDate.toISOString().split('T')[0],
          end_date: now.toISOString().split('T')[0]
        };
      }
      case '3m': {
        const startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        return {
          start_date: startDate.toISOString().split('T')[0],
          end_date: now.toISOString().split('T')[0]
        };
      }
      case '1y': {
        const startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        return {
          start_date: startDate.toISOString().split('T')[0],
          end_date: now.toISOString().split('T')[0]
        };
      }
      case '3y': {
        const startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 3);
        return {
          start_date: startDate.toISOString().split('T')[0],
          end_date: now.toISOString().split('T')[0]
        };
      }
      case '5y': {
        const startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 5);
        return {
          start_date: startDate.toISOString().split('T')[0],
          end_date: now.toISOString().split('T')[0]
        };
      }
      default:
        return { start_date: null, end_date: null };
    }
  }

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

  function applyFilters() {
    // 获取选中的factor_name
    const selectedFactorNames = Array.from(
      document.querySelectorAll('#factor-name-filters input:checked')
    ).map(input => input.value);

    // 获取选中的class_name
    const selectedClassNames = Array.from(
      document.querySelectorAll('#type-filters input:checked')
    ).map(input => input.value);

    const filteredData = allFactors.filter(factor => {
      try {
        // 检查factor_name筛选
        if (selectedFactorNames.length > 0 && !selectedFactorNames.includes(factor.factor_info?.index)) {
          return false;
        }
        // 检查class_name筛选
        if (selectedClassNames.length > 0 && !selectedClassNames.includes(factor.factor_info?.values?.class_name)) {
          return false;
        }

        // 检查数值型字段筛选
        if (filters.ic.min !== null && (factor.ic?.values?.ic ?? Infinity) < filters.ic.min) {
          return false;
        }
        if (filters.ic.max !== null && (factor.ic?.values?.ic ?? -Infinity) > filters.ic.max) {
          return false;
        }
        if (filters.icir.min !== null && (factor.ic?.values?.icir ?? Infinity) < filters.icir.min) {
          return false;
        }
        if (filters.icir.max !== null && (factor.ic?.values?.icir ?? -Infinity) > filters.icir.max) {
          return false;
        }
        if (filters.top_ret.min !== null && (factor.group?.values?.top_ret ?? Infinity) < filters.top_ret.min) {
          return false;
        }
        if (filters.top_ret.max !== null && (factor.group?.values?.top_ret ?? -Infinity) > filters.top_ret.max) {
          return false;
        }
        if (filters.bottom_ret.min !== null && (factor.group?.values?.bottom_ret ?? Infinity) < filters.bottom_ret.min) {
          return false;
        }
        if (filters.bottom_ret.max !== null && (factor.group?.values?.bottom_ret ?? -Infinity) > filters.bottom_ret.max) {
          return false;
        }
        if (filters.long_short_ret.min !== null && (factor.group?.values?.long_short_ret ?? Infinity) < filters.long_short_ret.min) {
          return false;
        }
        if (filters.long_short_ret.max !== null && (factor.group?.values?.long_short_ret ?? -Infinity) > filters.long_short_ret.max) {
          return false;
        }
        if (filters.annual_return.min !== null && (factor.backtest_ret?.values?.annual_return ?? Infinity) < filters.annual_return.min) {
          return false;
        }
        if (filters.annual_return.max !== null && (factor.backtest_ret?.values?.annual_return ?? -Infinity) > filters.annual_return.max) {
          return false;
        }
        if (filters.max_drawdown.min !== null && (factor.backtest_ret?.values?.max_drawdown ?? Infinity) < filters.max_drawdown.min) {
          return false;
        }
        if (filters.max_drawdown.max !== null && (factor.backtest_ret?.values?.max_drawdown ?? -Infinity) > filters.max_drawdown.max) {
          return false;
        }
        if (filters.sharpe_ratio_ratio.min !== null && (factor.backtest_ret?.values?.sharpe_ratio ?? Infinity) < filters.sharpe_ratio.min) {
          return false;
        }
        if (filters.sharpe_ratio.max !== null && (factor.backtest_ret?.values?.sharpe_ratio ?? -Infinity) > filters.sharpe_ratio.max) {
          return false;
        }
        if (filters.calmar_ratio.min !== null && (factor.backtest_ret?.values?.calmar_ratio ?? Infinity) < filters.calmar_ratio.min) {
          return false;
        }
        if (filters.calmar_ratio.max !== null && (factor.backtest_ret?.values?.calmar_ratio ?? -Infinity) > filters.calmar_ratio.max) {
          return false;
        }
        if (filters.turnover.min !== null && (factor.backtest_ret?.values?.turnover ?? Infinity) < filters.turnover.min) {
          return false;
        }
        if (filters.turnover.max !== null && (factor.backtest_ret?.values?.turnover ?? -Infinity) > filters.turnover.max) {
          return false;
        }

        return true;
      } catch (error) {
        console.error('Error filtering factor:', error);
        return false;
      }
    });

    renderTable(filteredData);
  }

  // 生成复选框列表
  function generateCheckboxFilters(data, field, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 验证数据格式
    if (!Array.isArray(data)) {
      console.error('Invalid data format in generateCheckboxFilters:', data);
      return;
    }

    // 获取所有唯一值
    const uniqueValues = [...new Set(data
      .filter(f => {
        try {
          return f.factor_info &&
            f.factor_info.index &&
            f.factor_info.values &&
            (field === 'factor_name' || field === 'class_name') &&
            (field === 'factor_name' ? f.factor_info.index : f.factor_info.values.class_name);
        } catch (error) {
          console.error('Error filtering factor for checkbox:', error);
          return false;
        }
      })
      .map(f => {
        try {
          if (field === 'factor_name') {
            return f.factor_info?.index ?? '';
          } else if (field === 'class_name') {
            return f.factor_info?.values?.class_name ?? '';
          }
          return f[field] ?? '';
        } catch (error) {
          console.error('Error mapping factor value:', error);
          return '';
        }
      })
      .filter(value => value) // 过滤空值
    )];

    // 清空容器
    container.innerHTML = '';

    // 生成复选框
    uniqueValues.forEach(value => {
      const label = document.createElement('label');
      label.className = 'checkbox-item';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = value;
      checkbox.checked = true;

      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(value));
      container.appendChild(label);
    });

    // 添加全选/全不选按钮
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'checkbox-buttons';

    const selectAllBtn = document.createElement('button');
    selectAllBtn.className = 'checkbox-btn select-all';
    selectAllBtn.textContent = '全选';
    selectAllBtn.addEventListener('click', () => {
      container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = true;
      });
    });

    const deselectAllBtn = document.createElement('button');
    deselectAllBtn.className = 'checkbox-btn deselect-all';
    deselectAllBtn.textContent = '全不选';
    deselectAllBtn.addEventListener('click', () => {
      container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
      });
    });

    buttonContainer.appendChild(selectAllBtn);
    buttonContainer.appendChild(deselectAllBtn);
    container.appendChild(buttonContainer);
  }

  function renderTable(factor) {
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';

    // 更新复选框列表
    generateCheckboxFilters(allFactors, 'factor_name', 'factor-name-filters');
    generateCheckboxFilters(allFactors, 'class_name', 'type-filters');

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
      const filterBtn = header.querySelector('.filter-btn');
      const filterOptions = header.querySelector('.filter-options');

      // 点击齿轮按钮显示/隐藏筛选框
      filterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        filterOptions.classList.toggle('visible');
      });

      // 添加排序按钮
      const sortBtn = document.createElement('div');
      sortBtn.className = 'sort-btn';
      sortBtn.innerHTML = '⇅';
      header.appendChild(sortBtn);

      // 点击排序按钮排序
      sortBtn.addEventListener('click', () => {
        sortTable(index);
      });

      // 点击页面其他位置隐藏筛选框
      document.addEventListener('click', (e) => {
        if (!header.contains(e.target)) {
          filterOptions.classList.remove('visible');
        }
      });

      // 绑定筛选事件
      const applyBtn = filterOptions.querySelector('.apply-filter');
      if (index === 0) {
        // Factor Name列 - 复选框
        generateCheckboxFilters(allFactors, 'factor_name', 'factor-name-filters');
      } else if (index === 1) {
        // Type列 - 复选框
        generateCheckboxFilters(allFactors, 'class_name', 'type-filters');
      } else {
        // 数值型字段筛选
        const minInput = filterOptions.querySelector('input[type="number"]:nth-child(1)');
        const maxInput = filterOptions.querySelector('input[type="number"]:nth-child(2)');

        [minInput, maxInput].forEach(input => {
          input.addEventListener('input', () => {
            filters[Object.keys(filters)[index]] = {
              min: minInput.value ? parseFloat(minInput.value) : null,
              max: maxInput.value ? parseFloat(maxInput.value) : null
            };
            applyFilters();
          });
        });
      }

      // 应用筛选按钮
      applyBtn.addEventListener('click', () => {
        filterOptions.classList.remove('visible');
        applyFilters();
      });
    });
  }

  function sortTable(column) {
    try {
      // 验证数据格式
      if (!Array.isArray(allFactors)) {
        console.error('Invalid data format in sortTable:', allFactors);
        return;
      }

      const tbody = table.querySelector('tbody');
      if (!tbody) {
        console.error('Table body not found');
        return;
      }

      const rows = Array.from(tbody.querySelectorAll('tr'));
      if (rows.length === 0) {
        console.warn('No rows to sort');
        return;
      }

      const isAscending = table.getAttribute('data-sort') === 'asc';

      // 获取列数据类型
      const firstRow = rows[0];
      const sampleValue = firstRow.children[column]?.textContent?.trim();
      const isPercent = sampleValue?.endsWith('%');
      const isNumber = !isNaN(parseFloat(sampleValue));

      rows.sort((a, b) => {
        try {
          const aValue = a.children[column]?.textContent?.trim() || '';
          const bValue = b.children[column]?.textContent?.trim() || '';

          // 处理空值
          if (!aValue && !bValue) return 0;
          if (!aValue) return isAscending ? 1 : -1;
          if (!bValue) return isAscending ? -1 : 1;

          // 处理百分比数字（去掉%）
          if (isPercent) {
            const aNum = parseFloat(aValue);
            const bNum = parseFloat(bValue);
            return isAscending ? aNum - bNum : bNum - aNum;
          }

          // 处理普通数字（包括负数）
          if (isNumber) {
            const aNum = parseFloat(aValue);
            const bNum = parseFloat(bValue);
            return isAscending ? aNum - bNum : bNum - aNum;
          }

          // 处理字符串排序
          return isAscending ?
            aValue.localeCompare(bValue, undefined, { numeric: true }) :
            bValue.localeCompare(aValue, undefined, { numeric: true });

        } catch (error) {
          console.error('Error comparing values:', error);
          return 0;
        }
      });

      // 清空并重新插入排序后的行
      while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
      }
      rows.forEach(row => tbody.appendChild(row));

      // 更新排序状态
      table.setAttribute('data-sort', isAscending ? 'desc' : 'asc');

      // 更新表头样式
      const headers = table.querySelectorAll('th');
      headers.forEach(header => header.classList.remove('sorted-asc', 'sorted-desc'));
      headers[column].classList.add(isAscending ? 'sorted-asc' : 'sorted-desc');

    } catch (error) {
      console.error('Error in sortTable:', error);
    }
  }
});
