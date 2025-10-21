# 开发指南

## 开发环境设置

### 安装依赖

```bash
npm install
```

### 构建项目

```bash
npm run build
```

这会将 TypeScript 源码编译到 `dist/` 目录。

### 项目结构

```
vitepress-gen-navs/
├── src/
│   ├── types.ts              # TypeScript 类型定义
│   ├── utils.ts              # 工具函数
│   ├── extractor.ts          # 标题提取功能
│   ├── scanner.ts            # 目录扫描
│   ├── navGenerator.ts       # Nav 生成器
│   ├── sidebarGenerator.ts   # Sidebar 生成器
│   └── index.ts              # 主入口
├── dist/                     # 编译输出目录
├── example.js                # 使用示例
├── tsconfig.json             # TypeScript 配置
├── package.json              # 包配置
└── README.md                 # 文档
```

## 开发流程

### 1. 修改源代码

在 `src/` 目录下修改 TypeScript 源文件。

### 2. 编译

```bash
npm run build
```

### 3. 测试

创建测试文件或使用 `example.js` 测试功能：

```bash
node example.js
```

## 发布流程

### 1. 更新版本号

在 `package.json` 中更新版本号。

### 2. 更新 CHANGELOG

在 `CHANGELOG.md` 中记录更新内容。

### 3. 构建

```bash
npm run build
```

### 4. 发布

```bash
npm publish
```

注意：`prepublishOnly` 钩子会在发布前自动执行构建。

## 代码规范

- 使用 4 空格缩进
- 不使用分号
- 使用 TypeScript 严格模式
- 添加必要的注释和类型定义
- 关键功能处添加 console.log（生产环境尽量减少）

## 核心概念

### 文件树结构

项目首先扫描目录，构建一个文件树结构（`FileTreeNode`），然后基于这个树结构生成 nav 和 sidebar 配置。

### 标题提取优先级

1. frontmatter.title
2. 第一个 h1 标题
3. 文件名（处理后）

### 回调函数

用户可以通过回调函数自定义每个文件和目录的显示名称：
- `onDirectory`: 处理目录
- `onFile`: 处理文件

返回 `null` 则使用默认逻辑。

### 深度控制

- `depth: 1` 表示只处理第一层
- `depth: undefined` 表示无限递归

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

