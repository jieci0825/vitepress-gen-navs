/**
 * 目录信息
 */
export interface DirInfo {
    /** 目录名 */
    name: string
    /** 绝对路径 */
    path: string
    /** 相对路径 */
    relativePath: string
    /** 当前深度 */
    depth: number
}

/**
 * 文件信息
 */
export interface FileInfo {
    /** 文件名（不含扩展名） */
    name: string
    /** 绝对路径 */
    path: string
    /** 相对路径 */
    relativePath: string
    /** frontmatter 数据 */
    frontmatter?: any
    /** 第一个 h1 标题 */
    firstHeading?: string
    /** 当前深度 */
    depth: number
}

/**
 * 排序类型
 */
export type SortType = 'asc' | 'desc' | ((a: any, b: any) => number)

/**
 * Nav/Sidebar 特定配置
 */
export interface NavSidebarConfig {
    /** 包含规则 */
    include?: string | string[]
    /** 排除规则 */
    exclude?: string | string[]
    /** 深度限制，默认无限 */
    depth?: number
    /** 目录回调 */
    onDirectory?: (info: DirInfo) => string | null
    /** 文件回调 */
    onFile?: (info: FileInfo) => string | null
}

/**
 * Sidebar 特定配置
 */
export interface SidebarConfig extends NavSidebarConfig {
    /** 分组是否默认折叠 */
    collapsed?: boolean
}

/**
 * 生成导航配置选项
 */
export interface GenNavsOptions {
    /** 扫描目录，默认当前目录 */
    dir?: string
    /** 全局包含规则 */
    include?: string | string[]
    /** 全局排除规则 */
    exclude?: string | string[]

    /** nav 特定配置 */
    nav?: NavSidebarConfig

    /** sidebar 特定配置 */
    sidebar?: SidebarConfig

    /** 全局目录回调（nav/sidebar 未配置时的默认值） */
    onDirectory?: (info: DirInfo) => string | null
    /** 全局文件回调（nav/sidebar 未配置时的默认值） */
    onFile?: (info: FileInfo) => string | null

    /** 排序规则 */
    sort?: SortType
}

/**
 * VitePress Nav Item
 */
export interface NavItem {
    text: string
    link?: string
    items?: NavItem[]
}

/**
 * VitePress Sidebar Item
 */
export interface SidebarItem {
    text: string
    link?: string
    items?: SidebarItem[]
    collapsed?: boolean
}

/**
 * VitePress Sidebar 配置（多路径）
 */
export type SidebarConfig_VP = Record<string, SidebarItem[]>

/**
 * 生成结果
 */
export interface GenNavsResult {
    nav: NavItem[]
    sidebar: SidebarConfig_VP
}

/**
 * 文件树节点类型
 */
export type FileTreeNodeType = 'file' | 'directory'

/**
 * 文件树节点
 */
export interface FileTreeNode {
    type: FileTreeNodeType
    name: string
    path: string
    relativePath: string
    depth: number
    children?: FileTreeNode[]
    fileInfo?: FileInfo
}
