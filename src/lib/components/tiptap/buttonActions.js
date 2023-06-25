const chainer = (editor, fn) => editor.chain().focus()[fn]().run();

const toggleBold = editor => chainer(editor, 'toggleBold');
const toggleItalic = editor => editor.chain().focus().toggleItalic().run();
const toggleStrike = editor => editor.chain().focus().toggleStrike().run();
const toggleUnderline = editor => editor.chain().focus().toggleUnderline().run();
const toggleSuperscript = editor => editor.chain().focus().toggleSuperscript().run();
const toggleSubscript = editor => editor.chain().focus().toggleSubscript().run();
const useGreek = editor => editor.chain().focus().useGreek().run();

export { toggleBold, toggleItalic, toggleStrike, toggleUnderline, toggleSuperscript, toggleSubscript, useGreek};