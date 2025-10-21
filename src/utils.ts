import path from 'node:path'
import { minimatch } from 'minimatch'
import { SortType } from './types'

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
export function shouldInclude(filePath: string, include?: string | string[], exclude?: string | string[]): boolean {
    const normalizedPath = normalizePath(filePath)

    // 检查排除规则
    if (exclude) {
        const excludePatterns = Array.isArray(exclude) ? exclude : [exclude]
        for (const pattern of excludePatterns) {
            if (minimatch(normalizedPath, pattern)) {
                return false
            }
        }
    }

    // 检查包含规则
    if (include) {
        const includePatterns = Array.isArray(include) ? include : [include]
        for (const pattern of includePatterns) {
            if (minimatch(normalizedPath, pattern)) {
                return true
            }
        }
        // 如果指定了包含规则但不匹配，则排除
        return false
    }

    // 没有包含规则，默认包含
    return true
}

/**
 * 从文件名中提取排序前缀（如 01-、02- 等）
 */
export function extractSortPrefix(name: string): number | null {
    const match = name.match(/^(\d+)[-_.\s]/)
    return match ? parseInt(match[1], 10) : null
}

/**
 * 自然排序比较函数
 */
function naturalCompare(a: string, b: string): number {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

/**
 * 排序项目
 * @param items 要排序的项目
 * @param sort 排序规则
 * @param getName 获取名称的函数
 */
export function sortItems<T>(items: T[], sort?: SortType, getName?: (item: T) => string): T[] {
    if (!sort) {
        return items
    }

    const getNameFn = getName || ((item: any) => item.name || '')

    const sorted = [...items]

    if (typeof sort === 'function') {
        sorted.sort(sort)
    } else {
        sorted.sort((a, b) => {
            const nameA = getNameFn(a)
            const nameB = getNameFn(b)

            // 尝试提取数字前缀
            const prefixA = extractSortPrefix(nameA)
            const prefixB = extractSortPrefix(nameB)

            // 如果都有数字前缀，按前缀排序
            if (prefixA !== null && prefixB !== null) {
                return sort === 'asc' ? prefixA - prefixB : prefixB - prefixA
            }

            // 否则自然排序
            const result = naturalCompare(nameA, nameB)
            return sort === 'asc' ? result : -result
        })
    }

    return sorted
}

/**
 * 移除文件名中的排序前缀
 */
export function removeSortPrefix(name: string): string {
    return name.replace(/^\d+[-_.\s]+/, '')
}

/**
 * 将文件名转换为标题（移除前缀，首字母大写等）
 */
export function fileNameToTitle(fileName: string): string {
    // 移除扩展名
    let name = fileName.replace(/\.[^.]+$/, '')

    // 移除排序前缀
    name = removeSortPrefix(name)

    // 替换连字符和下划线为空格
    name = name.replace(/[-_]/g, ' ')

    // 首字母大写
    name = name.charAt(0).toUpperCase() + name.slice(1)

    return name
}
