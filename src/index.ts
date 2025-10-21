import * as path from 'path'
import { GenNavsOptions, GenNavsResult } from './types'
import { scanDirectory } from './scanner'
import { generateNav } from './navGenerator'
import { generateSidebar } from './sidebarGenerator'

/**
 * 生成 VitePress 的 nav 和 sidebar 配置
 * @param options 配置选项
 * @returns nav 和 sidebar 配置对象
 */
export function genNavs(options: GenNavsOptions = {}): GenNavsResult {
    // 扫描目录，构建文件树
    const fileTree = scanDirectory(options)

    // 生成 nav 配置
    const nav = generateNav(fileTree, options)

    // 生成 sidebar 配置
    const sidebar = generateSidebar(fileTree, options)

    return {
        nav,
        sidebar
    }
}

// 导出类型
export * from './types'
