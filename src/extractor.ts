import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { FileInfo } from './types'

/**
 * 从 markdown 文件提取 frontmatter
 */
export function extractFrontmatter(filePath: string): any {
    try {
        const content = fs.readFileSync(filePath, 'utf-8')
        const { data } = matter(content)
        return data
    } catch (error) {
        return {}
    }
}

/**
 * 从 markdown 文件提取第一个 h1 标题
 */
export function extractFirstHeading(filePath: string): string | undefined {
    try {
        const content = fs.readFileSync(filePath, 'utf-8')
        const { content: markdownContent } = matter(content)

        // 匹配第一个 h1 标题 (# Title)
        const h1Match = markdownContent.match(/^#\s+(.+)$/m)
        return h1Match ? h1Match[1].trim() : undefined
    } catch (error) {
        return undefined
    }
}

/**
 * 提取文件的标题
 * 优先级：frontmatter.title > h1 > 文件名
 */
export function extractTitle(filePath: string): string {
    const frontmatter = extractFrontmatter(filePath)

    // 优先使用 frontmatter 的 title
    if (frontmatter.title) {
        return frontmatter.title
    }

    // 其次使用第一个 h1 标题
    const firstHeading = extractFirstHeading(filePath)
    if (firstHeading) {
        return firstHeading
    }

    // 最后使用文件名
    const fileName = path.basename(filePath, path.extname(filePath))
    return fileName
}

/**
 * 构建文件信息对象
 */
export function buildFileInfo(filePath: string, baseDir: string, depth: number): FileInfo {
    const frontmatter = extractFrontmatter(filePath)
    const firstHeading = extractFirstHeading(filePath)
    const fileName = path.basename(filePath, path.extname(filePath))
    const relativePath = path.relative(baseDir, filePath)

    return {
        name: fileName,
        path: filePath,
        relativePath,
        frontmatter,
        firstHeading,
        depth
    }
}
