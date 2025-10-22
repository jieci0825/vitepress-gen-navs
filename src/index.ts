import { GenNavsOptions, GenNavsResult, NormalizedGenNavsOptions } from './types'
import { scanDirectory } from './scanner'
import { generateNav } from './navGenerator'
import { generateSidebar } from './sidebarGenerator'

/**
 * 默认配置
 */
const DEFAULT_OPTIONS: NormalizedGenNavsOptions = {
    dir: process.cwd(),
    addDirPrefix: true,
    include: [],
    exclude: ['**/node_modules/**', '**/.git/**'],
    nav: {},
    sidebar: {},
    onDirectory: undefined,
    onFile: undefined,
    sort: 'asc'
}

/**
 * 合并配置选项
 * @param userOptions 用户提供的配置
 * @returns 合并后的完整配置
 */
function mergeOptions(userOptions: GenNavsOptions = {}): NormalizedGenNavsOptions {
    return {
        ...DEFAULT_OPTIONS,
        ...userOptions,
        // 深度合并 nav 配置
        nav: {
            ...DEFAULT_OPTIONS.nav,
            ...userOptions.nav
        },
        // 深度合并 sidebar 配置
        sidebar: {
            ...DEFAULT_OPTIONS.sidebar,
            ...userOptions.sidebar
        }
    }
}

/**
 * 生成 VitePress 的 nav 和 sidebar 配置
 * @param options 配置选项
 * @returns nav 和 sidebar 配置对象
 */
export function genNavs(options: GenNavsOptions = {}): GenNavsResult {
    // 合并用户配置和默认配置
    const mergedOptions = mergeOptions(options)

    // 扫描目录，构建文件树
    const fileTree = scanDirectory(mergedOptions)

    // 生成 nav 配置
    const nav = generateNav(fileTree, mergedOptions)

    // 生成 sidebar 配置，基于 nav 结构
    const sidebar = generateSidebar(fileTree, nav, mergedOptions)

    return {
        nav,
        sidebar
    }
}

// 导出类型
export * from './types'
