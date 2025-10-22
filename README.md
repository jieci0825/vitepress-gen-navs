# vitepress-gen-navs

> 自动扫描目录结构，为 VitePress 生成 nav 和 sidebar 配置

## 特性

- 🚀 自动扫描目录，生成 VitePress 的 nav 和 sidebar 配置
- 📁 支持 glob 规则的包含/排除过滤
- 🎨 自定义回调函数，灵活控制导航名称
- 📝 智能提取标题（frontmatter > h1 > 文件名）
- 📊 深度控制，限制目录层级
- 🔗 自动生成链接路径
- 📦 支持侧边栏分组和折叠

## 安装

```bash
npm install vitepress-gen-navs
```

## 快速开始
通常来说，只需要配置一下 dir 即可，其余的保持默认配置即可正常使用。如果有特殊的配置需求，可以翻阅后续的文档。

我建议文档都放在一个目录中，便于管理，通常是 docs 或者 document。当然，此时通常你需要额外配置一下 vitepress 的 **srcDir** 配置。

```js
import { genNavs } from 'vitepress-gen-navs'

const { nav, sidebar } = genNavs({
    dir: './docs',
  	// 设置了 dir 而没有设置 vitepress 的 srcDir 配置项时，你通常需要开启 addDirPrefix
  	// addDirPrefix: true
})

export default {
    // https://vitepress.dev/zh/reference/site-config#srcdir
    srcDir: "./docs", // 如果没有设置此配置，则需要开启 addDirPrefix
    themeConfig: {
        nav,
        sidebar
    }
}
```

结构如图所示：

![PixPin_2025-10-22_17-32-20](/Users/coderjc/Documents/frontend/project/vitepress-gen-navs/README.assets/PixPin_2025-10-22_17-32-20.png)

## API

### GenNavsOptions

| 属性名 | 描述 | 类型 | 是否必填 | 默认值 |
|--------|------|------|----------|--------|
| `dir` | 扫描目录 | `string` | 否 | 当前目录 |
| `addDirPrefix` | 是否需要添加扫描目录前缀 | `boolean` | 否 | `false` |
| `include` | 全局包含规则 | `string[]` | 否 | `['**/node_modules/**', '**/.git/**']` |
| `exclude` | 全局排除规则 | `string[]` | 否 | - |
| `nav` | nav 特定配置 | `NavSidebarConfig` | 否 | - |
| `sidebar` | sidebar 特定配置 | `SidebarConfig` | 否 | - |
| `onDirectory` | 全局目录回调（nav/sidebar 未配置时的默认值）。`返回的字符串会作为最终的展示名称。` | `(info: DirInfo) => string` | 否 | - |
| `onFile` | 全局文件回调（nav/sidebar 未配置时的默认值）。`返回的字符串会作为最终的展示名称。` | `(info: FileInfo) => string` | 否 | - |
| `excludeRootIndex` | 是否在 nav 中排除根目录的 index.md | `boolean` | 否 | `false` |
| `formatSortPrefix` | 是否格式化排序前缀（移除文件名中的排序前缀） | `boolean` | 否 | `true` |

### NavSidebarConfig 配置项（用于 nav 配置）

| 属性名 | 描述 | 类型 | 是否必填 | 默认值 |
|--------|------|------|----------|--------|
| `depth` | 深度限制 | `number` | 否 | `2` |
| `onDirectory` | 目录回调，优先级高于全局 | `(info: DirInfo) => string \| null` | 否 | - |
| `onFile` | 文件回调，优先级高于全局 | `(info: FileInfo) => string \| null` | 否 | - |

### SidebarConfig 配置项（用于 sidebar 配置）

| 属性名 | 描述 | 类型 | 是否必填 | 默认值 |
|--------|------|------|----------|--------|
| `collapsed` | 侧边栏组折叠状态。如果未指定，则不可折叠；如果为 `true`，则可折叠并且默认折叠；如果为 `false`，则可折叠但默认展开 | `boolean` | 否 | `false` |
| `onDirectory` | 目录回调，优先级高于全局 | `(info: DirInfo) => string \| null` | 否 | - |
| `onFile` | 文件回调，优先级高于全局 | `(info: FileInfo) => string \| null` | 否 | - |

### 回调参数

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
    originalName: string   // 文件名
    path: string           // 绝对路径
    relativePath: string   // 相对路径
    frontmatter?: any      // frontmatter 数据
    firstHeading?: string  // 第一个 h1 标题
    depth: number          // 当前深度
}
```

## 使用示例

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
        depth: 2  // nav 显示两层，第一层作为下拉菜单，第二层作为子项，如果你的 nav 不需要展示子项，只需要第一级，设置为 1 即可
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

### 排除根目录的 index.md

当文档根目录包含首页 `index.md` 文件时，可以通过 `excludeRootIndex` 选项控制其是否显示在 nav 配置中：

```js
// 目录结构
docs/
  ├── index.md       // 首页，不需要在 nav 中显示
  ├── guide.md
  └── api.md

const { nav, sidebar } = genNavs({
    dir: './docs',
    excludeRootIndex: true  // 排除根目录的 index.md
})

// 生成的 nav 将不包含 index.md
[
    { text: 'guide', link: '/guide' },
    { text: 'api', link: '/api' }
]
```

**注意**：
- 此选项仅影响 nav 配置，不影响 sidebar 配置
- 只排除根目录（扫描目录）下的 `index.md`，子目录中的 `index.md` 不受影响
- 默认值为 `false`，即默认会包含根目录的 `index.md`

### 数字前缀排序

> **本工具内部针对 index.md 做出了特殊处理，永远排在当前列表层级的第一位**

排序并没有提供特定的方法，依赖的是一种约定规范，即你在内部对你的文件夹或者文件名，标记一个序号，实现排序。（如 `01-intro.md`, `02-guide.md`）：

```
docs/
  ├── 01-getting-started.md
  ├── 02-configuration.md
  └── 03-advanced.md
```

```
默认支持的前缀格式如下：
 * - 数字 + 标题
 * - 数字 + . 后 + 标题
 * - 数字 + 多个空格 + 标题
 * - 数字 + 、后 + 标题
 * - 数字 + -后 + 标题
 * - 数字 + _后 + 标题
```

```js
const { nav, sidebar } = genNavs({
    dir: './docs',
})
```

默认本工具内部 `formatSortPrefix` 配置为 `true`，会格式化掉前缀，只保留**标题内容**。即 `01-intro.md` 格式化后的结果为`intro.md`。如果你希望保留前缀，将此配置改为 `false` 即可。

### 侧边栏折叠

此行为与 vitepress 的 collapsed 一致。

```js
const { nav, sidebar } = genNavs({
    dir: './docs',
    sidebar: {
        /**
         * 如果未指定，侧边栏组不可折叠
         * 如果为 `true`，则侧边栏组可折叠并且默认折叠
         * 如果为 `false`，则侧边栏组可折叠但默认展开
         * 如果不希望有这个功能，可以直接设置 undefined
         */
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
          	// TODO: 你的条件
          	// 返回的结果将作为最终的展示 nav 或 sidebar 名称
            return `📁 ${info.name}`
        }
    }
})
```

## 标题提取优先级

默认情况下(**即不使用 onDirectory 或 onFile 的情况**)，标题按以下优先级提取：

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

## 目录结构示例



## License

MIT