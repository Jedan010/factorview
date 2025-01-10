# FactorView

FactorView 是一个用于分析和可视化因子数据的Python Web应用。

## 功能特性
- 因子数据加载与预处理
- 因子数据可视化
- 因子相关性分析
- 因子组合优化
- 策略回测与绩效分析
- 策略组合优化

## 项目结构
```
factorview/
├── __init__.py
├── app.py
├── data_loader.py
├── static/
│   ├── css/
│   │   ├── factor_info.css
│   │   ├── factor_perf.css
│   │   ├── index.css
│   │   ├── strategy_info.css
│   │   └── strategy_perf.css
│   └── js/
│       ├── factor_info.js
│       ├── factor_perf.js
│       ├── strategy_info.js
│       ├── strategy_perf.js
│       └── utils.js
├── templates/
│   ├── factor_info.html
│   ├── factor_perf.html
│   ├── index.html
│   ├── strategy_info.html
│   └── strategy_perf.html
```

## 安装

1. 克隆仓库：
   ```bash
   git clone https://github.com/yourusername/factorview.git
   cd factorview
   ```

2. 创建虚拟环境：
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```

3. 安装依赖：
   ```bash
   pip install -r requirements.txt
   ```

## 使用

1. 启动开发服务器：
   ```bash
   flask run
   ```

2. 在浏览器中访问 http://localhost:5000

## 依赖

- Python 3.8+
- Flask
- Pandas
- NumPy
- Matplotlib

## 贡献

欢迎提交Pull Request。请确保：
- 代码符合PEP8规范
- 添加适当的单元测试
- 更新相关文档

## 许可证

MIT License
