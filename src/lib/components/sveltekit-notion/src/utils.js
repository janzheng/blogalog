export const search = (block, blocks) => blocks.find(el => el.id == block)

export const isTopLevel = (block, blocks) =>
    block.type !== search(block.parent_id, blocks).type

export const toNotionImageUrl = (url, blockId) => {
    return `https://notion.so${
        url.startsWith('/image')
            ? url
            : `/image/${encodeURIComponent(url)}?table=block&id=${blockId}`
    }`
}

export const getTextContent = block => {
    const text =
        block.properties && block.properties.title
            ? block.properties.title
            : null
    return text ? text.reduce((prev, current) => prev + current[0], '') : ''
}

export const groupBlockContent = blocks => {
    const output = []

    let lastType
    let index = -1

    blocks.forEach(block => {
        if (block.content) {
            block.content.forEach(blockId => {
                const subblock = search(blockId, blocks)
                if (subblock) {
                    if (subblock.type && subblock.type !== lastType) {
                        index++
                        lastType = subblock.type
                        output[index] = []
                    }
                    output[index].push(subblock.id)
                }
            })
            lastType = undefined
        }
    })
    return output
}

export const getListNumber = (block, blocks) => {
    const groups = groupBlockContent(blocks)
    const group = groups.find(g => g.includes(block.id))

    if (!group) return
    return group.indexOf(block.id) + 1
}

export const loadTwitter = () => {
    var id = 'twitter-wjs'

    // if script was already set, don't load it again.
    if (document.getElementById(id)) return

    var s = document.createElement('script')
    s.id = id
    s.type = 'text/javascript'
    s.async = true
    s.src = '//platform.twitter.com/widgets.js'
    document.getElementsByTagName('head')[0].appendChild(s)
}

export const isImage = attachment => {
    let name = attachment.name
    return (
        name.includes('.png') ||
        name.includes('.jpg') ||
        name.includes('.jpeg') ||
        name.includes('.tiff') ||
        name.includes('.gif') ||
        name.includes('.bmp') ||
        name.includes('.webp')
    )
}
