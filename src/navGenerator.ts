import { FileTreeNode, NavItem, NormalizedGenNavsOptions, DirInfo, SortType } from './types'
import { sortItems } from './utils'
import { extractTitle } from './extractor'
import { relativePathToLink } from './scanner'

/**
 * 生成 Nav 配置
 */
export function generateNav(tree: FileTreeNode[], options: NormalizedGenNavsOptions): NavItem[] {
    const navConfig = options.nav || {}
    const maxDepth = navConfig.depth
    const onDirectory = navConfig.onDirectory || options.onDirectory
    const onFile = navConfig.onFile || options.onFile

    // 从第一层开始递归构建
    return buildNavItems(tree, 0, maxDepth, onDirectory, onFile, options.sort, options.excludeRootIndex)
}

/**
 * 递归查找第一个文件节点
 */
function findFirstFile(node: FileTreeNode): FileTreeNode | null {
    if (node.type === 'file') {
        return node
    }

    if (node.type === 'directory' && node.children && node.children.length > 0) {
        for (const child of node.children) {
            const file = findFirstFile(child)
            if (file) {
                return file
            }
        }
    }

    return null
}

/**
 * 查找目录下的 index.md 文件节点
 */
function findIndexFile(node: FileTreeNode): FileTreeNode | null {
    if (node.type !== 'directory' || !node.children) {
        return null
    }

    return node.children.find(child => child.type === 'file' && child.name === 'index.md') || null
}

/**
 * 递归构建 Nav items
 */
function buildNavItems(
    nodes: FileTreeNode[],
    currentDepth: number,
    maxDepth: number | undefined,
    onDirectory: ((info: DirInfo) => string | null) | undefined,
    onFile: ((info: any) => string | null) | undefined,
    sort: SortType | undefined,
    excludeRootIndex: boolean
): NavItem[] {
    // 检查深度限制
    if (maxDepth !== undefined && currentDepth >= maxDepth) {
        return []
    }

    // 排序
    const sortedNodes = sortItems(nodes, sort, node => node.name)

    const navItems: NavItem[] = []

    for (const node of sortedNodes) {
        if (node.type === 'directory') {
            const dirInfo: DirInfo = {
                name: node.name,
                path: node.path,
                relativePath: node.relativePath,
                depth: node.depth
            }

            // 使用回调或默认名称
            let text = node.name
            if (onDirectory) {
                const customText = onDirectory(dirInfo)
                if (customText !== null) {
                    text = customText
                }
            }

            // 递归处理子节点
            const childItems =
                node.children && node.children.length > 0
                    ? buildNavItems(
                          node.children,
                          currentDepth + 1,
                          maxDepth,
                          onDirectory,
                          onFile,
                          sort,
                          excludeRootIndex
                      )
                    : []

            // 如果有子节点，使用 items 创建下拉菜单；否则使用 link
            if (childItems.length > 0) {
                navItems.push({
                    text,
                    items: childItems
                })
            } else {
                // 没有子节点或已达到深度限制
                // 检查是否因为深度限制导致没有子节点
                const isDepthLimited = maxDepth !== undefined && currentDepth + 1 >= maxDepth
                let link: string

                if (isDepthLimited && node.children && node.children.length > 0) {
                    // 达到深度限制，则尝试寻找 index.md 文件作为 link
                    const indexFile = findIndexFile(node)
                    if (indexFile) {
                        link = relativePathToLink(indexFile.relativePath, false)
                    } else {
                        // 如果没有找到，则查找第一个文件作为 link
                        const firstFile = findFirstFile(node)
                        if (firstFile) {
                            link = relativePathToLink(firstFile.relativePath, false)
                        } else {
                            // 否则使用目录路径
                            link = relativePathToLink(node.relativePath, true)
                        }
                    }
                } else {
                    // 目录本身没有子节点，尝试找 index.md 或使用目录路径
                    const indexFile = findIndexFile(node)
                    link = indexFile
                        ? relativePathToLink(indexFile.relativePath, false)
                        : relativePathToLink(node.relativePath, true)
                }

                navItems.push({
                    text,
                    link
                })
            }
        } else if (node.type === 'file' && node.fileInfo) {
            // 如果需要排除根目录的 index.md
            if (excludeRootIndex && currentDepth === 0 && node.name === 'index.md') {
                continue
            }

            // 使用回调或提取标题
            let text = extractTitle(node.path)
            if (onFile) {
                const customText = onFile(node.fileInfo)
                if (customText !== null) {
                    text = customText
                }
            }

            // 直接使用 relativePath
            const link = relativePathToLink(node.relativePath, false)

            navItems.push({
                text,
                link
            })
        }
    }

    return navItems
}
