import { FileTreeNode, SidebarItem, GenNavsOptions, DirInfo, SidebarConfig_VP } from './types'
import { sortItems } from './utils'
import { extractTitle } from './extractor'
import { shouldIncludeByDepth, relativePathToLink } from './scanner'

/**
 * 生成 Sidebar 配置
 */
export function generateSidebar(tree: FileTreeNode[], options: GenNavsOptions): SidebarConfig_VP {
    const sidebar: SidebarConfig_VP = {}
    const sidebarConfig = options.sidebar || {}

    // 为每个一级目录生成 sidebar
    const firstLevelDirs = tree.filter(node => node.type === 'directory' && node.depth === 0)

    for (const dirNode of firstLevelDirs) {
        // 使用 relativePath 生成 sidebar 路径
        const sidebarPath = relativePathToLink(dirNode.relativePath, true)
        const items = generateSidebarItems([dirNode], options, 0)

        if (items.length > 0) {
            sidebar[sidebarPath] = items
        }
    }

    return sidebar
}

/**
 * 递归生成 sidebar items
 */
function generateSidebarItems(nodes: FileTreeNode[], options: GenNavsOptions, currentDepth: number): SidebarItem[] {
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
