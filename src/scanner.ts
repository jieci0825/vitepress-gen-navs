import * as fs from 'fs'
import * as path from 'path'
import fg from 'fast-glob'
import { FileTreeNode, GenNavsOptions } from './types'
import { normalizePath, shouldInclude } from './utils'
import { buildFileInfo } from './extractor'

/**
 * 扫描目录并构建文件树
 */
export function scanDirectory(options: GenNavsOptions): FileTreeNode[] {
    const baseDir = path.resolve(options.dir || process.cwd())

    const cwd = process.cwd()

    // 构建 glob 模式，只匹配 .md 文件
    const patterns = ['**/*.md']

    // 默认排除规则
    const defaultExclude = ['**/node_modules/**', '**/dist/**', '**/.git/**']

    // 合并排除规则
    const excludePatterns = [
        ...defaultExclude,
        ...(options.exclude ? (Array.isArray(options.exclude) ? options.exclude : [options.exclude]) : [])
    ]

    // 扫描文件
    const files = fg.sync(patterns, {
        cwd: baseDir,
        ignore: excludePatterns,
        onlyFiles: true,
        absolute: true
    })

    // 应用包含规则过滤
    const filteredFiles = files.filter(file => {
        const relativePath = path.relative(baseDir, file)
        return shouldInclude(relativePath, options.include, options.exclude)
    })

    // 构建文件树，传入工作目录作为 relativePath 的基准
    return buildFileTree(filteredFiles, baseDir, cwd)
}

/**
 * 构建文件树结构
 * @param files 文件列表（绝对路径）
 * @param baseDir 扫描的基础目录（绝对路径）
 * @param rootDir relativePath 的基准目录（绝对路径），用于计算最终的相对路径
 */
export function buildFileTree(files: string[], baseDir: string, rootDir: string = baseDir): FileTreeNode[] {
    const tree: FileTreeNode[] = []
    const dirMap = new Map<string, FileTreeNode>()

    // 首先创建所有需要的目录节点
    files.forEach(file => {
        const relativeToBase = path.relative(baseDir, file)
        const parts = relativeToBase.split(path.sep)

        // 为每个层级创建目录节点
        for (let i = 0; i < parts.length - 1; i++) {
            const dirPath = parts.slice(0, i + 1).join(path.sep)
            const fullDirPath = path.join(baseDir, dirPath)
            const relativeToRoot = normalizePath(path.relative(rootDir, fullDirPath))

            if (!dirMap.has(dirPath)) {
                const dirNode: FileTreeNode = {
                    type: 'directory',
                    name: parts[i],
                    path: fullDirPath,
                    relativePath: relativeToRoot,
                    depth: i,
                    children: []
                }
                dirMap.set(dirPath, dirNode)
            }
        }
    })

    // 添加文件节点
    files.forEach(file => {
        const relativeToBase = path.relative(baseDir, file)
        const relativeToRoot = normalizePath(path.relative(rootDir, file))
        const parts = relativeToBase.split(path.sep)
        const depth = parts.length - 1
        const fileName = parts[parts.length - 1]

        const fileNode: FileTreeNode = {
            type: 'file',
            name: fileName,
            path: file,
            relativePath: relativeToRoot,
            depth,
            fileInfo: buildFileInfo(file, baseDir, depth)
        }

        // 如果文件在根目录
        if (parts.length === 1) {
            tree.push(fileNode)
        } else {
            // 添加到父目录
            const parentPath = parts.slice(0, -1).join(path.sep)
            const parentNode = dirMap.get(parentPath)
            if (parentNode) {
                parentNode.children!.push(fileNode)
            }
        }
    })

    // 构建目录层级关系
    dirMap.forEach((node, nodePath) => {
        const parts = nodePath.split(path.sep)

        if (parts.length === 1) {
            // 根目录下的一级目录
            tree.push(node)
        } else {
            // 添加到父目录
            const parentPath = parts.slice(0, -1).join(path.sep)
            const parentNode = dirMap.get(parentPath)
            if (parentNode) {
                parentNode.children!.push(node)
            }
        }
    })

    return tree
}

/**
 * 获取目录中的 index.md 文件
 */
export function getIndexFile(dirPath: string): string | null {
    const indexPath = path.join(dirPath, 'index.md')
    return fs.existsSync(indexPath) ? indexPath : null
}

/**
 * 将文件或目录路径转换为链接路径
 * @param relativePath 相对路径（已经是相对于项目根目录的）
 * @param isDirectory 是否是目录
 */
export function relativePathToLink(relativePath: string, isDirectory: boolean = false): string {
    let link = relativePath

    // 移除 .md 扩展名
    if (link.endsWith('.md')) {
        link = link.slice(0, -3)
    }

    // 处理 index
    if (link.endsWith('/index')) {
        link = link.slice(0, -6)
    }

    // 确保以 / 开头
    if (!link.startsWith('/')) {
        link = '/' + link
    }

    // 如果是目录且不为空，确保以 / 结尾
    if (isDirectory && link.length > 1 && !link.endsWith('/')) {
        link += '/'
    }

    return link
}

/**
 * 检查节点是否应该被包含（基于深度限制）
 */
export function shouldIncludeByDepth(node: FileTreeNode, maxDepth?: number): boolean {
    if (maxDepth === undefined) {
        return true
    }
    return node.depth < maxDepth
}
