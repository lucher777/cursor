# BuyEdu - 学生邮箱和数字产品销售平台

## 项目说明

这是一个专业的学生邮箱和数字产品销售平台，提供各种教育邮箱、软件授权、云存储等服务。

## 运行要求

**重要：此项目必须通过HTTP服务器运行，不能直接打开HTML文件！**

### 方法1：使用VS Code Live Server

1. 在VS Code中安装"Live Server"扩展
2. 右键点击`index.html`文件
3. 选择"Open with Live Server"
4. 浏览器会自动打开项目

### 方法2：使用其他HTTP服务器

- Python: `python -m http.server 8000`
- PHP: `php -S localhost:8000`
- Node.js: `npx http-server`
- 任何其他HTTP服务器

## 项目结构

```
dirtymoney/
├── index.html          # 首页
├── admin.html          # 管理页面
├── login.html          # 登录页面
├── buy.html            # 购买页面
├── pay.html            # 支付页面
├── order.html          # 订单页面
├── data/
│   ├── config.json     # 配置文件
│   └── products.json   # 商品数据
├── js/
│   ├── main.js         # 主要JavaScript
│   └── admin.js        # 管理页面JavaScript
├── css/
│   └── styles.css      # 样式文件
└── README.md           # 说明文档
```

## 功能特性

- 商品分类展示
- 搜索功能
- 商品详情查看
- 在线购买
- 管理员后台
- 响应式设计

## 常见问题

### 问题：首页显示空白，没有商品信息

**解决方案：**
1. 确保通过HTTP服务器访问，而不是直接打开HTML文件
2. 检查浏览器控制台是否有错误信息
3. 确保`data/products.json`和`data/config.json`文件存在且格式正确

### 问题：数据加载失败

**解决方案：**
1. 检查文件路径是否正确
2. 确保JSON文件格式正确
3. 检查网络连接
4. 查看浏览器控制台错误信息

## 技术支持

如果遇到问题，请：
1. 检查浏览器控制台错误信息
2. 确保通过HTTP服务器访问
3. 验证数据文件格式是否正确

## 开发说明

- 商品数据存储在`data/products.json`中
- 配置信息存储在`data/config.json`中
- 主要逻辑在`js/main.js`中
- 样式在`css/styles.css`中