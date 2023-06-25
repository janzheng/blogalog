
/*eslint no-irregular-whitespace: 0 */

/*

  this handles something annoying that happens when you combine scientists and MS Word
  - Many scientists use Word, and when they type symbols, they often don't use ASCII values but the symbol font.
  - The problem is that symbol fonts resolve to regular characters in rich text, (but somehow resolve to correct ascii symbols
  in textarea and text bars, but the other rich text gets dropped)
  - Word also copies a lot of HTML over as rich text — the aforementioned symbols are copied over in something like this:

  This is the HTML node that wraps around each symbol:

  <span lang=​"EN-US" style=​"font-size:​12.0pt;​font-family:​Symbol;​
  mso-fareast-font-family:​"ＭＳ 明朝";​mso-fareast-theme-font:​minor-fareast;​
  mso-bidi-font-family:​"Times New Roman";​mso-bidi-theme-font:​minor-bidi;​
  mso-ansi-language:​EN-US;​mso-fareast-language:​EN-US;​mso-bidi-language:​AR-SA">​q​</span>

  You can catch:
  - ​font-family:​Symbol
  - and turn the letters into symbols by mapping the keys, but this might not always work

  Key map:
  abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$^*\
  αβχδεφγηιϕκλμνοπθρστυϖωξψζΑΒΧΔΕΦΓΗΙϑΚΛΜΝΟΠΘΡΣΤΥςΩΞΨΖ!≅#∃⊥∗∴

  This "fix"
  - This is not really a good fix, as some computers or fonts might resolve some symbols differently than others
  - BUT this is the only way I'll be able to extract symbols, b/c there's no standard


*/

// import { Slice, Mark, Extension, Plugin, PluginKey } from 'tiptap'
import { Mark, Extension, Plugin, PluginKey } from 'tiptap'
// import { toggleMark, markInputRule, markPasteRule, chainCommands } from 'tiptap-commands'
import { toggleMark } from 'tiptap-commands'
// import { nodeEqualsType } from 'tiptap-utils'

export default class Symbolspan extends Mark {

  get name() {
    return 'symbolspan'
  }

  get schema() {
    return {
      parseDOM: [
        {
          tag: 'span',
          getAttrs: node => {
            // console.log('***** getattrs node:', node, node.textContent, node.style.fontFamily)
            return node.style.fontFamily === 'Symbol' && null
            // return true
          },
        },
        // {
        //   style: 'font-weight',
        //   getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
        // },
      ],
      // toDOM: (node) => {
      toDOM: () => {
        return ['o', { class: "symbol" }, 0]
        // return ['span', {class: "symbol"}, 0]
      },
    }
  }

  // keys({ type }) {
  //   return {
  //     // 'Mod-b': toggleMark(type),
  //   }
  // }

  commands(cmd) {

    // console.log('commands:', cmd, cmd.type)

    return () => (state, dispatch) => {

      // let {empty, $cursor, ranges, jsonID, from, ti} = state.selection
      // let {empty, ranges, jsonID, from, ti} = state.selection
      let { empty, ranges } = state.selection
      // console.log('state:', state, state.selection, state.selection.content())
      const content = state.selection.content()

      if (!empty) {

        // convert anything selected into symbols
        // console.log('newslice:', content)
        // return dispatch(state.tr.replaceSelection(content))
        let trailspace = ''
        // overcomes a weird prosemirror bug w/ allselection not working unless you add a space;
        // w/o this PM doesn't always toggle
        // if(jsonID == 'all')
        //   trailspace = ' '

        // ripped out from toggleMark
        let has = false, tr = state.tr
        for (let i = 0; !has && i < ranges.length; i++) {
          let { $from, $to } = ranges[i]
          has = state.doc.rangeHasMark($from.pos, $to.pos, cmd.type)
        }
        for (let i = 0; i < ranges.length; i++) {
          let { $from, $to } = ranges[i]
          if (has) {
            symbolSlice(content, true, true, true)
            // console.log('un-symbolized: ', normaltext, content, 'selection:', jsonID)
            state.selection.replace(tr, content)
            // tr.insertText(`${trailspace}${normaltext}${trailspace}`, $from.pos, $to.pos)
            tr.removeMark($from.pos, $to.pos, cmd.type)
            // tr.replaceSelection(normalSlice)
          } else {
            // turn selected text into symbols
            const symboltext = symbolSlice(content, true, false, true)
            if (!state.selection.empty) // selection
              state.selection.replace(tr, content)
            tr.addMark($from.pos, $to.pos, cmd.type.create())
            // console.log('REPLACING !!!!!', content)
            if (state.selection.empty) // necessary for typing in symbols
              tr.insertText(`${symboltext}${trailspace}`, $from.pos, $to.pos)
          }
          // console.log('tr.stateSel:', tr.selection)
          tr.scrollIntoView()
        }

        // toggleMark(cmd.type)(state, dispatch)
        // tr.insertText(`${text}${trailspace}`, state.selection.from, state.selection.to)
        dispatch(tr)
        return true

      } else {
        // console.log('command...', state, state.tr, 'content:?:?:', )
        // return dispatch(state.tr.insertText("wtf"))
        return toggleMark(cmd.type)(state, dispatch)
      }
    }
  }

