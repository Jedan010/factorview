# FactorView 项目

FactorView 是一个基于Python Flask框架构建的因子分析可视化平台。

## 技术栈
- 后端：Python Flask
- 前端：HTML, CSS, JavaScript
- 数据：自定义数据加载器

## 项目结构
```
factorview/
├── app.py                # Flask主应用
├── data_loader.py        # 数据加载与处理
├── static/               # 静态资源
│   ├── css/              # 样式表
│   └── js/               # JavaScript脚本
└── templates/            # HTML模板
    ├── index.html        # 首页
    └── factor_detail.html # 因子详情页
```

## 安装与运行
1. 克隆仓库
2. 安装依赖：
   ```bash
   pip install -r requirements.txt
   ```
3. 运行应用：
   ```bash
   python factorview/app.py
   ```
4. 访问 http://localhost:5000

## 贡献指南
欢迎提交Pull Request。请确保：
- 代码风格一致
- 包含必要的测试
- 更新相关文档

## 许可证
MIT License