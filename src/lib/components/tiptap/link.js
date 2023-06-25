import {
  Mark,
  markPasteRule,
  mergeAttributes,
} from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { find } from 'linkifyjs'



export default Greek
export const Greek = Mark.create({
  name: 'link',

  priority: 1000,

  inclusive: false,

  addOptions() {
    return {
      openOnClick: true,
      linkOnPaste: true,
      HTMLAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer nofollow',
      },
    }
  },

  addAttributes() {
    return {
      href: {
        default: null,
      },
      target: {
        default: this.options.HTMLAttributes.target,
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'a[href]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['a', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setLink: attributes => ({ commands }) => {
        return commands.setMark('link', attributes)
      },
      toggleLink: attributes => (toggleObj) => {
        console.log('----> toggle: ', toggleObj)
        return toggleObj.commands.toggleMark('link', attributes, { extendEmptyMarkRange: true })
      },
      unsetLink: () => ({ commands }) => {
        return commands.unsetMark('link', { extendEmptyMarkRange: true })
      },
    }
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: text => find(text)
          .filter(link => link.isLink)
          .map(link => ({
            text: 'banana: ' + link.value,
            index: link.start,
            data: 'rrama: ' + link,
          })),
        type: this.type,
        getAttributes: match => ({
          href: match.data ? match.data.href : undefined,
        }),
      }),
    ]
  },

  addProseMirrorPlugins() {
    const plugins = []

    plugins.push(
      new Plugin({
        key: new PluginKey('handleClick'),
        props: {
          handleClick: (view, pos, event) => {
            const attrs = this.editor.getAttributes('link')
            const link = event.target ? event.target.closest('a') : undefined

            if (link && attrs.href) {
              window.open(attrs.href, attrs.target)

              return true
            }

            return false
          },
        },
      }),
    )

    if (this.options.linkOnPaste) {
      plugins.push(
        new Plugin({
          key: new PluginKey('handlePasteLink'),
          props: {
            handlePaste: (view, event, slice) => {
              const { state } = view
              const { selection } = state
              const { empty } = selection

              if (empty) {
                return false
              }

              let textContent = ''

              slice.content.forEach(node => {
                textContent += node.textContent
              })

              const link = find(textContent)
                .find(item => item.isLink && item.value === textContent)

              if (!textContent || !link) {
                return false
              }

              this.editor.commands.setMark(this.type, {
                href: link.href,
              })

              return true
            },
          },
        }),
      )
    }

    return plugins
  },
})
