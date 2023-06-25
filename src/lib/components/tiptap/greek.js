import {
  Mark,
  mergeAttributes,
  // markInputRule,
  // markPasteRule,
  // textInputRule
} from '@tiptap/core'

import { Plugin, PluginKey } from 'prosemirror-state'




export const Greek = Mark.create({
  name: 'greek',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'greek'
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    let _mark = this
    return {
      useGreek: () => ({state, dispatch, commands}) => {
        let { empty, ranges } = state.selection
        console.log('state:', state, state.selection, state.selection.content())
        const content = state.selection.content()

        if (!empty) {

          // ripped out from toggleMark
          let has = false, tr = state.tr, markType = _mark.type

          for (let i = 0; !has && i < ranges.length; i++) {
            let { $from, $to } = ranges[i]
            has = state.doc.rangeHasMark($from.pos, $to.pos, markType)
          }
          for (let i = 0; i < ranges.length; i++) {
            let { $from, $to } = ranges[i]
            if (has) {
              symbolSlice(content, true, true, true)
              // console.log('un-symbolized: ', normaltext, content, 'selection:', jsonID)
              state.selection.replace(tr, content)
              // tr.insertText(`${trailspace}${normaltext}${trailspace}`, $from.pos, $to.pos)
              tr.removeMark($from.pos, $to.pos, markType)
              // tr.replaceSelection(normalSlice)
            } else {
              // turn selected text into symbols
              const symboltext = symbolSlice(content, true, false, true)
              if (!state.selection.empty) // selection
                state.selection.replace(tr, content)
              tr.addMark($from.pos, $to.pos, markType.create())
              if (state.selection.empty) // necessary for typing in symbols
                tr.insertText(`${symboltext}${trailspace}`, $from.pos, $to.pos)
            }
            // console.log('tr.stateSel:', tr.selection)
            tr.scrollIntoView()
          }

          // toggleMark(cmd.type)(state, dispatch)
          // tr.insertText(`${text}${trailspace}`, state.selection.from, state.selection.to)
          dispatch(tr)
          // return true
          return commands.toggleMark('greek')

        } else {
          // console.log('command...', state, state.tr, 'content:?:?:', )
          // return dispatch(state.tr.insertText("wtf"))
          // return toggleMark(cmd.type)(state, dispatch)
          return commands.toggleMark('greek')
        }
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-g': () => this.editor.commands.toggleGreek(),
    }
  },

  addProseMirrorPlugins() {
    const plugins = []

    plugins.push(
      new Plugin({
        key: new PluginKey('applyGreekText'),
        state: {
          init: (_, state) => {
          },
          // apply: (tr, value, oldState, newState) => {
          apply: (tr) => {
            if (tr.docChanged) {
              // console.log('symbol_node apply:', tr.doc, tr.doc.lastChild, tr.doc.lastChild['textContent'])
              // applies symbol transformation directly on the tr node by ref
              // the reason is b/c we don't want to undo conversion from alpha to greek as a separate transaction
              // const symboltext = symbolSlice(tr.doc.lastChild, false, false, true)
              const symboltext = symbolSlice(tr.doc, false, false, true)
            }
          },
        },
      }),
    )

    return plugins
  }

})

export default Greek



export const symbolSwap = (strdata, isReverse, alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$^*\\") => {
  // swaps all occurrences of a letter in the alpha map to symbols
  // these mimic the symbols font used in Word
  if (strdata === null) {
    return ''
  }

  const symbols = "αβχδεφγηιϕκλμνοπθρστυϖωξψζΑΒΧΔΕΦΓΗΙϑΚΛΜΝΟΠΘΡΣΤΥςΩΞΨΖ!≅#∃⊥∗∴"
  // const alphakeys = Object.keys(alpha)
  // console.log('alpha:', alpha, strdata)

  let output = ""
  if (isReverse) {
    strdata.split('').forEach(str => {
      // console.log('trying...', alpha.indexOf(str))
      if (symbols.indexOf(str) >= 0) { // convert greek to a-z
        // console.log('rev...', str, alpha.charAt(symbols.indexOf(str)))
        output += alpha.charAt(symbols.indexOf(str))
      } else {
        output += str
      }
    })

  } else {
    strdata.split('').forEach(str => {
      // console.log('trying...', alpha.indexOf(str))
      if (alpha.indexOf(str) >= 0) {
        output += symbols.charAt(alpha.indexOf(str))
      } else {
        output += str
      }
    })
  }

  // console.log('!!! output:', output)
  return output
}


export const symbolSlice = (slice, _isSymbol = false, isReverse = false, objReplace = false) => {
  // isSymbol is set to false, and used to look for 'greek' objects when pasting symbols from Word
  // set it to true to convert any kinds of slices, e.g. from a command
  let text = ''

  const dig = (content) => {
    if (Array.isArray(content)) {
      content.map(node => {
        let isSymbol = _isSymbol
        // if(!isReverse)
        text = ''
        if (node['marks'] && node['marks'].length > 0) {
          node['marks'].map(mark => {
            // console.log('mark:', mark)
            if (mark['type']['name'] === "greek")
              isSymbol = true
          })
        }
        // console.log('node :::', isSymbol, node['marks'], node['text'], node)
        if (isSymbol && node && node['text']) {
          // console.log('symbol node:', node, node['text'], isReverse)
          node['text'].split('').map((str) => {
            // console.log('swapping:', str)
            const symbol = symbolSwap(str, isReverse)
            text += symbol
          })
          if (objReplace) {
            node['text'] = text
            // console.log('new text:', text)
          }
          // return node['text'] = text
          return
        }
        else if (node['content']) {
          // console.log('>> digging deeper')
          return dig(node['content'])
        }
        return
      })
    }
    else if (content['content']) {
      // console.log('* digging deeper', content['content'])
      return dig(content['content'])
    }
  }

  // console.log('>--------')
  // console.log(':::: symbol convert:', slice, slice['textContent'])
  if (slice['content']) {
    dig(slice['content'])
  }

  // console.log('returning slice:', slice['content'], text)
  // console.log('<--------')
  return text
}
