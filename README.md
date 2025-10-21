# vitepress-gen-navs

> 自动扫描目录结构，为 VitePress 生成 nav 和 sidebar 配置

## 特性

- 🚀 自动扫描目录，生成 VitePress 配置
- 📁 支持 glob 规则的包含/排除过滤
- 🎨 自定义回调函数，灵活控制导航名称
- 📝 智能提取标题（frontmatter > h1 > 文件名）
- 🔢 支持排序（自然排序、数字前缀排序、自定义排序）
- 📊 深度控制，限制目录层级
- 🔗 自动生成链接路径
- 📦 支持侧边栏分组和折叠

## 安装

```bash
npm install vitepress-gen-navs
```

## 基础使用

```js
import { genNavs } from 'vitepress-gen-navs'

const { nav, sidebar } = genNavs({
    dir: './docs'
})

export default {
    themeConfig: {
        nav,
        sidebar
    }
}
```

## API

### `genNavs(options)`

生成 VitePress 的 nav 和 sidebar 配置。

#### 参数

```typescript
interface GenNavsOptions {
    // 扫描目录，默认当前目录
    dir?: string
    
    // 全局包含规则（glob 模式）
    include?: string | string[]
    
    // 全局排除规则（glob 模式）
    exclude?: string | string[]
    
    // nav 特定配置
    nav?: {
        include?: string | string[]
        exclude?: string | string[]
        depth?: number
        onDirectory?: (info: DirInfo) => string | null
        onFile?: (info: FileInfo) => string | null
    }
    
    // sidebar 特定配置
    sidebar?: {
        include?: string | string[]
        exclude?: string | string[]
        depth?: number
        collapsed?: boolean
        onDirectory?: (info: DirInfo) => string | null
        onFile?: (info: FileInfo) => string | null
    }
    
    // 全局回调（nav/sidebar 未配置时使用）
    onDirectory?: (info: DirInfo) => string | null
    onFile?: (info: FileInfo) => string | null
    
    // 排序规则
    sort?: 'asc' | 'desc' | ((a: any, b: any) => number)
}
```

#### 回调参数

**DirInfo（目录信息）**

```typescript
interface DirInfo {
    name: string           // 目录名
    path: string           // 绝对路径
    relativePath: string   // 相对路径
    depth: number          // 当前深度
}
```

**FileInfo（文件信息）**

```typescript
interface FileInfo {
    name: string           // 文件名（不含扩展名）
    path: string           // 绝对路径
    relativePath: string   // 相对路径
    frontmatter?: any      // frontmatter 数据
    firstHeading?: string  // 第一个 h1 标题
    depth: number          // 当前深度
}
```

## 使用示例

### 基础示例

```js
import { genNavs } from 'vitepress-gen-navs'

const { nav, sidebar } = genNavs({
    dir: './docs'
})
```

### 过滤特定目录

```js
const { nav, sidebar } = genNavs({
    dir: './docs',
    exclude: ['**/drafts/**', '**/private/**']
})
```

### 自定义名称

```js
const { nav, sidebar } = genNavs({
    dir: './docs',
    onDirectory: (info) => {
        // 使用目录名的大写形式
        return info.name.toUpperCase()
    },
    onFile: (info) => {
        // 优先使用 frontmatter 中的自定义字段
        return info.frontmatter?.customTitle || null
    }
})
```

### 限制深度

`depth` 参数控制生成配置的目录层级深度。

**Nav 支持多层级嵌套**

Nav 现在支持生成带下拉菜单的多层级导航结构：

```js
const { nav, sidebar } = genNavs({
    dir: './docs',
    nav: {
        depth: 2  // nav 显示两层，第一层作为下拉菜单，第二层作为子项
    },
    sidebar: {
        depth: 3  // sidebar 显示三层
    }
})
```

生成的 nav 配置示例：

```js
// depth: 1 时（单层）
[
    { text: '指南', link: '/guide/' },
    { text: 'API', link: '/api/' }
]

// depth: 2 时（带下拉菜单）
[
    { 
        text: '指南', 
        items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '配置', link: '/guide/configuration' }
        ]
    },
    { 
        text: 'API', 
        items: [
            { text: '核心 API', link: '/api/core' },
            { text: '工具函数', link: '/api/utils' }
        ]
    }
]
```

**深度限制的智能链接处理**

当达到深度限制时，系统会智能处理 link：
- **文件节点**：直接使用该文件的路径作为 link
- **目录节点**：递归查找该目录下的第一个文件，使用该文件的路径作为 link

示例：
```js
// 目录结构
docs/
  ├── guide/
  │   ├── basic/
  │   │   ├── intro.md
  │   │   └── config.md
  │   └── advanced/
  │       └── custom.md

// depth: 1 时，guide 会指向第一个找到的文件
const { nav } = genNavs({
    dir: './docs',
    nav: { depth: 1 }
})

// 生成结果
[
    { text: 'guide', link: '/guide/basic/intro' }  // 自动链接到第一个文件
]
```

### 自定义排序

```js
const { nav, sidebar } = genNavs({
    dir: './docs',
    sort: 'asc'  // 升序排序
})

// 或者自定义排序函数
const { nav, sidebar } = genNavs({
    dir: './docs',
    sort: (a, b) => {
        // 自定义排序逻辑
        return a.name.localeCompare(b.name)
    }
})
```

### 数字前缀排序

支持文件名以数字前缀开头的排序（如 `01-intro.md`, `02-guide.md`）：

```
docs/
  ├── 01-getting-started.md
  ├── 02-configuration.md
  └── 03-advanced.md
```

```js
const { nav, sidebar } = genNavs({
    dir: './docs',
    sort: 'asc'  // 会按照数字前缀排序
})
```

### 侧边栏折叠

```js
const { nav, sidebar } = genNavs({
    dir: './docs',
    sidebar: {
        collapsed: true  // 默认折叠所有分组
    }
})
```

### 分别配置 nav 和 sidebar

```js
const { nav, sidebar } = genNavs({
    dir: './docs',
    nav: {
        depth: 1,
        exclude: ['**/internal/**']
    },
    sidebar: {
        depth: 3,
        collapsed: false,
        onDirectory: (info) => {
            return `📁 ${info.name}`
        }
    }
})
```

## 标题提取优先级

默认情况下，标题按以下优先级提取：

1. **frontmatter.title** - markdown 文件的 frontmatter 中的 title 字段
2. **第一个 h1 标题** - markdown 文件中的第一个 `# 标题`
3. **文件名** - 移除扩展名和数字前缀后的文件名

例如：

```md
---
title: 自定义标题
---

# 文档标题

内容...
```

会使用 "自定义标题" 作为导航名称。

## 目录结构示例

假设有如下目录结构：

```
docs/
  ├── guide/
  │   ├── index.md
  │   ├── getting-started.md
  │   └── configuration.md
  ├── api/
  │   ├── index.md
  │   └── core.md
  └── about.md
```

生成的配置：

```js
{
    nav: [
        { text: 'Guide', link: '/guide/' },
        { text: 'API', link: '/api/' },
        { text: 'About', link: '/about' }
    ],
    sidebar: {
        '/guide/': [
            {
                text: 'Guide',
                items: [
                    { text: 'Getting Started', link: '/guide/getting-started' },
                    { text: 'Configuration', link: '/guide/configuration' }
                ]
            }
        ],
        '/api/': [
            {
                text: 'API',
                items: [
                    { text: 'Core', link: '/api/core' }
                ]
            }
        ]
    }
}
```

## License

MIT