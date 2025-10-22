import { FileTreeNode, SidebarItem, NormalizedGenNavsOptions, DirInfo, SidebarConfig_VP, NavItem } from './types'
import { sortItems } from './utils'
import { extractTitle } from './extractor'
import { shouldIncludeByDepth, relativePathToLink } from './scanner'

/**
 * 生成 Sidebar 配置，基于 nav 结构
 */
export function generateSidebar(
    tree: FileTreeNode[],
    nav: NavItem[],
    options: NormalizedGenNavsOptions
): SidebarConfig_VP {
    const sidebar: SidebarConfig_VP = {}

    // 从 nav 中提取所有需要生成 sidebar 的路径
    const sidebarPaths = extractSidebarPaths(nav)

    console.log(sidebarPaths)

    // 为每个路径生成 sidebar
    for (const sidebarPath of sidebarPaths) {
        // 在文件树中找到对应的目录节点
        const dirNode = findNodeByLink(tree, sidebarPath)

        if (dirNode && dirNode.type === 'directory') {
            // 生成该目录下的所有文件项
            const items = generateSidebarItems([dirNode], options, 0)

            if (items.length > 0) {
                sidebar[sidebarPath] = items
            }
        }
    }

    return sidebar
}

/**
 * 从 nav 中提取所有需要生成 sidebar 的路径
 * 规则：遍历 nav，找到所有叶子节点的 link，提取其父路径
 */
function extractSidebarPaths(nav: NavItem[]): string[] {
    const paths = new Set<string>()

    function traverse(items: NavItem[]) {
        for (const item of items) {
            if ('link' in item && item.link) {
                // 叶子节点，提取父路径
                const parentPath = extractParentPath(item.link)
                if (parentPath) {
                    paths.add(parentPath)
                }
            } else if ('items' in item && item.items) {
                // 递归遍历子项
                traverse(item.items)
            }
        }
    }

    traverse(nav)
    return Array.from(paths)
}

/**
 * 从 link 中提取父路径
 * 例如："/docs/历史/架空/架空文" -> "/历史/架空"
 */
function extractParentPath(link: string): string | null {
    // 去掉开头的 /
    let path = link.startsWith('/') ? link.slice(1) : link

    // 去掉 /docs 前缀（如果存在）
    if (path.startsWith('docs/')) {
        path = path.slice(5)
    }

    // 分割路径
    const parts = path.split('/').filter(p => p.length > 0)

    // 至少要有2个部分才能提取父路径
    if (parts.length < 2) {
        return null
    }

    // 去掉最后一个部分，得到父路径
    const parentParts = parts.slice(0, -1)
    return '/' + parentParts.join('/')
}

/**
 * 在文件树中根据 link 查找对应的节点
 */
function findNodeByLink(tree: FileTreeNode[], targetLink: string): FileTreeNode | null {
    // 去掉开头的 /
    let path = targetLink.startsWith('/') ? targetLink.slice(1) : targetLink

    // 分割路径
    const parts = path.split('/').filter(p => p.length > 0)

    function searchInNodes(nodes: FileTreeNode[], depth: number): FileTreeNode | null {
        if (depth >= parts.length) {
            return null
        }

        const targetName = parts[depth]

        for (const node of nodes) {
            if (node.name === targetName || (node.type === 'directory' && node.name === targetName)) {
                // 找到匹配的节点
                if (depth === parts.length - 1) {
                    // 已经是最后一层
                    return node
                } else if (node.children) {
                    // 继续在子节点中查找
                    return searchInNodes(node.children, depth + 1)
                }
            }
        }

        return null
    }

    return searchInNodes(tree, 0)
}

/**
 * 递归生成 sidebar items
 */
function generateSidebarItems(
    nodes: FileTreeNode[],
    options: NormalizedGenNavsOptions,
    currentDepth: number
): SidebarItem[] {
    const sidebarConfig = options.sidebar || {}
    const maxDepth = sidebarConfig.depth
    const onDirectory = sidebarConfig.onDirectory || options.onDirectory
    const onFile = sidebarConfig.onFile || options.onFile
    const collapsed = sidebarConfig.collapsed

    const items: SidebarItem[] = []

    // 排序节点
    const sortedNodes = sortItems(nodes, options.sort, node => node.name)

    for (const node of sortedNodes) {
        // 检查深度限制
        if (!shouldIncludeByDepth(node, maxDepth)) {
            continue
        }

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
            const childItems = node.children ? generateSidebarItems(node.children, options, currentDepth + 1) : []

            if (childItems.length > 0) {
                const sidebarItem: SidebarItem = {
                    text,
                    items: childItems
                }

                // 设置 collapsed 属性
                if (collapsed !== undefined) {
                    sidebarItem.collapsed = collapsed
                }

                items.push(sidebarItem)
            }
        } else if (node.type === 'file' && node.fileInfo) {
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

            items.push({
                text,
                link
            })
        }
    }

    return items
}
