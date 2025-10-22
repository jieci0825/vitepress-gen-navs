import { FileTreeNode, SidebarItem, NormalizedGenNavsOptions, DirInfo, SidebarConfig_VP, NavItem } from './types'
import { sortItems } from './utils'
import { extractTitle } from './extractor'
import { shouldIncludeByDepth, relativePathToLink } from './scanner'

/**
 * 生成 Sidebar 配置，基于 tree 结构
 */
export function generateSidebar(tree: FileTreeNode[], options: NormalizedGenNavsOptions): SidebarConfig_VP {
    const sidebar: SidebarConfig_VP = {}

    // 遍历 tree 的每个顶级目录，为其生成 sidebar
    for (const node of tree) {
        if (node.type === 'directory' && node.children && node.children.length > 0) {
            // 将 relativePath 转换为 link 路径作为 sidebar 的 key
            const sidebarKey = relativePathToLink(node.relativePath, true)

            // 生成该目录下的所有 sidebar items
            const items = generateSidebarItems(node.children, options, node.depth + 1)

            if (items.length > 0) {
                sidebar[sidebarKey] = items
            }
        }
    }

    return sidebar
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
                    items: childItems,
                    collapsed
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
                link,
                collapsed
            })
        }
    }

    return items
}
