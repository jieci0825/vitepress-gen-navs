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
    /** 深度限制，默认 1 */
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
    /** 是否需要添加扫描目录前缀，默认 true */
    addDirPrefix?: boolean
    /** 全局包含规则 */
    include?: string[]
    /** 全局排除规则 */
    exclude?: string[]

    /** nav 特定配置 */
    nav?: NavSidebarConfig

    /** sidebar 特定配置 */
    sidebar?: SidebarConfig

    /** 全局目录回调（nav/sidebar 未配置时的默认值） */
    onDirectory?: (info: DirInfo) => string
    /** 全局文件回调（nav/sidebar 未配置时的默认值） */
    onFile?: (info: FileInfo) => string

    /** 排序规则 */
    sort?: SortType

    /**
     * 如果未指定，侧边栏组不可折叠
     * 如果为 `true`，则侧边栏组可折叠并且默认折叠
     * 如果为 `false`，则侧边栏组可折叠但默认展开
     */
    collapsed?: boolean
}

/**
 * 标准化后的配置选项（内部使用）
 * 合并默认配置后，除了回调函数，其他字段都有确定的值
 */
export interface NormalizedGenNavsOptions {
    /** 扫描目录 */
    dir: string
    /** 是否需要添加扫描目录前缀 */
    addDirPrefix: boolean
    /** 全局包含规则 */
    include: string[]
    /** 全局排除规则 */
    exclude: string[]

    /** nav 特定配置 */
    nav: NavSidebarConfig

    /** sidebar 特定配置 */
    sidebar: SidebarConfig

    /** 全局目录回调（nav/sidebar 未配置时的默认值） */
    onDirectory?: (info: DirInfo) => string
    /** 全局文件回调（nav/sidebar 未配置时的默认值） */
    onFile?: (info: FileInfo) => string

    /** 排序规则 */
    sort: SortType

    /**
     * 如果未指定，侧边栏组不可折叠
     * 如果为 `true`，则侧边栏组可折叠并且默认折叠
     * 如果为 `false`，则侧边栏组可折叠但默认展开
     */
    collapsed?: boolean
}

/**
 * VitePress Nav Item - 带链接
 */
export interface NavItemWithLink {
    text: string
    link: string
}

/**
 * VitePress Nav Item - 带子菜单
 */
export interface NavItemWithChildren {
    text: string
    items: NavItem[]
}

/**
 * VitePress Nav Item
 */
export type NavItem = NavItemWithLink | NavItemWithChildren

/**
 * VitePress Sidebar Item - 带链接
 */
export interface SidebarItemWithLink {
    text: string
    link: string
}

/**
 * VitePress Sidebar Item - 带子菜单
 */
export interface SidebarItemWithChildren {
    text: string
    items: SidebarItem[]
    collapsed?: boolean
}

/**
 * VitePress Sidebar Item
 */
export type SidebarItem = SidebarItemWithLink | SidebarItemWithChildren

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
