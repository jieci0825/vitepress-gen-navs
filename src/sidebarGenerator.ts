import { FileTreeNode, SidebarItem, NormalizedGenNavsOptions, DirInfo, SidebarConfig_VP, NavItem } from './types'
import { extractTitle } from './extractor'
import { relativePathToLink } from './scanner'
import { removeSortPrefix } from './utils'

/**
 * 生成 Sidebar 配置，基于 nav 结构
 */
export function generateSidebar(
    tree: FileTreeNode[],
    nav: NavItem[],
    options: NormalizedGenNavsOptions
): SidebarConfig_VP {
    const sidebar: SidebarConfig_VP = {}

    // 1. 从 nav 中提取 navKeys
    const navKeys = extractNavKeys(nav)

    // 2. 为每个 navKey 生成对应的 sidebar
    for (const navKey of navKeys) {
        // 将 navKey 转换为 relativePath（去掉前导 /）
        const relativePath = navKey.startsWith('/') ? navKey.slice(1) : navKey

        // 在 tree 中找到对应的节点
        const node = findNodeByRelativePath(tree, relativePath)

        if (node && node.type === 'directory' && node.children && node.children.length > 0) {
            // 生成该目录下的所有 sidebar items
            const items = generateSidebarItems(node.children, options, node.depth + 1)

            if (items.length > 0) {
                // sidebar 的 key 需要以 / 开头和结尾
                const sidebarKey = navKey.startsWith('/') ? navKey : '/' + navKey
                const finalKey = sidebarKey.endsWith('/') ? sidebarKey : sidebarKey + '/'
                sidebar[finalKey] = items
            }
        }
    }

    return sidebar
}

/**
 * 从 nav 中提取所有叶子节点的 link，并去掉最后一个路径段得到 navKeys
 */
function extractNavKeys(nav: NavItem[]): string[] {
    const keys: string[] = []

    function traverse(items: NavItem[]) {
        for (const item of items) {
            if ('items' in item && item.items && item.items.length > 0) {
                // 有子项，继续递归遍历
                traverse(item.items)
            } else if ('link' in item && item.link) {
                // 叶子节点，提取 link 并去掉最后一个路径段
                const link = item.link
                const lastSlashIndex = link.lastIndexOf('/')
                const key = lastSlashIndex > 0 ? link.slice(0, lastSlashIndex) : link

                // 去重
                if (!keys.includes(key)) {
                    keys.push(key)
                }
            }
        }
    }

    traverse(nav)
    return keys
}

/**
 * 在 tree 中根据 relativePath 查找节点
 */
function findNodeByRelativePath(tree: FileTreeNode[], relativePath: string): FileTreeNode | null {
    // 空路径或根路径，返回 null
    if (!relativePath || relativePath === '/') {
        return null
    }

    const parts = relativePath.split('/').filter(p => p)

    let currentNodes = tree
    let currentNode: FileTreeNode | null = null

    for (const part of parts) {
        const found = currentNodes.find(n => n.name === part)
        if (!found) {
            return null
        }
        currentNode = found
        if (found.type === 'directory' && found.children) {
            currentNodes = found.children
        } else {
            break
        }
    }

    return currentNode
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

    const onDirectory = sidebarConfig.onDirectory || options.onDirectory
    const onFile = sidebarConfig.onFile || options.onFile
    const collapsed = sidebarConfig.collapsed

    const items: SidebarItem[] = []

    for (const node of nodes) {
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

            // 格式化排序前缀
            if (options.formatSortPrefix) {
                text = removeSortPrefix(text)
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

            // 格式化排序前缀
            if (options.formatSortPrefix) {
                text = removeSortPrefix(text)
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
