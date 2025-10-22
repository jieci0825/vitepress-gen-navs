import path from 'node:path'
import { minimatch } from 'minimatch'

/**
 * 标准化路径（统一为 POSIX 格式）
 */
export function normalizePath(filePath: string): string {
    return filePath.split(path.sep).join('/')
}

/**
 * 将路径转换为 VitePress 链接格式
 * @param filePath 文件路径
 * @param baseDir 基础目录
 */
export function pathToLink(filePath: string, baseDir: string): string {
    let link = normalizePath(path.relative(baseDir, filePath))

    // 移除 .md 扩展名
    if (link.endsWith('.md')) {
        link = link.slice(0, -3)
    }

    // 处理 index.md
    if (link.endsWith('/index')) {
        link = link.slice(0, -6)
    }

    // 确保以 / 开头
    if (!link.startsWith('/')) {
        link = '/' + link
    }

    // 如果是目录，确保以 / 结尾
    if (link && !link.endsWith('/') && !path.extname(filePath)) {
        link += '/'
    }

    return link
}

/**
 * 检查路径是否应该被包含
 * @param filePath 文件路径
 * @param include 包含规则
 * @param exclude 排除规则
 */
export function shouldInclude(filePath: string, include: string[], exclude: string[]): boolean {
    const normalizedPath = normalizePath(filePath)

    // 检查排除规则
    for (const pattern of exclude) {
        if (minimatch(normalizedPath, pattern)) {
            return false
        }
    }

    // 检查包含规则
    if (include.length > 0) {
        return include.some(pattern => minimatch(normalizedPath, pattern))
    }

    // 没有包含规则，则默认包含所有文件
    return true
}

/**
 * 移除文件名中的排序前缀，返回纯标题部分
 * 支持的前缀格式包括：
 * - 数字 + 标题
 * - 数字 + . 后 + 标题
 * - 数字 + 多个空格 + 标题
 * - 数字 + 、后 + 标题
 * - 数字 + -后 + 标题
 * - 数字 + _后 + 标题
 *
 * @param name 输入的可能带有排序前缀的文件名或字符串
 * @returns 移除前缀后的标题部分
 */
export function removeSortPrefix(name: string): string {
    const prefixRegex = /^\d+\s*[._\-\s、]*/
    const result = name.replace(prefixRegex, '').trim()
    return result
}
