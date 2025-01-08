
// 因子表功能
document.addEventListener('DOMContentLoaded', function () {
  const table = document.querySelector('#factors-table');
  if (!table) return;

  let allFactors = []; // 存储所有因子数据
  const filters = {
    factor_name: '',
    class_name: '',
    ic: { min: null, max: null },
    group_pnl: { min: null, max: null },
    backtest_ret: { min: null, max: null }
  };

  // 初始化表格
  table.setAttribute('data-sort', 'asc');

  // 加载数据
  fetch('/api/factors')
    .then(response => response.json())
    .then(data => {
      allFactors = data;
      const tbody = table.querySelector('tbody');
      renderTable(data);

      // 初始化排序功能
      initSorting();
    })
    .catch(error => console.error('Error:', error));

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
      // 检查factor_name筛选
      if (selectedFactorNames.length > 0 && !selectedFactorNames.includes(factor.factor_name)) {
        return false;
      }
      // 检查class_name筛选
      if (selectedClassNames.length > 0 && !selectedClassNames.includes(factor.class_name)) {
        return false;
      }

      // 检查数值型字段筛选
      if (filters.ic.min !== null && factor.ic < filters.ic.min) {
        return false;
      }
      if (filters.ic.max !== null && factor.ic > filters.ic.max) {
        return false;
      }
      if (filters.group_pnl.min !== null && factor.group_pnl < filters.group_pnl.min) {
        return false;
      }
      if (filters.group_pnl.max !== null && factor.group_pnl > filters.group_pnl.max) {
        return false;
      }
      if (filters.backtest_ret.min !== null && factor.backtest_ret < filters.backtest_ret.min) {
        return false;
      }
      if (filters.backtest_ret.max !== null && factor.backtest_ret > filters.backtest_ret.max) {
        return false;
      }

      return true;
    });

    renderTable(filteredData);
  }

  // 生成复选框列表
  function generateCheckboxFilters(data, field, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 获取所有唯一值
    const uniqueValues = [...new Set(data.map(f => f[field]))];

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

  function renderTable(data) {
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';

    // 更新复选框列表
    generateCheckboxFilters(allFactors, 'factor_name', 'factor-name-filters');
    generateCheckboxFilters(allFactors, 'class_name', 'type-filters');

    data.forEach(factor => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><a href="/factors/${factor.factor_name}" class="factor-link" data-factor="${factor.factor_name}">${factor.factor_name}</td>
        <td>${factor.class_name}</td>
        <td>${factor.ic.toFixed(4)}</td>
        <td>${(factor.group_pnl * 100).toFixed(2)}%</td>
        <td>${(factor.backtest_ret * 100).toFixed(2)}%</td>
      `;
      tbody.appendChild(row);
    });
  }

  function initSorting() {
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
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const isAscending = table.getAttribute('data-sort') === 'asc';

    rows.sort((a, b) => {
      const aValue = a.children[column].textContent.trim();
      const bValue = b.children[column].textContent.trim();

      // 处理百分比数字（去掉%）
      if (aValue.endsWith('%') && bValue.endsWith('%')) {
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);
        return isAscending ? aNum - bNum : bNum - aNum;
      }

      // 处理普通数字（包括负数）
      if (!isNaN(aValue) && !isNaN(bValue)) {
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);
        return isAscending ? aNum - bNum : bNum - aNum;
      }

      // 处理字符串排序
      return isAscending ?
        aValue.localeCompare(bValue, undefined, { numeric: true }) :
        bValue.localeCompare(aValue, undefined, { numeric: true });
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
  }
});
