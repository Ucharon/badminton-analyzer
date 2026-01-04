# 羽毛球活动账单分析工具

一个纯前端的H5应用，用于分析蛙友聚羽毛球活动账单。

## ✨ 功能特性

- 📤 支持本地上传Excel文件（.xls/.xlsx）
- 🔗 支持通过URL直接分析远程Excel文件
- 📊 自动合并"报名支付"+"少补支付"为一次活动
- 💰 计算实际净花费（出款 - 入款）
- 📈 多维度统计分析：月度、场馆、周几、季度
- 💪 健康评价和运动效果估算
- 📱 完美支持移动端H5

## 🚀 快速开始

### 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 安装Vercel CLI（如需URL分析功能）
npm install -g vercel

# 3. 启动开发环境（推荐方式）
# 终端1：启动Vercel开发服务器（API代理）
vercel dev

# 终端2：启动Vite前端服务器
npm run dev
```

**访问地址：**
- 前端页面：http://localhost:5173
- API代理：http://localhost:3000/api/fetch-excel

**简化启动（仅测试文件上传）：**
```bash
# 只启动前端，URL分析功能不可用
npm run dev
```

### 使用方法

**方式1：上传本地Excel文件** ✅ 推荐
1. 点击上传区域或拖拽Excel文件
2. 系统自动解析并显示分析结果

**方式2：通过URL分析** （需要 `vercel dev` 运行）
1. 确保已启动 `vercel dev` (监听3000端口)
2. 在URL输入框中粘贴Excel文件链接
3. 点击"分析"按钮
4. 系统通过本地API代理下载并分析文件

## 📁 项目结构

```
badminton-analyzer/
├── src/
│   ├── types/           # TypeScript类型定义
│   ├── lib/             # 工具函数和常量
│   ├── features/        # 功能模块
│   │   ├── upload/      # Excel上传和解析
│   │   └── transform/   # 数据转换和统计
│   ├── components/      # React组件
│   └── App.tsx          # 主应用
├── api/                 # Vercel Serverless Functions
│   └── fetch-excel.ts   # CORS代理API
└── public/              # 静态资源
```

## 🔧 技术栈

- **前端**: Vite + React 18 + TypeScript
- **样式**: Tailwind CSS v3
- **Excel解析**: SheetJS (xlsx)
- **日期处理**: dayjs
- **工具**: lodash-es
- **图标**: lucide-react
- **后端**: Vercel Serverless Functions (CORS代理)

## 📊 Excel文件格式要求

必需列：
- 活动标题
- 金额
- 支付方式（报名支付、少补支付）
- 出款/入款（出款(-)、入款(+)）
- 支付状态
- 结算状态（已完成、已退款）
- 活动开始时间
- 发布者
- 支付时间

## 🌐 部署到Vercel

### 方法1：通过CLI

```bash
# 安装Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

### 方法2：通过GitHub

1. 将代码推送到GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 自动部署

## 🔒 安全说明

- 所有数据处理都在浏览器本地完成
- 不上传数据到任何服务器
- API代理仅用于绕过CORS限制
- URL分析有域名白名单保护（防SSRF攻击）

## 🛠️ 配置

### 添加允许的域名

编辑 `api/fetch-excel.ts`，在 `ALLOWED_HOSTS` 数组中添加：

```typescript
const ALLOWED_HOSTS = [
  'www.yemaozontech.com',
  'your-domain.com',  // 添加你的域名
];
```

## 📄 License

MIT