  // inputRules({ type }) {
  //   console.log('input rules:', type)
  //   return [
  //     markInputRule(/(?:\*\*|__)([^*_]+)(?:\*\*|__)$/, type),
  //   ]
  // }

  // pasteRules({ type }) {
  //   return [
  //     markPasteRule(/(?:\*\*|__)([^*_]+)(?:\*\*|__)/g, type),
  //   ]
  // }

}



const symbolKey = new PluginKey("collab")

export class SymbolNode extends Extension {

  get name() {
    return 'symbol_node'
  }

  get plugins() {
    // const plugin = new PluginKey(this.name)
    return [
      new Plugin({
        key: symbolKey,
        props: {
          // handleClick: (view, pos, event) => {
          // },
        },
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
    ]
  }

}






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
  // isSymbol is set to false, and used to look for 'symbolspan' objects when pasting symbols from Word
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
            if (mark['type']['name'] === "symbolspan")
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



// // :: (MarkType, ?Object) → (state: EditorState, dispatch: ?(tr: Transaction)) → bool
// // Create a command function that toggles the given mark with the
// // given attributes. Will return `false` when the current selection
// // doesn't support that mark. This will remove the mark if any marks
// // of that type exist in the selection, or add it otherwise. If the
// // selection is empty, this applies to the [stored
// // marks](#state.EditorState.storedMarks) instead of a range of the
// // document.
// export function _toggleMark(markType, attrs) {
//   return function(state, dispatch) {
//     let {empty, $cursor, ranges} = state.selection
//     if ((empty && !$cursor) || !markApplies(state.doc, ranges, markType)) return false
//     if (dispatch) {
//       if ($cursor) {
//         if (markType.isInSet(state.storedMarks || $cursor.marks()))
//           dispatch(state.tr.removeStoredMark(markType))
//         else
//           dispatch(state.tr.addStoredMark(markType.create(attrs)))
//       } else {
//         let has = false, tr = state.tr
//         for (let i = 0; !has && i < ranges.length; i++) {
//           let {$from, $to} = ranges[i]
//           has = state.doc.rangeHasMark($from.pos, $to.pos, markType)
//         }
//         for (let i = 0; i < ranges.length; i++) {
//           let {$from, $to} = ranges[i]
//           if (has) tr.removeMark($from.pos, $to.pos, markType)
//           else tr.addMark($from.pos, $to.pos, markType.create(attrs))
//         }
//         dispatch(tr.scrollIntoView())
//       }
//     }
//     return true
//   }
// }


// function markApplies(doc, ranges, type) {
//   for (let i = 0; i < ranges.length; i++) {
//     let {$from, $to} = ranges[i]
//     let can = $from.depth == 0 ? doc.type.allowsMarkType(type) : false
//     doc.nodesBetween($from.pos, $to.pos, node => {
//       if (can) return false
//       can = node.inlineContent && node.type.allowsMarkType(type)
//     })
//     if (can) return true
//   }
//   return false
// }

