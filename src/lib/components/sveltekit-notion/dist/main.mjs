import { browser } from '$app/environment';

function noop() { }
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function is_promise(value) {
    return value && typeof value === 'object' && typeof value.then === 'function';
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
let src_url_equal_anchor;
function src_url_equal(element_src, url) {
    if (!src_url_equal_anchor) {
        src_url_equal_anchor = document.createElement('a');
    }
    src_url_equal_anchor.href = url;
    return element_src === src_url_equal_anchor.href;
}
function is_empty(obj) {
    return Object.keys(obj).length === 0;
}
function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
        const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn
        ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
        : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
        const lets = definition[2](fn(dirty));
        if ($$scope.dirty === undefined) {
            return lets;
        }
        if (typeof lets === 'object') {
            const merged = [];
            const len = Math.max($$scope.dirty.length, lets.length);
            for (let i = 0; i < len; i += 1) {
                merged[i] = $$scope.dirty[i] | lets[i];
            }
            return merged;
        }
        return $$scope.dirty | lets;
    }
    return $$scope.dirty;
}
function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
    if (slot_changes) {
        const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
        slot.p(slot_context, slot_changes);
    }
}
function get_all_dirty_from_scope($$scope) {
    if ($$scope.ctx.length > 32) {
        const dirty = [];
        const length = $$scope.ctx.length / 32;
        for (let i = 0; i < length; i++) {
            dirty[i] = -1;
        }
        return dirty;
    }
    return -1;
}
function null_to_empty(value) {
    return value == null ? '' : value;
}
function append(target, node) {
    target.appendChild(node);
}
function append_styles(target, style_sheet_id, styles) {
    const append_styles_to = get_root_for_style(target);
    if (!append_styles_to.getElementById(style_sheet_id)) {
        const style = element('style');
        style.id = style_sheet_id;
        style.textContent = styles;
        append_stylesheet(append_styles_to, style);
    }
}
function get_root_for_style(node) {
    if (!node)
        return document;
    const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
    if (root && root.host) {
        return root;
    }
    return node.ownerDocument;
}
function append_stylesheet(node, style) {
    append(node.head || node, style);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
        if (iterations[i])
            iterations[i].d(detaching);
    }
}
function element(name) {
    return document.createElement(name);
}
function svg_element(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function empty() {
    return text('');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function children(element) {
    return Array.from(element.childNodes);
}
function set_data(text, data) {
    data = '' + data;
    if (text.wholeText !== data)
        text.data = data;
}
function set_style(node, key, value, important) {
    if (value === null) {
        node.style.removeProperty(key);
    }
    else {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
}
// unfortunately this can't be a constant as that wouldn't be tree-shakeable
// so we cache the result instead
let crossorigin;
function is_crossorigin() {
    if (crossorigin === undefined) {
        crossorigin = false;
        try {
            if (typeof window !== 'undefined' && window.parent) {
                void window.parent.document;
            }
        }
        catch (error) {
            crossorigin = true;
        }
    }
    return crossorigin;
}
function add_resize_listener(node, fn) {
    const computed_style = getComputedStyle(node);
    if (computed_style.position === 'static') {
        node.style.position = 'relative';
    }
    const iframe = element('iframe');
    iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
        'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.tabIndex = -1;
    const crossorigin = is_crossorigin();
    let unsubscribe;
    if (crossorigin) {
        iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
        unsubscribe = listen(window, 'message', (event) => {
            if (event.source === iframe.contentWindow)
                fn();
        });
    }
    else {
        iframe.src = 'about:blank';
        iframe.onload = () => {
            unsubscribe = listen(iframe.contentWindow, 'resize', fn);
        };
    }
    append(node, iframe);
    return () => {
        if (crossorigin) {
            unsubscribe();
        }
        else if (unsubscribe && iframe.contentWindow) {
            unsubscribe();
        }
        detach(iframe);
    };
}
function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
}
class HtmlTag {
    constructor(is_svg = false) {
        this.is_svg = false;
        this.is_svg = is_svg;
        this.e = this.n = null;
    }
    c(html) {
        this.h(html);
    }
    m(html, target, anchor = null) {
        if (!this.e) {
            if (this.is_svg)
                this.e = svg_element(target.nodeName);
            else
                this.e = element(target.nodeName);
            this.t = target;
            this.c(html);
        }
        this.i(anchor);
    }
    h(html) {
        this.e.innerHTML = html;
        this.n = Array.from(this.e.childNodes);
    }
    i(anchor) {
        for (let i = 0; i < this.n.length; i += 1) {
            insert(this.t, this.n[i], anchor);
        }
    }
    p(html) {
        this.d();
        this.h(html);
        this.i(this.a);
    }
    d() {
        this.n.forEach(detach);
    }
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error('Function called outside component initialization');
    return current_component;
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
function setContext(key, context) {
    get_current_component().$$.context.set(key, context);
    return context;
}
function getContext(key) {
    return get_current_component().$$.context.get(key);
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
// flush() calls callbacks in this order:
// 1. All beforeUpdate callbacks, in order: parents before children
// 2. All bind:this callbacks, in reverse order: children before parents.
// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
//    for afterUpdates called during the initial onMount, which are called in
//    reverse order: children before parents.
// Since callbacks might update component values, which could trigger another
// call to flush(), the following steps guard against this:
// 1. During beforeUpdate, any updated components will be added to the
//    dirty_components array and will cause a reentrant call to flush(). Because
//    the flush index is kept outside the function, the reentrant call will pick
//    up where the earlier call left off and go through all dirty components. The
//    current_component value is saved and restored so that the reentrant call will
//    not interfere with the "parent" flush() call.
// 2. bind:this callbacks cannot trigger new flush() calls.
// 3. During afterUpdate, any updated components will NOT have their afterUpdate
//    callback called a second time; the seen_callbacks set, outside the flush()
//    function, guarantees this behavior.
const seen_callbacks = new Set();
let flushidx = 0; // Do *not* move this inside the flush() function
function flush() {
    const saved_component = current_component;
    do {
        // first, call beforeUpdate functions
        // and update components
        while (flushidx < dirty_components.length) {
            const component = dirty_components[flushidx];
            flushidx++;
            set_current_component(component);
            update(component.$$);
        }
        set_current_component(null);
        dirty_components.length = 0;
        flushidx = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    seen_callbacks.clear();
    set_current_component(saved_component);
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}
const outroing = new Set();
let outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros // parent group
    };
}
function check_outros() {
    if (!outros.r) {
        run_all(outros.c);
    }
    outros = outros.p;
}
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
    else if (callback) {
        callback();
    }
}

function handle_promise(promise, info) {
    const token = info.token = {};
    function update(type, index, key, value) {
        if (info.token !== token)
            return;
        info.resolved = value;
        let child_ctx = info.ctx;
        if (key !== undefined) {
            child_ctx = child_ctx.slice();
            child_ctx[key] = value;
        }
        const block = type && (info.current = type)(child_ctx);
        let needs_flush = false;
        if (info.block) {
            if (info.blocks) {
                info.blocks.forEach((block, i) => {
                    if (i !== index && block) {
                        group_outros();
                        transition_out(block, 1, 1, () => {
                            if (info.blocks[i] === block) {
                                info.blocks[i] = null;
                            }
                        });
                        check_outros();
                    }
                });
            }
            else {
                info.block.d(1);
            }
            block.c();
            transition_in(block, 1);
            block.m(info.mount(), info.anchor);
            needs_flush = true;
        }
        info.block = block;
        if (info.blocks)
            info.blocks[index] = block;
        if (needs_flush) {
            flush();
        }
    }
    if (is_promise(promise)) {
        const current_component = get_current_component();
        promise.then(value => {
            set_current_component(current_component);
            update(info.then, 1, info.value, value);
            set_current_component(null);
        }, error => {
            set_current_component(current_component);
            update(info.catch, 2, info.error, error);
            set_current_component(null);
            if (!info.hasCatch) {
                throw error;
            }
        });
        // if we previously had a then/catch block, destroy it
        if (info.current !== info.pending) {
            update(info.pending, 0);
            return true;
        }
    }
    else {
        if (info.current !== info.then) {
            update(info.then, 1, info.value, promise);
            return true;
        }
        info.resolved = promise;
    }
}
function update_await_block_branch(info, ctx, dirty) {
    const child_ctx = ctx.slice();
    const { resolved } = info;
    if (info.current === info.then) {
        child_ctx[info.value] = resolved;
    }
    if (info.current === info.catch) {
        child_ctx[info.error] = resolved;
    }
    info.block.p(child_ctx, dirty);
}
function create_component(block) {
    block && block.c();
}
function mount_component(component, target, anchor, customElement) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
    }
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        on_disconnect: [],
        before_update: [],
        after_update: [],
        context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false,
        root: options.target || parent_component.$$.root
    };
    append_styles && append_styles($$.root);
    let ready = false;
    $$.ctx = instance
        ? instance(component, options.props || {}, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if (!$$.skip_bound && $$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor, options.customElement);
        flush();
    }
    set_current_component(parent_component);
}
/**
 * Base class for Svelte components. Used when dev=false.
 */
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set($$props) {
        if (this.$$set && !is_empty($$props)) {
            this.$$.skip_bound = true;
            this.$$set($$props);
            this.$$.skip_bound = false;
        }
    }
}

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z$3 = ":root {\n\n  --notion-bold: 600;\n\n  --notion-page-width: 704px;\n  --notion-base: 1rem;\n  --notion-pad-offset: 0.75;\n  --notion-small: 0.8rem;\n  --notion-smaller: 0.75rem;\n  --notion-title: 2.5rem;\n\n  --notion-h1: 1.875em;\n  --notion-h1-weight: var(--notion-bold);\n  --notion-h1-line-height: 1.2;\n  --notion-h1-margin-top: calc(var(--notion-h1) * var(--notion-pad-offset));\n  --notion-h1-padding-bottom: 0.2em;\n\n  --notion-h2: 1.5rem;\n  --notion-h2-weight: var(--notion-bold);\n  --notion-h2-line-height: 1.5;\n  --notion-h2-margin-top: 0.6em;\n  --notion-h2-padding-bottom: var(--notion-3px);\n\n  --notion-h3 : 1.42rem;\n  --notion-h3-weight: var(--notion-bold);\n  --notion-h3-line-height: 1.4;\n  --notion-h3-margin-top: 0.6em;\n  --notion-h3-padding-bottom: var(--notion-3px);\n\n  --notion-p-padding: var(--notion-3px) var(--notion-2px);\n\n  --notion-1d6em: calc(var(--notion-base) * 1.6);\n  --notion-1d4em: calc(var(--notion-base) * 1.4);\n  --notion-12px: calc(var(--notion-base) * 0.75);\n  --notion-8px: calc(var(--notion-base) * 0.5);\n  --notion-6px: calc(var(--notion-base) * 0.375);\n  --notion-3px: calc(var(--notion-base) * 0.1875);\n  --notion-2px: calc(var(--notion-base) * 0.125);\n  --color-text-default: rgb(55, 53, 47);\n  --color-text-default-light: #64748b;\n  --color-text-checked: rgb(187, 187, 187);\n  --color-text-gray: rgba(29, 29, 37, 0.93);\n  --color-text-brown: rgb(102, 49, 13);\n  --color-text-orange: rgb(129, 44, 10);\n  --color-text-yellow: rgb(111, 76, 18);\n  --color-text-green: rgb(35, 93, 28);\n  --color-text-blue: rgb(9, 78, 121);\n  --color-text-purple: rgb(82, 35, 114);\n  --color-text-pink: rgb(76, 35, 55);\n  --color-text-red: rgb(119, 19, 39);\n  --color-bg-default: #f3eee8;\n  --color-bg-gray: rgba(234, 234, 235, 0.93);\n  --color-bg-brown: rgb(250, 239, 229);\n  --color-bg-orange: rgb(255, 236, 228);\n  --color-bg-yellow: rgb(254, 246, 231);\n  --color-bg-green: rgb(233, 244, 231);\n  --color-bg-blue: rgb(231, 242, 252);\n  --color-bg-purple: rgb(246, 237, 252);\n  --color-bg-pink: rgb(255, 242, 248);\n  --color-bg-red: rgb(255, 234, 243);\n\n  --color-bg-gray-light: rgb(246, 246, 246);\n  --color-bg-brown-light: rgb(252, 245, 239);\n  --color-bg-orange-light: rgb(255, 236, 228);\n  --color-bg-yellow-light: rgb(254, 246, 231);\n  --color-bg-green-light: rgb(243, 249, 242);\n  --color-bg-blue-light: rgb(231, 242, 252);\n  --color-bg-purple-light: rgb(250, 244, 253);\n  --color-bg-pink-light: rgb(255, 242, 248);\n  --color-bg-red-light: rgb(255, 243, 242);\n\n  --color-ui-hover-bg: rgba(0, 0, 0, 0.04);\n  --color-ui-hover-bg-light: rgba(0, 0, 0, 0.04);\n  --color-card-bg: #f3eee8;\n  --color-accent-bg: rgb(46, 170, 220);\n  --color-border-default: rgba(0, 0, 0, 0.04);\n  --color-border-dark: rgb(0, 0, 0);\n\n  --column-spacing: 46px;\n  --collection-card-cover-size-small: 172px;\n  --collection-card-cover-size-medium: 260px;\n  --collection-card-cover-size-large: 320px;\n}\n\n.notion {\n  font-size: var(--notion-base);\n  line-height: calc(var(--notion-base) * 1.5);\n  color: rgb(55, 53, 47);\n  caret-color: rgb(55, 53, 47);\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Helvetica,\n    \"Apple Color Emoji\", Arial, sans-serif, \"Segoe UI Emoji\", \"Segoe UI Symbol\";\n}\n\n.notion > * {\n  padding: var(--notion-3px) 0px;\n}\n\n.notion * {\n  /* margin-block-start: 0px; */\n  /* margin-block-start: calc(var(--notion-base) * 0.1875); */\n  margin-block-start: calc(var(--notion-base) * 0.26);\n  margin-block-end: 0px;\n}\n\n.notion-checked {\n  color: var(--color-text-checked);\n}\n.notion-red {\n  color: var(--color-text-red);\n}\n.notion-pink {\n  color: var(--color-text-pink);\n}\n.notion-blue {\n  color: var(--color-text-blue);\n}\n.notion-purple {\n  color: var(--color-text-purple);\n}\n.notion-teal {\n  color: var(--color-text-teal);\n}\n.notion-yellow {\n  color: var(--color-text-yellow);\n}\n.notion-orange {\n  color: var(--color-text-orange);\n}\n.notion-brown {\n  color: var(--color-text-brown);\n}\n.notion-gray {\n  color: var(--color-text-gray);\n}\n.notion-red_background {\n  background-color: var(--color-bg-red);\n}\n.notion-green_background {\n  background-color: var(--color-bg-green);\n  /* background-color: rgb(244, 223, 235); */\n}\n.notion-pink_background {\n  background-color: var(--color-bg-pink);\n  /* background-color: rgb(244, 223, 235); */\n}\n.notion-blue_background {\n  background-color: var(--color-bg-blue);\n}\n.notion-purple_background {\n  background-color: var(--color-bg-purple);\n}\n.notion-teal_background {\n  background-color: var(--color-bg-teal);\n}\n.notion-yellow_background {\n  background-color: var(--color-bg-yellow);\n}\n.notion-orange_background {\n  background-color: var(--color-bg-orange);\n}\n.notion-brown_background {\n  background-color: var(--color-bg-brown);\n}\n.notion-gray_background {\n  background-color: var(--color-bg-gray);\n}\n.notion-red_background_co {\n  background-color: var(--color-bg-red-light);\n}\n.notion-pink_background_co {\n  background-color: var(--color-bg-pink-light);\n}\n.notion-blue_background_co {\n  background-color: var(--color-bg-blue-light);\n}\n.notion-purple_background_co {\n  background-color: var(--color-bg-purple-light);\n}\n.notion-teal_background_co {\n  background-color: var(--color-bg-teal-light);\n}\n.notion-yellow_background_co {\n  background-color: var(--color-bg-yellow-light);\n}\n.notion-orange_background_co {\n  background-color: var(--color-bg-orange-light);\n}\n.notion-brown_background_co {\n  background-color: var(--color-bg-brown-light);\n}\n.notion-gray_background_co {\n  background-color: var(--color-bg-gray-light);\n}\n\n.notion b {\n  font-weight: var(--notion-bold);\n}\n\n.notion-title {\n  line-height: var(--notion-title);\n  font-weight: var(--notion-bold);\n  line-height: calc(var(--notion-title) * 0.75);\n  line-height: calc(var(--notion-title) * 0.25);\n}\n\n/* .notion-h1,\n.notion-h2,\n.notion-h3 {\n  font-weight: var(--notion-bold);\n  line-height: calc(var(--notion-base) * 1.5);\n  padding: var(--notion-2px);\n} */\n\n.notion-h1 {\n  font-size: var(--notion-h1);\n  font-weight: var(--notion-h1-weight);\n  line-height: var(--notion-h1-line-height);\n  margin-top: var(--notion-h1-margin-top);\n  padding-bottom: var(--notion-h1-padding-bottom);\n}\n.notion-h1:first-of-type {\n  margin-top: 0;\n}\n.notion-h2 {\n  font-size: var(--notion-h2);\n  font-weight: var(--notion-h2-weight);\n  line-height: var(--notion-h2-line-height);\n  margin-top: var(--notion-h2-margin-top);\n  padding-bottom: var(--notion-h2-padding-bottom);\n}\n.notion-h3 {\n  font-size: var(--notion-h3);\n  font-weight: var(--notion-h3-weight);\n  line-height: var(--notion-h3-line-height);\n  margin-top: var(--notion-h3-margin-top);\n  padding-bottom: var(--notion-h3-padding-bottom);\n}\n.notion-page-cover {\n  display: block;\n  object-fit: cover;\n  width: 100%;\n  height: 30vh;\n  padding: 0;\n}\n\n.notion-page {\n  margin: 0 auto;\n  max-width: var(--notion-page-width);\n}\n\n.notion-page-offset {\n  margin-top: 96px;\n}\n\nspan.notion-page-icon-cover {\n  height: 78px;\n  width: 78px;\n  font-size: 78px;\n  display: inline-block;\n  line-height: 1.1;\n  margin-left: 0px;\n}\n\nspan.notion-page-icon-offset {\n  margin-top: -42px;\n}\n\nimg.notion-page-icon-cover {\n  border-radius: 3px;\n  width: 124px;\n  height: 124px;\n  margin: 8px;\n}\n\nimg.notion-page-icon-offset {\n  margin-top: -80px;\n}\n\n.notion-full-width {\n  padding: 0 40px;\n  max-width: 100%;\n}\n\n.notion-small-text {\n  font-size: var(--notion-small);\n}\n.notion-quote {\n  white-space: pre-wrap;\n  word-break: break-word;\n  border-left: 3px solid currentcolor;\n  padding: 0.2em 0.9em;\n  margin: 0;\n  font-size: 1.2em;\n}\n.notion-hr {\n  margin: 6px 0px;\n  padding: 0;\n  /* border-top: none; */\n  border-color: rgba(55, 53, 47, 0.09);\n}\n.notion-link {\n  color: inherit;\n  word-break: break-all;\n  text-decoration: underline;\n  text-decoration-color: inherit;\n\n  overflow-wrap: break-word;\n  word-wrap: break-word;\n  -ms-word-break: break-all;\n  word-break: break-all;\n  word-break: break-word;\n  -ms-hyphens: auto;\n  -moz-hyphens: auto;\n  -webkit-hyphens: auto;\n  hyphens: auto;\n}\n.notion-blank {\n  height: 1rem;\n  padding: 4px 0;\n}\n.notion-page-link {\n  display: flex;\n  color: rgb(55, 53, 47);\n  text-decoration: none;\n  height: 30px;\n  margin: 1px 0px;\n  transition: background 120ms ease-in 0s;\n}\n.notion-page-link:hover {\n  background: rgba(55, 53, 47, 0.08);\n}\n\n.notion-page-icon {\n  margin-right: 4px;\n  margin-top: 2px;\n  margin-left: 2px;\n}\nimg.notion-page-icon {\n  display: block;\n  object-fit: cover;\n  border-radius: 3px;\n  width: 20px;\n  height: 20px;\n}\n\n.notion-page-text {\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  font-weight: 500;\n  line-height: 1.3;\n  border-bottom: 1px solid rgba(55, 53, 47, 0.16);\n  margin: 4px 0px;\n}\n\n.notion-inline-code {\n  color: #eb5757;\n  padding: 0.2em 0.4em;\n  background: rgba(135, 131, 120, 0.15);\n  border-radius: 3px;\n  font-size: 85%;\n  font-family: \"SFMono-Regular\", Consolas, \"Liberation Mono\", Menlo, Courier,\n    monospace;\n}\n\n.notion-list {\n  margin: 0;\n  margin-block-start: 0.6em;\n  margin-block-end: 0.6em;\n}\n\n.notion-list-disc {\n  list-style-type: disc;\n  padding-inline-start: var(--notion-1d4em);\n  margin-top: 0px;\n  margin-bottom: 0px;\n}\n.notion-list-numbered {\n  list-style-type: decimal;\n  padding-inline-start: var(--notion-1d6em);\n  margin-top: 0px;\n  margin-bottom: 0px;\n}\n\n.notion-list-disc li {\n  padding-left: 0.1em;\n}\n\n.notion-list-todo {\n  list-style-type: none;\n  padding-inline-start: 0.8em;\n  margin-top: 0px;\n  margin-bottom: 0px;\n}\n.notion-list-todo li {\n  padding-left: 0.1em;\n}\n.notion-list-todo .notion-text {\n  padding-left: 0.75em;\n}\n\n.notion-list-numbered li {\n  padding-left: 0.1em;\n}\n\n.notion-list li {\n  /* padding: 3px 0px; */\n  /* white-space: pre-wrap; */\n}\n\n.notion-asset-wrapper {\n  margin: 2px 0 0.5rem;\n  max-width: 100%;\n}\n\n.notion-asset-wrapper iframe {\n  border: none;\n}\n\n.notion-text {\n  /* white-space: pre-wrap; */\n  caret-color: rgb(55, 53, 47);\n  padding: var(--notion-p-padding);\n}\n.notion-block {\n  padding: 3px 2px;\n}\n\n.notion-code {\n  padding: 30px 16px 30px 20px;\n  margin: 4px 0;\n  tab-size: 2;\n  font-size: 85%;\n  display: block;\n  background: rgb(247, 246, 243);\n  font-family: SFMono-Regular, Consolas, \"Liberation Mono\", Menlo, Courier,\n    monospace;\n  box-sizing: border-box;\n  overflow-x: scroll;\n}\n\n.notion-column {\n  padding-top: 12px;\n  padding-bottom: 12px;\n}\n\n.notion-column > *:first-child {\n  margin-top: 0;\n  margin-left: 0;\n  margin-right: 0;\n}\n\n.notion-column > *:last-child {\n  margin-left: 0;\n  margin-right: 0;\n  margin-bottom: 0;\n}\n\n.notion-row {\n  display: flex;\n  overflow: hidden;\n}\n\n.notion-bookmark {\n  margin: 4px 0;\n  width: 100%;\n  box-sizing: border-box;\n  text-decoration: none;\n  border: 1px solid rgba(55, 53, 47, 0.16);\n  border-radius: 3px;\n  display: flex;\n  overflow: hidden;\n  user-select: none;\n}\n\n.notion-bookmark > div:first-child {\n  flex: 4 1 180px;\n  padding: 12px 14px 14px;\n  overflow: hidden;\n  text-align: left;\n  color: rgb(55, 53, 47);\n}\n\n.notion-bookmark-title {\n  font-size: var(--notion-small);\n  line-height: calc(var(--notion-small) * 1.4);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  min-height: 24px;\n  margin-bottom: 2px;\n}\n\n.notion-bookmark-description {\n  font-size: var(--notion-smaller);\n  line-height: calc(var(--notion-smaller) * 1.6);\n  opacity: 0.6;\n  height: 32px;\n  overflow: hidden;\n}\n\n.notion-bookmark-link {\n  display: flex;\n  margin-top: 6px;\n}\n\n.notion-bookmark-link > img {\n  width: var(--notion-base);\n  height: var(--notion-base);\n  min-width: var(--notion-base);\n  margin-right: 6px;\n}\n\n.notion-bookmark-link > div {\n  font-size: var(--notion-small);\n  line-height: calc(var(--notion-small) * 1.4);\n  color: rgb(55, 53, 47);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.notion-bookmark-image {\n  flex: 1 1 180px;\n  position: relative;\n}\n\n.notion-bookmark-image img {\n  object-fit: cover;\n  width: 100%;\n  height: 100%;\n  position: absolute;\n}\n\n.notion-column .notion-bookmark-image {\n  display: none;\n}\n\n@media (max-width: 640px) {\n  .notion-bookmark-image {\n    display: none;\n  }\n\n  .notion-row {\n    flex-direction: column;\n  }\n\n  /* .notion-row > *,\n    .notion-column > * {\n        width: 100% !important;\n    } */\n}\n\n.notion-spacer:last-child {\n  display: none;\n}\n\n.notion-image-inset {\n  /*position: absolute;*/\n  left: 0;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  width: 100%;\n  height: 100%;\n}\n\n.notion-image-caption {\n  padding: 6px 0px;\n  /* white-space: pre-wrap; */\n  word-break: break-word;\n  caret-color: rgb(55, 53, 47);\n  font-size: 14px;\n  line-height: 1.4;\n  color: rgba(55, 53, 47, 0.6);\n}\n\n.notion-callout {\n  padding: var(--notion-base) var(--notion-base) var(--notion-base) var(--notion-small);\n  display: inline-flex;\n  /* display: block; prevents image blowouts, but doesn't support emojis */\n  width: 100%;\n  border-radius: 3px;\n  border-width: 1px;\n  align-items: center;\n  box-sizing: border-box;\n  margin: 4px 0;\n}\n.notion-callout.billboard {\n  display: block;\n}\n\n.notion-callout-text {\n  margin-left: 8px;\n}\n\n.notion-toggle {\n  /* padding: var(--notion-3px) 0px; */\n  padding: var(--notion-3px) var(--notion-2px);\n  padding-inline-start: var(--notion-8px);\n}\n.notion-toggle-summary {\n  padding-left: var(--notion-6px);\n}\n.notion-toggle summary {\n  white-space: break-spaces !important;\n  cursor: pointer;\n}\n.notion-toggle > div {\n  margin-left: 1.1em;\n}\n\n.notion-list-item {\n  display: flex;\n}\n.notion-list-icon-container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n.notion-list-icon {\n  /* margin-bottom: 2px; */\n  margin-right: 9px;\n}\n\n.notion-checkbox {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 1em;\n  height: 1em;\n}\n.notion-checkbox {\n  /* border: 2px solid var(--color-border-dark); */\n}\n.notion-checkbox.checked svg {\n  width: 0.72em;\n  fill: var(--color-border-dark);\n}\n.notion-checkbox.checked {\n  border-color: var(--color-accent-bg);\n  background: var(--color-accent-bg);\n}\n.notion-checkbox.checked svg {\n  width: 0.72em;\n  fill: #fff;\n}\n\n.notion-collection-list {\n  border-top: 1px solid var(--color-border-default);\n}\n\n.notion-collection-list .notion-collection-item {\n  display: flex;\n  margin: 4px 3px;\n  padding: 4px;\n  border-radius: 4px;\n}\n.notion-collection-list .notion-collection-item:hover {\n  background: var(--color-ui-hover-bg-light);\n}\n\n.notion-collection-list .notion-collection-props {\n  flex: 1;\n  display: flex;\n  justify-content: flex-end;\n  gap: 8px;\n}\n";
styleInject(css_248z$3);

const search = (block, blocks) => blocks.find(el => el.id == block);

const isTopLevel = (block, blocks) =>
    block.type !== search(block.parent_id, blocks).type;

const toNotionImageUrl = (url, blockId, siteSrc="https://phagedirectory.notion.site") => {
  return `${siteSrc || "https://notion.so"}${
        url.startsWith('/image')
            ? url
            : `/image/${encodeURIComponent(url)}?table=block&id=${blockId}`
    }`
};

const getTextContent = block => {
    const text =
        block.properties && block.properties.title
            ? block.properties.title
            : null;
    return text ? text.reduce((prev, current) => prev + current[0], '') : ''
};

const groupBlockContent = blocks => {
    const output = [];

    let lastType;
    let index = -1;

    blocks.forEach(block => {
        if (block.content) {
            block.content.forEach(blockId => {
                const subblock = search(blockId, blocks);
                if (subblock) {
                    if (subblock.type && subblock.type !== lastType) {
                        index++;
                        lastType = subblock.type;
                        output[index] = [];
                    }
                    output[index].push(subblock.id);
                }
            });
            lastType = undefined;
        }
    });
    return output
};

const getListNumber = (block, blocks) => {
    const groups = groupBlockContent(blocks);
    const group = groups.find(g => g.includes(block.id));

    if (!group) return
    return group.indexOf(block.id) + 1
};

const loadTwitter = () => {
    var id = 'twitter-wjs';

    // if script was already set, don't load it again.
    if (document.getElementById(id)) return

    var s = document.createElement('script');
    s.id = id;
    s.type = 'text/javascript';
    s.async = true;
    s.src = '//platform.twitter.com/widgets.js';
    document.getElementsByTagName('head')[0].appendChild(s);
};

const isImage = attachment => {
    let name = attachment.name;
    return (
        name.includes('.png') ||
        name.includes('.jpg') ||
        name.includes('.jpeg') ||
        name.includes('.tiff') ||
        name.includes('.gif') ||
        name.includes('.bmp') ||
        name.includes('.webp')
    )
};

/* src/subcomponents/FormattedText.svelte generated by Svelte v3.49.0 */

// (8:0) {:else}
function create_else_block$i(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			attr(div, "class", "notion-blank");
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (6:55) 
function create_if_block_1$i(ctx) {
	let html_tag;
	let raw_value = formatText(/*block*/ ctx[0].properties.caption) + "";
	let html_anchor;

	return {
		c() {
			html_tag = new HtmlTag(false);
			html_anchor = empty();
			html_tag.a = html_anchor;
		},
		m(target, anchor) {
			html_tag.m(raw_value, target, anchor);
			insert(target, html_anchor, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*block*/ 1 && raw_value !== (raw_value = formatText(/*block*/ ctx[0].properties.caption) + "")) html_tag.p(raw_value);
		},
		d(detaching) {
			if (detaching) detach(html_anchor);
			if (detaching) html_tag.d();
		}
	};
}

// (4:5) {#if block.properties && block.properties.title}
function create_if_block$m(ctx) {
	let html_tag;
	let raw_value = formatText(/*block*/ ctx[0].properties.title) + "";
	let html_anchor;

	return {
		c() {
			html_tag = new HtmlTag(false);
			html_anchor = empty();
			html_tag.a = html_anchor;
		},
		m(target, anchor) {
			html_tag.m(raw_value, target, anchor);
			insert(target, html_anchor, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*block*/ 1 && raw_value !== (raw_value = formatText(/*block*/ ctx[0].properties.title) + "")) html_tag.p(raw_value);
		},
		d(detaching) {
			if (detaching) detach(html_anchor);
			if (detaching) html_tag.d();
		}
	};
}

function create_fragment$v(ctx) {
	let if_block0_anchor;
	let if_block1_anchor;
	let current;
	let if_block0 = false ;

	function select_block_type(ctx, dirty) {
		if (/*block*/ ctx[0].properties && /*block*/ ctx[0].properties.title) return create_if_block$m;
		if (/*block*/ ctx[0].properties && /*block*/ ctx[0].properties.caption) return create_if_block_1$i;
		return create_else_block$i;
	}

	let current_block_type = select_block_type(ctx);
	let if_block1 = current_block_type(ctx);

	return {
		c() {
			if_block0_anchor = empty();
			if_block1.c();
			if_block1_anchor = empty();
		},
		m(target, anchor) {
			insert(target, if_block0_anchor, anchor);
			if_block1.m(target, anchor);
			insert(target, if_block1_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {

			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
				if_block1.p(ctx, dirty);
			} else {
				if_block1.d(1);
				if_block1 = current_block_type(ctx);

				if (if_block1) {
					if_block1.c();
					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block0);
			current = true;
		},
		o(local) {
			transition_out(if_block0);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(if_block0_anchor);
			if_block1.d(detaching);
			if (detaching) detach(if_block1_anchor);
		}
	};
}

const formatText = property => {
	if (property && property.length > 0) return property.map(text => text[1]
	? text[1].reduceRight(
			(av, cv) => ({
				i: `<em>${av}</em>`,
				c: `<code class="notion-inline-code">${av}</code>`,
				s: `<s>${av}</s>`,
				b: `<b>${av}</b>`,
				h: `<span class="notion-${cv[1]}">${av}</span>`,
				a: `<a class="notion-link" href="${cv[1]}">${av}</a>`
			})[cv[0]],
			text[0]
		)
	: text[0]).join('');
};

function instance$v($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { block = {} } = $$props;
	let { blocks = [] } = $$props;
	let { api = null } = $$props;

	$$self.$$set = $$props => {
		if ('block' in $$props) $$invalidate(0, block = $$props.block);
		if ('blocks' in $$props) $$invalidate(1, blocks = $$props.blocks);
		if ('api' in $$props) $$invalidate(2, api = $$props.api);
		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
	};

	return [block, blocks, api, $$scope, slots];
}

class FormattedText extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$v, create_fragment$v, safe_not_equal, { block: 0, blocks: 1, api: 2 });
	}
}

/* src/components/Bookmark.svelte generated by Svelte v3.49.0 */

// (4:0) {#if block.format}
function create_if_block$l(ctx) {
	let div6;
	let a;
	let div4;
	let div0;
	let formattedtext;
	let t0;
	let div1;
	let t1_value = formatText(/*block*/ ctx[0].properties.description) + "";
	let t1;
	let t2;
	let div3;
	let img0;
	let img0_src_value;
	let img0_alt_value;
	let t3;
	let div2;
	let t4_value = formatText(/*block*/ ctx[0].properties.link) + "";
	let t4;
	let t5;
	let div5;
	let img1;
	let img1_src_value;
	let img1_alt_value;
	let a_class_value;
	let a_href_value;
	let div6_id_value;
	let current;
	formattedtext = new FormattedText({ props: { block: /*block*/ ctx[0] } });

	return {
		c() {
			div6 = element("div");
			a = element("a");
			div4 = element("div");
			div0 = element("div");
			create_component(formattedtext.$$.fragment);
			t0 = space();
			div1 = element("div");
			t1 = text(t1_value);
			t2 = space();
			div3 = element("div");
			img0 = element("img");
			t3 = space();
			div2 = element("div");
			t4 = text(t4_value);
			t5 = space();
			div5 = element("div");
			img1 = element("img");
			attr(div0, "class", "notion-bookmark-title");
			attr(div1, "class", "notion-bookmark-description");
			if (!src_url_equal(img0.src, img0_src_value = toNotionImageUrl(/*block*/ ctx[0].format.bookmark_icon, /*block*/ ctx[0].id, /*siteSrc*/ ctx[1]))) attr(img0, "src", img0_src_value);
			attr(img0, "alt", img0_alt_value = getTextContent(/*block*/ ctx[0]));
			attr(div3, "class", "notion-bookmark-link");
			if (!src_url_equal(img1.src, img1_src_value = toNotionImageUrl(/*block*/ ctx[0].format.bookmark_cover, /*block*/ ctx[0].id, /*siteSrc*/ ctx[1]))) attr(img1, "src", img1_src_value);
			attr(img1, "alt", img1_alt_value = getTextContent(/*block*/ ctx[0]));
			attr(div5, "class", "notion-bookmark-image");
			attr(a, "target", "_blank");
			attr(a, "rel", "noopener noreferrer");
			attr(a, "class", a_class_value = `notion-bookmark ${/*block*/ ctx[0].format.block_color && 'notion-' + /*block*/ ctx[0].format.block_color}`);
			attr(a, "href", a_href_value = /*block*/ ctx[0].properties.link[0][0]);
			attr(div6, "id", div6_id_value = `_block-${/*block*/ ctx[0].id}`);
			attr(div6, "class", "notion-row");
		},
		m(target, anchor) {
			insert(target, div6, anchor);
			append(div6, a);
			append(a, div4);
			append(div4, div0);
			mount_component(formattedtext, div0, null);
			append(div4, t0);
			append(div4, div1);
			append(div1, t1);
			append(div4, t2);
			append(div4, div3);
			append(div3, img0);
			append(div3, t3);
			append(div3, div2);
			append(div2, t4);
			append(a, t5);
			append(a, div5);
			append(div5, img1);
			current = true;
		},
		p(ctx, dirty) {
			const formattedtext_changes = {};
			if (dirty & /*block*/ 1) formattedtext_changes.block = /*block*/ ctx[0];
			formattedtext.$set(formattedtext_changes);
			if ((!current || dirty & /*block*/ 1) && t1_value !== (t1_value = formatText(/*block*/ ctx[0].properties.description) + "")) set_data(t1, t1_value);

			if (!current || dirty & /*block, siteSrc*/ 3 && !src_url_equal(img0.src, img0_src_value = toNotionImageUrl(/*block*/ ctx[0].format.bookmark_icon, /*block*/ ctx[0].id, /*siteSrc*/ ctx[1]))) {
				attr(img0, "src", img0_src_value);
			}

			if (!current || dirty & /*block*/ 1 && img0_alt_value !== (img0_alt_value = getTextContent(/*block*/ ctx[0]))) {
				attr(img0, "alt", img0_alt_value);
			}

			if ((!current || dirty & /*block*/ 1) && t4_value !== (t4_value = formatText(/*block*/ ctx[0].properties.link) + "")) set_data(t4, t4_value);

			if (!current || dirty & /*block, siteSrc*/ 3 && !src_url_equal(img1.src, img1_src_value = toNotionImageUrl(/*block*/ ctx[0].format.bookmark_cover, /*block*/ ctx[0].id, /*siteSrc*/ ctx[1]))) {
				attr(img1, "src", img1_src_value);
			}

			if (!current || dirty & /*block*/ 1 && img1_alt_value !== (img1_alt_value = getTextContent(/*block*/ ctx[0]))) {
				attr(img1, "alt", img1_alt_value);
			}

			if (!current || dirty & /*block*/ 1 && a_class_value !== (a_class_value = `notion-bookmark ${/*block*/ ctx[0].format.block_color && 'notion-' + /*block*/ ctx[0].format.block_color}`)) {
				attr(a, "class", a_class_value);
			}

			if (!current || dirty & /*block*/ 1 && a_href_value !== (a_href_value = /*block*/ ctx[0].properties.link[0][0])) {
				attr(a, "href", a_href_value);
			}

			if (!current || dirty & /*block*/ 1 && div6_id_value !== (div6_id_value = `_block-${/*block*/ ctx[0].id}`)) {
				attr(div6, "id", div6_id_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(formattedtext.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formattedtext.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div6);
			destroy_component(formattedtext);
		}
	};
}

function create_fragment$u(ctx) {
	let t;
	let if_block1_anchor;
	let current;
	let if_block0 = false ;
	let if_block1 = /*block*/ ctx[0].format && create_if_block$l(ctx);

	return {
		c() {
			t = space();
			if (if_block1) if_block1.c();
			if_block1_anchor = empty();
		},
		m(target, anchor) {
			insert(target, t, anchor);
			if (if_block1) if_block1.m(target, anchor);
			insert(target, if_block1_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {

			if (/*block*/ ctx[0].format) {
				if (if_block1) {
					if_block1.p(ctx, dirty);

					if (dirty & /*block*/ 1) {
						transition_in(if_block1, 1);
					}
				} else {
					if_block1 = create_if_block$l(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block1);
			current = true;
		},
		o(local) {
			transition_out(if_block0);
			transition_out(if_block1);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(t);
			if (if_block1) if_block1.d(detaching);
			if (detaching) detach(if_block1_anchor);
		}
	};
}

function instance$u($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { block = {} } = $$props;
	let { blocks = [] } = $$props;
	let { fullPage = false } = $$props;
	let { api } = $$props;
	let { siteSrc } = $$props;

	$$self.$$set = $$props => {
		if ('block' in $$props) $$invalidate(0, block = $$props.block);
		if ('blocks' in $$props) $$invalidate(2, blocks = $$props.blocks);
		if ('fullPage' in $$props) $$invalidate(3, fullPage = $$props.fullPage);
		if ('api' in $$props) $$invalidate(4, api = $$props.api);
		if ('siteSrc' in $$props) $$invalidate(1, siteSrc = $$props.siteSrc);
		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
	};

	return [block, siteSrc, blocks, fullPage, api, $$scope, slots];
}

class Bookmark extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$u, create_fragment$u, safe_not_equal, {
			block: 0,
			blocks: 2,
			fullPage: 3,
			api: 4,
			siteSrc: 1
		});
	}
}

/* src/components/BulletedList.svelte generated by Svelte v3.49.0 */

function create_else_block$h(ctx) {
	let t;
	let if_block1_anchor;
	let current;
	let if_block0 = /*block*/ ctx[0].properties && create_if_block_4$4(ctx);
	let if_block1 = /*block*/ ctx[0].content && create_if_block_3$6(ctx);

	return {
		c() {
			if (if_block0) if_block0.c();
			t = space();
			if (if_block1) if_block1.c();
			if_block1_anchor = empty();
		},
		m(target, anchor) {
			if (if_block0) if_block0.m(target, anchor);
			insert(target, t, anchor);
			if (if_block1) if_block1.m(target, anchor);
			insert(target, if_block1_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if (/*block*/ ctx[0].properties) {
				if (if_block0) {
					if_block0.p(ctx, dirty);

					if (dirty & /*block*/ 1) {
						transition_in(if_block0, 1);
					}
				} else {
					if_block0 = create_if_block_4$4(ctx);
					if_block0.c();
					transition_in(if_block0, 1);
					if_block0.m(t.parentNode, t);
				}
			} else if (if_block0) {
				group_outros();

				transition_out(if_block0, 1, 1, () => {
					if_block0 = null;
				});

				check_outros();
			}

			if (/*block*/ ctx[0].content) {
				if (if_block1) {
					if_block1.p(ctx, dirty);

					if (dirty & /*block*/ 1) {
						transition_in(if_block1, 1);
					}
				} else {
					if_block1 = create_if_block_3$6(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block1);
			current = true;
		},
		o(local) {
			transition_out(if_block0);
			transition_out(if_block1);
			current = false;
		},
		d(detaching) {
			if (if_block0) if_block0.d(detaching);
			if (detaching) detach(t);
			if (if_block1) if_block1.d(detaching);
			if (detaching) detach(if_block1_anchor);
		}
	};
}

// (1:0) {#if isTopLevel(block, blocks)}
function create_if_block$k(ctx) {
	let ul;
	let t;
	let ul_id_value;
	let current;
	let if_block0 = /*block*/ ctx[0].properties && create_if_block_2$d(ctx);
	let if_block1 = /*block*/ ctx[0].content && create_if_block_1$h(ctx);

	return {
		c() {
			ul = element("ul");
			if (if_block0) if_block0.c();
			t = space();
			if (if_block1) if_block1.c();
			attr(ul, "id", ul_id_value = `_block-${/*block*/ ctx[0].id}`);
			attr(ul, "class", "notion-list notion-list-disc");
		},
		m(target, anchor) {
			insert(target, ul, anchor);
			if (if_block0) if_block0.m(ul, null);
			append(ul, t);
			if (if_block1) if_block1.m(ul, null);
			current = true;
		},
		p(ctx, dirty) {
			if (/*block*/ ctx[0].properties) {
				if (if_block0) {
					if_block0.p(ctx, dirty);

					if (dirty & /*block*/ 1) {
						transition_in(if_block0, 1);
					}
				} else {
					if_block0 = create_if_block_2$d(ctx);
					if_block0.c();
					transition_in(if_block0, 1);
					if_block0.m(ul, t);
				}
			} else if (if_block0) {
				group_outros();

				transition_out(if_block0, 1, 1, () => {
					if_block0 = null;
				});

				check_outros();
			}

			if (/*block*/ ctx[0].content) {
				if (if_block1) {
					if_block1.p(ctx, dirty);

					if (dirty & /*block*/ 1) {
						transition_in(if_block1, 1);
					}
				} else {
					if_block1 = create_if_block_1$h(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(ul, null);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}

			if (!current || dirty & /*block*/ 1 && ul_id_value !== (ul_id_value = `_block-${/*block*/ ctx[0].id}`)) {
				attr(ul, "id", ul_id_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block1);
			current = true;
		},
		o(local) {
			transition_out(if_block0);
			transition_out(if_block1);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(ul);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
		}
	};
}

// (15:4) {#if block.properties}
function create_if_block_4$4(ctx) {
	let li;
	let formattedtext;
	let li_id_value;
	let current;
	formattedtext = new FormattedText({ props: { block: /*block*/ ctx[0] } });

	return {
		c() {
			li = element("li");
			create_component(formattedtext.$$.fragment);
			attr(li, "id", li_id_value = `_block-${/*block*/ ctx[0].id}`);
		},
		m(target, anchor) {
			insert(target, li, anchor);
			mount_component(formattedtext, li, null);
			current = true;
		},
		p(ctx, dirty) {
			const formattedtext_changes = {};
			if (dirty & /*block*/ 1) formattedtext_changes.block = /*block*/ ctx[0];
			formattedtext.$set(formattedtext_changes);

			if (!current || dirty & /*block*/ 1 && li_id_value !== (li_id_value = `_block-${/*block*/ ctx[0].id}`)) {
				attr(li, "id", li_id_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(formattedtext.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formattedtext.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(li);
			destroy_component(formattedtext);
		}
	};
}

// (20:4) {#if block.content}
function create_if_block_3$6(ctx) {
	let ul;
	let ul_id_value;
	let current;
	const default_slot_template = /*#slots*/ ctx[5].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

	return {
		c() {
			ul = element("ul");
			if (default_slot) default_slot.c();
			attr(ul, "id", ul_id_value = `_block-${/*block*/ ctx[0].id}`);
			attr(ul, "class", "notion-list notion-list-disc");
		},
		m(target, anchor) {
			insert(target, ul, anchor);

			if (default_slot) {
				default_slot.m(ul, null);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[4],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
						null
					);
				}
			}

			if (!current || dirty & /*block*/ 1 && ul_id_value !== (ul_id_value = `_block-${/*block*/ ctx[0].id}`)) {
				attr(ul, "id", ul_id_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(ul);
			if (default_slot) default_slot.d(detaching);
		}
	};
}

// (3:8) {#if block.properties}
function create_if_block_2$d(ctx) {
	let li;
	let formattedtext;
	let current;
	formattedtext = new FormattedText({ props: { block: /*block*/ ctx[0] } });

	return {
		c() {
			li = element("li");
			create_component(formattedtext.$$.fragment);
		},
		m(target, anchor) {
			insert(target, li, anchor);
			mount_component(formattedtext, li, null);
			current = true;
		},
		p(ctx, dirty) {
			const formattedtext_changes = {};
			if (dirty & /*block*/ 1) formattedtext_changes.block = /*block*/ ctx[0];
			formattedtext.$set(formattedtext_changes);
		},
		i(local) {
			if (current) return;
			transition_in(formattedtext.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formattedtext.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(li);
			destroy_component(formattedtext);
		}
	};
}

// (8:8) {#if block.content}
function create_if_block_1$h(ctx) {
	let ul;
	let current;
	const default_slot_template = /*#slots*/ ctx[5].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

	return {
		c() {
			ul = element("ul");
			if (default_slot) default_slot.c();
			attr(ul, "class", "notion-list notion-list-disc");
		},
		m(target, anchor) {
			insert(target, ul, anchor);

			if (default_slot) {
				default_slot.m(ul, null);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[4],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
						null
					);
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(ul);
			if (default_slot) default_slot.d(detaching);
		}
	};
}

function create_fragment$t(ctx) {
	let show_if;
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block$k, create_else_block$h];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (dirty & /*block, blocks*/ 3) show_if = null;
		if (show_if == null) show_if = !!isTopLevel(/*block*/ ctx[0], /*blocks*/ ctx[1]);
		if (show_if) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx, -1);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx, dirty);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				} else {
					if_block.p(ctx, dirty);
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$t($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { block = {} } = $$props;
	let { blocks = [] } = $$props;
	let { fullPage = false } = $$props;
	let { api = null } = $$props;

	$$self.$$set = $$props => {
		if ('block' in $$props) $$invalidate(0, block = $$props.block);
		if ('blocks' in $$props) $$invalidate(1, blocks = $$props.blocks);
		if ('fullPage' in $$props) $$invalidate(2, fullPage = $$props.fullPage);
		if ('api' in $$props) $$invalidate(3, api = $$props.api);
		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
	};

	return [block, blocks, fullPage, api, $$scope, slots];
}

class BulletedList extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$t, create_fragment$t, safe_not_equal, { block: 0, blocks: 1, fullPage: 2, api: 3 });
	}
}

/* src/subcomponents/PageIcon.svelte generated by Svelte v3.49.0 */

function create_if_block$j(ctx) {
	let if_block_anchor;

	function select_block_type(ctx, dirty) {
		if (/*icon*/ ctx[3] && /*icon*/ ctx[3].includes('http')) return create_if_block_1$g;
		return create_else_block$g;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, dirty) {
			if_block.p(ctx, dirty);
		},
		d(detaching) {
			if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

// (7:4) {:else}
function create_else_block$g(ctx) {
	let span;
	let t;
	let span_class_value;

	return {
		c() {
			span = element("span");
			t = text(/*icon*/ ctx[3]);

			attr(span, "class", span_class_value = /*big*/ ctx[1]
			? 'notion-page-icon-cover'
			: 'notion-page-icon');

			attr(span, "aria-label", /*icon*/ ctx[3]);
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t);
		},
		p(ctx, dirty) {
			if (dirty & /*big*/ 2 && span_class_value !== (span_class_value = /*big*/ ctx[1]
			? 'notion-page-icon-cover'
			: 'notion-page-icon')) {
				attr(span, "class", span_class_value);
			}
		},
		d(detaching) {
			if (detaching) detach(span);
		}
	};
}

// (2:4) {#if icon && icon.includes('http')}
function create_if_block_1$g(ctx) {
	let img;
	let img_class_value;
	let img_src_value;

	return {
		c() {
			img = element("img");

			attr(img, "class", img_class_value = /*big*/ ctx[1]
			? 'notion-page-icon-cover'
			: 'notion-page-icon');

			if (!src_url_equal(img.src, img_src_value = toNotionImageUrl(/*icon*/ ctx[3], /*block*/ ctx[0].id))) attr(img, "src", img_src_value);

			attr(img, "alt", /*title*/ ctx[4]
			? getTextContent(/*title*/ ctx[4])
			: 'Icon');
		},
		m(target, anchor) {
			insert(target, img, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*big*/ 2 && img_class_value !== (img_class_value = /*big*/ ctx[1]
			? 'notion-page-icon-cover'
			: 'notion-page-icon')) {
				attr(img, "class", img_class_value);
			}

			if (dirty & /*block*/ 1 && !src_url_equal(img.src, img_src_value = toNotionImageUrl(/*icon*/ ctx[3], /*block*/ ctx[0].id))) {
				attr(img, "src", img_src_value);
			}
		},
		d(detaching) {
			if (detaching) detach(img);
		}
	};
}

function create_fragment$s(ctx) {
	let show_if = /*isIconBlock*/ ctx[2](/*block*/ ctx[0]);
	let if_block_anchor;
	let if_block = show_if && create_if_block$j(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, [dirty]) {
			if (dirty & /*block*/ 1) show_if = /*isIconBlock*/ ctx[2](/*block*/ ctx[0]);

			if (show_if) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block$j(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$s($$self, $$props, $$invalidate) {
	let { block = {} } = $$props;
	let { big = false } = $$props;
	const isIconBlock = value => value.type === 'page' || value.type === 'callout';
	const icon = block.format.page_icon;

	const title = block.properties && block.properties.title
	? block.properties.title
	: null;

	$$self.$$set = $$props => {
		if ('block' in $$props) $$invalidate(0, block = $$props.block);
		if ('big' in $$props) $$invalidate(1, big = $$props.big);
	};

	return [block, big, isIconBlock, icon, title];
}

class PageIcon extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$s, create_fragment$s, safe_not_equal, { block: 0, big: 1 });
	}
}

/* src/components/Callout.svelte generated by Svelte v3.49.0 */

function create_else_block$f(ctx) {
	let div2;
	let t0;
	let div1;
	let t1;
	let div0;
	let div2_id_value;
	let div2_class_value;
	let current;
	let if_block0 = /*showIcon*/ ctx[1] && create_if_block_2$c(ctx);
	let if_block1 = /*calloutType*/ ctx[4] == 'default' && create_if_block_1$f(ctx);
	const default_slot_template = /*#slots*/ ctx[12].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

	return {
		c() {
			div2 = element("div");
			if (if_block0) if_block0.c();
			t0 = space();
			div1 = element("div");
			if (if_block1) if_block1.c();
			t1 = space();
			div0 = element("div");
			if (default_slot) default_slot.c();
			attr(div0, "class", "notion-callout-children");
			attr(div1, "class", "notion-callout-text");
			attr(div2, "id", div2_id_value = `_block-${/*block*/ ctx[5].id}`);
			attr(div2, "class", div2_class_value = `${/*useCallout*/ ctx[3] ? 'notion-callout' : ''} ${/*classes*/ ctx[0]} ${/*block*/ ctx[5].content ? 'notion-children' : ''} ${/*useBlockColor*/ ctx[2] && /*block*/ ctx[5].format.block_color && 'notion-' + /*block*/ ctx[5].format.block_color + '_co'}`);
			toggle_class(div2, "notion-callout-billboard", /*title*/ ctx[7].includes('#billboard'));
		},
		m(target, anchor) {
			insert(target, div2, anchor);
			if (if_block0) if_block0.m(div2, null);
			append(div2, t0);
			append(div2, div1);
			if (if_block1) if_block1.m(div1, null);
			append(div1, t1);
			append(div1, div0);

			if (default_slot) {
				default_slot.m(div0, null);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (/*showIcon*/ ctx[1]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);

					if (dirty & /*showIcon*/ 2) {
						transition_in(if_block0, 1);
					}
				} else {
					if_block0 = create_if_block_2$c(ctx);
					if_block0.c();
					transition_in(if_block0, 1);
					if_block0.m(div2, t0);
				}
			} else if (if_block0) {
				group_outros();

				transition_out(if_block0, 1, 1, () => {
					if_block0 = null;
				});

				check_outros();
			}

			if (/*calloutType*/ ctx[4] == 'default') {
				if (if_block1) {
					if_block1.p(ctx, dirty);

					if (dirty & /*calloutType*/ 16) {
						transition_in(if_block1, 1);
					}
				} else {
					if_block1 = create_if_block_1$f(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(div1, t1);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}

			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 2048)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[11],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[11], dirty, null),
						null
					);
				}
			}

			if (!current || dirty & /*block*/ 32 && div2_id_value !== (div2_id_value = `_block-${/*block*/ ctx[5].id}`)) {
				attr(div2, "id", div2_id_value);
			}

			if (!current || dirty & /*useCallout, classes, block, useBlockColor*/ 45 && div2_class_value !== (div2_class_value = `${/*useCallout*/ ctx[3] ? 'notion-callout' : ''} ${/*classes*/ ctx[0]} ${/*block*/ ctx[5].content ? 'notion-children' : ''} ${/*useBlockColor*/ ctx[2] && /*block*/ ctx[5].format.block_color && 'notion-' + /*block*/ ctx[5].format.block_color + '_co'}`)) {
				attr(div2, "class", div2_class_value);
			}

			if (dirty & /*useCallout, classes, block, useBlockColor, title*/ 173) {
				toggle_class(div2, "notion-callout-billboard", /*title*/ ctx[7].includes('#billboard'));
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block1);
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(if_block0);
			transition_out(if_block1);
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div2);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if (default_slot) default_slot.d(detaching);
		}
	};
}

// (58:0) {#if url}
function create_if_block$i(ctx) {
	let a;
	let div2;
	let div1;
	let div0;
	let div2_id_value;
	let current;
	const default_slot_template = /*#slots*/ ctx[12].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

	return {
		c() {
			a = element("a");
			div2 = element("div");
			div1 = element("div");
			div0 = element("div");
			if (default_slot) default_slot.c();
			attr(div0, "class", "");
			attr(div1, "class", "");
			attr(div2, "id", div2_id_value = `_block-${/*block*/ ctx[5].id}`);
			toggle_class(div2, "notion-callout-billboard", /*title*/ ctx[7].includes('#billboard'));
			attr(a, "href", /*url*/ ctx[6]);
			attr(a, "class", /*classes*/ ctx[0]);
			set_style(a, "display", "inline-block");
		},
		m(target, anchor) {
			insert(target, a, anchor);
			append(a, div2);
			append(div2, div1);
			append(div1, div0);

			if (default_slot) {
				default_slot.m(div0, null);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 2048)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[11],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[11], dirty, null),
						null
					);
				}
			}

			if (!current || dirty & /*block*/ 32 && div2_id_value !== (div2_id_value = `_block-${/*block*/ ctx[5].id}`)) {
				attr(div2, "id", div2_id_value);
			}

			if (!current || dirty & /*url*/ 64) {
				attr(a, "href", /*url*/ ctx[6]);
			}

			if (!current || dirty & /*classes*/ 1) {
				attr(a, "class", /*classes*/ ctx[0]);
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(a);
			if (default_slot) default_slot.d(detaching);
		}
	};
}

// (78:4) {#if showIcon}
function create_if_block_2$c(ctx) {
	let div;
	let pageicon;
	let current;
	pageicon = new PageIcon({ props: { block: /*block*/ ctx[5] } });

	return {
		c() {
			div = element("div");
			create_component(pageicon.$$.fragment);
			attr(div, "class", "notion-callout-icon");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			mount_component(pageicon, div, null);
			current = true;
		},
		p(ctx, dirty) {
			const pageicon_changes = {};
			if (dirty & /*block*/ 32) pageicon_changes.block = /*block*/ ctx[5];
			pageicon.$set(pageicon_changes);
		},
		i(local) {
			if (current) return;
			transition_in(pageicon.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(pageicon.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_component(pageicon);
		}
	};
}

// (84:6) {#if calloutType == 'default'}
function create_if_block_1$f(ctx) {
	let formattedtext;
	let current;
	formattedtext = new FormattedText({ props: { block: /*block*/ ctx[5] } });

	return {
		c() {
			create_component(formattedtext.$$.fragment);
		},
		m(target, anchor) {
			mount_component(formattedtext, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const formattedtext_changes = {};
			if (dirty & /*block*/ 32) formattedtext_changes.block = /*block*/ ctx[5];
			formattedtext.$set(formattedtext_changes);
		},
		i(local) {
			if (current) return;
			transition_in(formattedtext.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formattedtext.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(formattedtext, detaching);
		}
	};
}

function create_fragment$r(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block$i, create_else_block$f];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*url*/ ctx[6]) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				} else {
					if_block.p(ctx, dirty);
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$r($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { block = {} } = $$props;
	let { blocks = [] } = $$props;
	let { fullPage = false } = $$props;
	let { api = null } = $$props;
	let { classes = "", showIcon = true, useBlockColor = true, useCallout = true, calloutType = "default" } = $$props;
	let url;
	const title = getTextContent(block);

	$$self.$$set = $$props => {
		if ('block' in $$props) $$invalidate(5, block = $$props.block);
		if ('blocks' in $$props) $$invalidate(8, blocks = $$props.blocks);
		if ('fullPage' in $$props) $$invalidate(9, fullPage = $$props.fullPage);
		if ('api' in $$props) $$invalidate(10, api = $$props.api);
		if ('classes' in $$props) $$invalidate(0, classes = $$props.classes);
		if ('showIcon' in $$props) $$invalidate(1, showIcon = $$props.showIcon);
		if ('useBlockColor' in $$props) $$invalidate(2, useBlockColor = $$props.useBlockColor);
		if ('useCallout' in $$props) $$invalidate(3, useCallout = $$props.useCallout);
		if ('calloutType' in $$props) $$invalidate(4, calloutType = $$props.calloutType);
		if ('$$scope' in $$props) $$invalidate(11, $$scope = $$props.$$scope);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*classes*/ 1) {
			if (title) {
				// title = block.properties.title // first line of the callout
				// special Callouts
				if (title && title.includes("#billboard") || title.includes("#hideicon")) {
					$$invalidate(4, calloutType = "billboard");
					$$invalidate(1, showIcon = false);
				}

				if (title && title.includes("#noBg")) {
					$$invalidate(2, useBlockColor = false);
				}

				if (title && title.includes("#blank")) {
					$$invalidate(3, useCallout = false);
				}

				if (title && title.includes("#link")) {
					$$invalidate(4, calloutType = "link");
					$$invalidate(1, showIcon = false);
					$$invalidate(2, useBlockColor = false);

					// we're trying to get the link from something that looks like #link:https://phageaustralia.org/intro
					let hashes = title.split(' ');

					let hash = hashes.find(h => h.includes('link'));
					$$invalidate(6, url = hash.substring(hash.indexOf(':') + 1));
				}

				if (title && title.includes("#classes")) {
					$$invalidate(0, classes += " " + title);
				}

				// child blocks can get 'useHtml' context
				if (title && title.includes("#html")) {
					setContext("useHtml", true);
				}
			}
		}
	};

	return [
		classes,
		showIcon,
		useBlockColor,
		useCallout,
		calloutType,
		block,
		url,
		title,
		blocks,
		fullPage,
		api,
		$$scope,
		slots
	];
}

class Callout extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$r, create_fragment$r, safe_not_equal, {
			block: 5,
			blocks: 8,
			fullPage: 9,
			api: 10,
			classes: 0,
			showIcon: 1,
			useBlockColor: 2,
			useCallout: 3,
			calloutType: 4
		});
	}
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, basedir, module) {
	return module = {
	  path: basedir,
	  exports: {},
	  require: function (path, base) {
      return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    }
	}, fn(module, module.exports), module.exports;
}

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

var prism = createCommonjsModule(function (module) {
/* **********************************************
     Begin prism-core.js
********************************************** */

/// <reference lib="WebWorker"/>

var _self = (typeof window !== 'undefined')
	? window   // if in browser
	: (
		(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
			? self // if in worker
			: {}   // if in node js
	);

/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 *
 * @license MIT <https://opensource.org/licenses/MIT>
 * @author Lea Verou <https://lea.verou.me>
 * @namespace
 * @public
 */
var Prism = (function (_self) {

	// Private helper vars
	var lang = /(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i;
	var uniqueId = 0;

	// The grammar object for plaintext
	var plainTextGrammar = {};


	var _ = {
		/**
		 * By default, Prism will attempt to highlight all code elements (by calling {@link Prism.highlightAll}) on the
		 * current page after the page finished loading. This might be a problem if e.g. you wanted to asynchronously load
		 * additional languages or plugins yourself.
		 *
		 * By setting this value to `true`, Prism will not automatically highlight all code elements on the page.
		 *
		 * You obviously have to change this value before the automatic highlighting started. To do this, you can add an
		 * empty Prism object into the global scope before loading the Prism script like this:
		 *
		 * ```js
		 * window.Prism = window.Prism || {};
		 * Prism.manual = true;
		 * // add a new <script> to load Prism's script
		 * ```
		 *
		 * @default false
		 * @type {boolean}
		 * @memberof Prism
		 * @public
		 */
		manual: _self.Prism && _self.Prism.manual,
		/**
		 * By default, if Prism is in a web worker, it assumes that it is in a worker it created itself, so it uses
		 * `addEventListener` to communicate with its parent instance. However, if you're using Prism manually in your
		 * own worker, you don't want it to do this.
		 *
		 * By setting this value to `true`, Prism will not add its own listeners to the worker.
		 *
		 * You obviously have to change this value before Prism executes. To do this, you can add an
		 * empty Prism object into the global scope before loading the Prism script like this:
		 *
		 * ```js
		 * window.Prism = window.Prism || {};
		 * Prism.disableWorkerMessageHandler = true;
		 * // Load Prism's script
		 * ```
		 *
		 * @default false
		 * @type {boolean}
		 * @memberof Prism
		 * @public
		 */
		disableWorkerMessageHandler: _self.Prism && _self.Prism.disableWorkerMessageHandler,

		/**
		 * A namespace for utility methods.
		 *
		 * All function in this namespace that are not explicitly marked as _public_ are for __internal use only__ and may
		 * change or disappear at any time.
		 *
		 * @namespace
		 * @memberof Prism
		 */
		util: {
			encode: function encode(tokens) {
				if (tokens instanceof Token) {
					return new Token(tokens.type, encode(tokens.content), tokens.alias);
				} else if (Array.isArray(tokens)) {
					return tokens.map(encode);
				} else {
					return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
				}
			},

			/**
			 * Returns the name of the type of the given value.
			 *
			 * @param {any} o
			 * @returns {string}
			 * @example
			 * type(null)      === 'Null'
			 * type(undefined) === 'Undefined'
			 * type(123)       === 'Number'
			 * type('foo')     === 'String'
			 * type(true)      === 'Boolean'
			 * type([1, 2])    === 'Array'
			 * type({})        === 'Object'
			 * type(String)    === 'Function'
			 * type(/abc+/)    === 'RegExp'
			 */
			type: function (o) {
				return Object.prototype.toString.call(o).slice(8, -1);
			},

			/**
			 * Returns a unique number for the given object. Later calls will still return the same number.
			 *
			 * @param {Object} obj
			 * @returns {number}
			 */
			objId: function (obj) {
				if (!obj['__id']) {
					Object.defineProperty(obj, '__id', { value: ++uniqueId });
				}
				return obj['__id'];
			},

			/**
			 * Creates a deep clone of the given object.
			 *
			 * The main intended use of this function is to clone language definitions.
			 *
			 * @param {T} o
			 * @param {Record<number, any>} [visited]
			 * @returns {T}
			 * @template T
			 */
			clone: function deepClone(o, visited) {
				visited = visited || {};

				var clone; var id;
				switch (_.util.type(o)) {
					case 'Object':
						id = _.util.objId(o);
						if (visited[id]) {
							return visited[id];
						}
						clone = /** @type {Record<string, any>} */ ({});
						visited[id] = clone;

						for (var key in o) {
							if (o.hasOwnProperty(key)) {
								clone[key] = deepClone(o[key], visited);
							}
						}

						return /** @type {any} */ (clone);

					case 'Array':
						id = _.util.objId(o);
						if (visited[id]) {
							return visited[id];
						}
						clone = [];
						visited[id] = clone;

						(/** @type {Array} */(/** @type {any} */(o))).forEach(function (v, i) {
							clone[i] = deepClone(v, visited);
						});

						return /** @type {any} */ (clone);

					default:
						return o;
				}
			},

			/**
			 * Returns the Prism language of the given element set by a `language-xxxx` or `lang-xxxx` class.
			 *
			 * If no language is set for the element or the element is `null` or `undefined`, `none` will be returned.
			 *
			 * @param {Element} element
			 * @returns {string}
			 */
			getLanguage: function (element) {
				while (element) {
					var m = lang.exec(element.className);
					if (m) {
						return m[1].toLowerCase();
					}
					element = element.parentElement;
				}
				return 'none';
			},

			/**
			 * Sets the Prism `language-xxxx` class of the given element.
			 *
			 * @param {Element} element
			 * @param {string} language
			 * @returns {void}
			 */
			setLanguage: function (element, language) {
				// remove all `language-xxxx` classes
				// (this might leave behind a leading space)
				element.className = element.className.replace(RegExp(lang, 'gi'), '');

				// add the new `language-xxxx` class
				// (using `classList` will automatically clean up spaces for us)
				element.classList.add('language-' + language);
			},

			/**
			 * Returns the script element that is currently executing.
			 *
			 * This does __not__ work for line script element.
			 *
			 * @returns {HTMLScriptElement | null}
			 */
			currentScript: function () {
				if (typeof document === 'undefined') {
					return null;
				}
				if ('currentScript' in document && 1 < 2 /* hack to trip TS' flow analysis */) {
					return /** @type {any} */ (document.currentScript);
				}

				// IE11 workaround
				// we'll get the src of the current script by parsing IE11's error stack trace
				// this will not work for inline scripts

				try {
					throw new Error();
				} catch (err) {
					// Get file src url from stack. Specifically works with the format of stack traces in IE.
					// A stack will look like this:
					//
					// Error
					//    at _.util.currentScript (http://localhost/components/prism-core.js:119:5)
					//    at Global code (http://localhost/components/prism-core.js:606:1)

					var src = (/at [^(\r\n]*\((.*):[^:]+:[^:]+\)$/i.exec(err.stack) || [])[1];
					if (src) {
						var scripts = document.getElementsByTagName('script');
						for (var i in scripts) {
							if (scripts[i].src == src) {
								return scripts[i];
							}
						}
					}
					return null;
				}
			},

			/**
			 * Returns whether a given class is active for `element`.
			 *
			 * The class can be activated if `element` or one of its ancestors has the given class and it can be deactivated
			 * if `element` or one of its ancestors has the negated version of the given class. The _negated version_ of the
			 * given class is just the given class with a `no-` prefix.
			 *
			 * Whether the class is active is determined by the closest ancestor of `element` (where `element` itself is
			 * closest ancestor) that has the given class or the negated version of it. If neither `element` nor any of its
			 * ancestors have the given class or the negated version of it, then the default activation will be returned.
			 *
			 * In the paradoxical situation where the closest ancestor contains __both__ the given class and the negated
			 * version of it, the class is considered active.
			 *
			 * @param {Element} element
			 * @param {string} className
			 * @param {boolean} [defaultActivation=false]
			 * @returns {boolean}
			 */
			isActive: function (element, className, defaultActivation) {
				var no = 'no-' + className;

				while (element) {
					var classList = element.classList;
					if (classList.contains(className)) {
						return true;
					}
					if (classList.contains(no)) {
						return false;
					}
					element = element.parentElement;
				}
				return !!defaultActivation;
			}
		},

		/**
		 * This namespace contains all currently loaded languages and the some helper functions to create and modify languages.
		 *
		 * @namespace
		 * @memberof Prism
		 * @public
		 */
		languages: {
			/**
			 * The grammar for plain, unformatted text.
			 */
			plain: plainTextGrammar,
			plaintext: plainTextGrammar,
			text: plainTextGrammar,
			txt: plainTextGrammar,

			/**
			 * Creates a deep copy of the language with the given id and appends the given tokens.
			 *
			 * If a token in `redef` also appears in the copied language, then the existing token in the copied language
			 * will be overwritten at its original position.
			 *
			 * ## Best practices
			 *
			 * Since the position of overwriting tokens (token in `redef` that overwrite tokens in the copied language)
			 * doesn't matter, they can technically be in any order. However, this can be confusing to others that trying to
			 * understand the language definition because, normally, the order of tokens matters in Prism grammars.
			 *
			 * Therefore, it is encouraged to order overwriting tokens according to the positions of the overwritten tokens.
			 * Furthermore, all non-overwriting tokens should be placed after the overwriting ones.
			 *
			 * @param {string} id The id of the language to extend. This has to be a key in `Prism.languages`.
			 * @param {Grammar} redef The new tokens to append.
			 * @returns {Grammar} The new language created.
			 * @public
			 * @example
			 * Prism.languages['css-with-colors'] = Prism.languages.extend('css', {
			 *     // Prism.languages.css already has a 'comment' token, so this token will overwrite CSS' 'comment' token
			 *     // at its original position
			 *     'comment': { ... },
			 *     // CSS doesn't have a 'color' token, so this token will be appended
			 *     'color': /\b(?:red|green|blue)\b/
			 * });
			 */
			extend: function (id, redef) {
				var lang = _.util.clone(_.languages[id]);

				for (var key in redef) {
					lang[key] = redef[key];
				}

				return lang;
			},

			/**
			 * Inserts tokens _before_ another token in a language definition or any other grammar.
			 *
			 * ## Usage
			 *
			 * This helper method makes it easy to modify existing languages. For example, the CSS language definition
			 * not only defines CSS highlighting for CSS documents, but also needs to define highlighting for CSS embedded
			 * in HTML through `<style>` elements. To do this, it needs to modify `Prism.languages.markup` and add the
			 * appropriate tokens. However, `Prism.languages.markup` is a regular JavaScript object literal, so if you do
			 * this:
			 *
			 * ```js
			 * Prism.languages.markup.style = {
			 *     // token
			 * };
			 * ```
			 *
			 * then the `style` token will be added (and processed) at the end. `insertBefore` allows you to insert tokens
			 * before existing tokens. For the CSS example above, you would use it like this:
			 *
			 * ```js
			 * Prism.languages.insertBefore('markup', 'cdata', {
			 *     'style': {
			 *         // token
			 *     }
			 * });
			 * ```
			 *
			 * ## Special cases
			 *
			 * If the grammars of `inside` and `insert` have tokens with the same name, the tokens in `inside`'s grammar
			 * will be ignored.
			 *
			 * This behavior can be used to insert tokens after `before`:
			 *
			 * ```js
			 * Prism.languages.insertBefore('markup', 'comment', {
			 *     'comment': Prism.languages.markup.comment,
			 *     // tokens after 'comment'
			 * });
			 * ```
			 *
			 * ## Limitations
			 *
			 * The main problem `insertBefore` has to solve is iteration order. Since ES2015, the iteration order for object
			 * properties is guaranteed to be the insertion order (except for integer keys) but some browsers behave
			 * differently when keys are deleted and re-inserted. So `insertBefore` can't be implemented by temporarily
			 * deleting properties which is necessary to insert at arbitrary positions.
			 *
			 * To solve this problem, `insertBefore` doesn't actually insert the given tokens into the target object.
			 * Instead, it will create a new object and replace all references to the target object with the new one. This
			 * can be done without temporarily deleting properties, so the iteration order is well-defined.
			 *
			 * However, only references that can be reached from `Prism.languages` or `insert` will be replaced. I.e. if
			 * you hold the target object in a variable, then the value of the variable will not change.
			 *
			 * ```js
			 * var oldMarkup = Prism.languages.markup;
			 * var newMarkup = Prism.languages.insertBefore('markup', 'comment', { ... });
			 *
			 * assert(oldMarkup !== Prism.languages.markup);
			 * assert(newMarkup === Prism.languages.markup);
			 * ```
			 *
			 * @param {string} inside The property of `root` (e.g. a language id in `Prism.languages`) that contains the
			 * object to be modified.
			 * @param {string} before The key to insert before.
			 * @param {Grammar} insert An object containing the key-value pairs to be inserted.
			 * @param {Object<string, any>} [root] The object containing `inside`, i.e. the object that contains the
			 * object to be modified.
			 *
			 * Defaults to `Prism.languages`.
			 * @returns {Grammar} The new grammar object.
			 * @public
			 */
			insertBefore: function (inside, before, insert, root) {
				root = root || /** @type {any} */ (_.languages);
				var grammar = root[inside];
				/** @type {Grammar} */
				var ret = {};

				for (var token in grammar) {
					if (grammar.hasOwnProperty(token)) {

						if (token == before) {
							for (var newToken in insert) {
								if (insert.hasOwnProperty(newToken)) {
									ret[newToken] = insert[newToken];
								}
							}
						}

						// Do not insert token which also occur in insert. See #1525
						if (!insert.hasOwnProperty(token)) {
							ret[token] = grammar[token];
						}
					}
				}

				var old = root[inside];
				root[inside] = ret;

				// Update references in other language definitions
				_.languages.DFS(_.languages, function (key, value) {
					if (value === old && key != inside) {
						this[key] = ret;
					}
				});

				return ret;
			},

			// Traverse a language definition with Depth First Search
			DFS: function DFS(o, callback, type, visited) {
				visited = visited || {};

				var objId = _.util.objId;

				for (var i in o) {
					if (o.hasOwnProperty(i)) {
						callback.call(o, i, o[i], type || i);

						var property = o[i];
						var propertyType = _.util.type(property);

						if (propertyType === 'Object' && !visited[objId(property)]) {
							visited[objId(property)] = true;
							DFS(property, callback, null, visited);
						} else if (propertyType === 'Array' && !visited[objId(property)]) {
							visited[objId(property)] = true;
							DFS(property, callback, i, visited);
						}
					}
				}
			}
		},

		plugins: {},

		/**
		 * This is the most high-level function in Prism’s API.
		 * It fetches all the elements that have a `.language-xxxx` class and then calls {@link Prism.highlightElement} on
		 * each one of them.
		 *
		 * This is equivalent to `Prism.highlightAllUnder(document, async, callback)`.
		 *
		 * @param {boolean} [async=false] Same as in {@link Prism.highlightAllUnder}.
		 * @param {HighlightCallback} [callback] Same as in {@link Prism.highlightAllUnder}.
		 * @memberof Prism
		 * @public
		 */
		highlightAll: function (async, callback) {
			_.highlightAllUnder(document, async, callback);
		},

		/**
		 * Fetches all the descendants of `container` that have a `.language-xxxx` class and then calls
		 * {@link Prism.highlightElement} on each one of them.
		 *
		 * The following hooks will be run:
		 * 1. `before-highlightall`
		 * 2. `before-all-elements-highlight`
		 * 3. All hooks of {@link Prism.highlightElement} for each element.
		 *
		 * @param {ParentNode} container The root element, whose descendants that have a `.language-xxxx` class will be highlighted.
		 * @param {boolean} [async=false] Whether each element is to be highlighted asynchronously using Web Workers.
		 * @param {HighlightCallback} [callback] An optional callback to be invoked on each element after its highlighting is done.
		 * @memberof Prism
		 * @public
		 */
		highlightAllUnder: function (container, async, callback) {
			var env = {
				callback: callback,
				container: container,
				selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
			};

			_.hooks.run('before-highlightall', env);

			env.elements = Array.prototype.slice.apply(env.container.querySelectorAll(env.selector));

			_.hooks.run('before-all-elements-highlight', env);

			for (var i = 0, element; (element = env.elements[i++]);) {
				_.highlightElement(element, async === true, env.callback);
			}
		},

		/**
		 * Highlights the code inside a single element.
		 *
		 * The following hooks will be run:
		 * 1. `before-sanity-check`
		 * 2. `before-highlight`
		 * 3. All hooks of {@link Prism.highlight}. These hooks will be run by an asynchronous worker if `async` is `true`.
		 * 4. `before-insert`
		 * 5. `after-highlight`
		 * 6. `complete`
		 *
		 * Some the above hooks will be skipped if the element doesn't contain any text or there is no grammar loaded for
		 * the element's language.
		 *
		 * @param {Element} element The element containing the code.
		 * It must have a class of `language-xxxx` to be processed, where `xxxx` is a valid language identifier.
		 * @param {boolean} [async=false] Whether the element is to be highlighted asynchronously using Web Workers
		 * to improve performance and avoid blocking the UI when highlighting very large chunks of code. This option is
		 * [disabled by default](https://prismjs.com/faq.html#why-is-asynchronous-highlighting-disabled-by-default).
		 *
		 * Note: All language definitions required to highlight the code must be included in the main `prism.js` file for
		 * asynchronous highlighting to work. You can build your own bundle on the
		 * [Download page](https://prismjs.com/download.html).
		 * @param {HighlightCallback} [callback] An optional callback to be invoked after the highlighting is done.
		 * Mostly useful when `async` is `true`, since in that case, the highlighting is done asynchronously.
		 * @memberof Prism
		 * @public
		 */
		highlightElement: function (element, async, callback) {
			// Find language
			var language = _.util.getLanguage(element);
			var grammar = _.languages[language];

			// Set language on the element, if not present
			_.util.setLanguage(element, language);

			// Set language on the parent, for styling
			var parent = element.parentElement;
			if (parent && parent.nodeName.toLowerCase() === 'pre') {
				_.util.setLanguage(parent, language);
			}

			var code = element.textContent;

			var env = {
				element: element,
				language: language,
				grammar: grammar,
				code: code
			};

			function insertHighlightedCode(highlightedCode) {
				env.highlightedCode = highlightedCode;

				_.hooks.run('before-insert', env);

				env.element.innerHTML = env.highlightedCode;

				_.hooks.run('after-highlight', env);
				_.hooks.run('complete', env);
				callback && callback.call(env.element);
			}

			_.hooks.run('before-sanity-check', env);

			// plugins may change/add the parent/element
			parent = env.element.parentElement;
			if (parent && parent.nodeName.toLowerCase() === 'pre' && !parent.hasAttribute('tabindex')) {
				parent.setAttribute('tabindex', '0');
			}

			if (!env.code) {
				_.hooks.run('complete', env);
				callback && callback.call(env.element);
				return;
			}

			_.hooks.run('before-highlight', env);

			if (!env.grammar) {
				insertHighlightedCode(_.util.encode(env.code));
				return;
			}

			if (async && _self.Worker) {
				var worker = new Worker(_.filename);

				worker.onmessage = function (evt) {
					insertHighlightedCode(evt.data);
				};

				worker.postMessage(JSON.stringify({
					language: env.language,
					code: env.code,
					immediateClose: true
				}));
			} else {
				insertHighlightedCode(_.highlight(env.code, env.grammar, env.language));
			}
		},

		/**
		 * Low-level function, only use if you know what you’re doing. It accepts a string of text as input
		 * and the language definitions to use, and returns a string with the HTML produced.
		 *
		 * The following hooks will be run:
		 * 1. `before-tokenize`
		 * 2. `after-tokenize`
		 * 3. `wrap`: On each {@link Token}.
		 *
		 * @param {string} text A string with the code to be highlighted.
		 * @param {Grammar} grammar An object containing the tokens to use.
		 *
		 * Usually a language definition like `Prism.languages.markup`.
		 * @param {string} language The name of the language definition passed to `grammar`.
		 * @returns {string} The highlighted HTML.
		 * @memberof Prism
		 * @public
		 * @example
		 * Prism.highlight('var foo = true;', Prism.languages.javascript, 'javascript');
		 */
		highlight: function (text, grammar, language) {
			var env = {
				code: text,
				grammar: grammar,
				language: language
			};
			_.hooks.run('before-tokenize', env);
			if (!env.grammar) {
				throw new Error('The language "' + env.language + '" has no grammar.');
			}
			env.tokens = _.tokenize(env.code, env.grammar);
			_.hooks.run('after-tokenize', env);
			return Token.stringify(_.util.encode(env.tokens), env.language);
		},

		/**
		 * This is the heart of Prism, and the most low-level function you can use. It accepts a string of text as input
		 * and the language definitions to use, and returns an array with the tokenized code.
		 *
		 * When the language definition includes nested tokens, the function is called recursively on each of these tokens.
		 *
		 * This method could be useful in other contexts as well, as a very crude parser.
		 *
		 * @param {string} text A string with the code to be highlighted.
		 * @param {Grammar} grammar An object containing the tokens to use.
		 *
		 * Usually a language definition like `Prism.languages.markup`.
		 * @returns {TokenStream} An array of strings and tokens, a token stream.
		 * @memberof Prism
		 * @public
		 * @example
		 * let code = `var foo = 0;`;
		 * let tokens = Prism.tokenize(code, Prism.languages.javascript);
		 * tokens.forEach(token => {
		 *     if (token instanceof Prism.Token && token.type === 'number') {
		 *         console.log(`Found numeric literal: ${token.content}`);
		 *     }
		 * });
		 */
		tokenize: function (text, grammar) {
			var rest = grammar.rest;
			if (rest) {
				for (var token in rest) {
					grammar[token] = rest[token];
				}

				delete grammar.rest;
			}

			var tokenList = new LinkedList();
			addAfter(tokenList, tokenList.head, text);

			matchGrammar(text, tokenList, grammar, tokenList.head, 0);

			return toArray(tokenList);
		},

		/**
		 * @namespace
		 * @memberof Prism
		 * @public
		 */
		hooks: {
			all: {},

			/**
			 * Adds the given callback to the list of callbacks for the given hook.
			 *
			 * The callback will be invoked when the hook it is registered for is run.
			 * Hooks are usually directly run by a highlight function but you can also run hooks yourself.
			 *
			 * One callback function can be registered to multiple hooks and the same hook multiple times.
			 *
			 * @param {string} name The name of the hook.
			 * @param {HookCallback} callback The callback function which is given environment variables.
			 * @public
			 */
			add: function (name, callback) {
				var hooks = _.hooks.all;

				hooks[name] = hooks[name] || [];

				hooks[name].push(callback);
			},

			/**
			 * Runs a hook invoking all registered callbacks with the given environment variables.
			 *
			 * Callbacks will be invoked synchronously and in the order in which they were registered.
			 *
			 * @param {string} name The name of the hook.
			 * @param {Object<string, any>} env The environment variables of the hook passed to all callbacks registered.
			 * @public
			 */
			run: function (name, env) {
				var callbacks = _.hooks.all[name];

				if (!callbacks || !callbacks.length) {
					return;
				}

				for (var i = 0, callback; (callback = callbacks[i++]);) {
					callback(env);
				}
			}
		},

		Token: Token
	};
	_self.Prism = _;


	// Typescript note:
	// The following can be used to import the Token type in JSDoc:
	//
	//   @typedef {InstanceType<import("./prism-core")["Token"]>} Token

	/**
	 * Creates a new token.
	 *
	 * @param {string} type See {@link Token#type type}
	 * @param {string | TokenStream} content See {@link Token#content content}
	 * @param {string|string[]} [alias] The alias(es) of the token.
	 * @param {string} [matchedStr=""] A copy of the full string this token was created from.
	 * @class
	 * @global
	 * @public
	 */
	function Token(type, content, alias, matchedStr) {
		/**
		 * The type of the token.
		 *
		 * This is usually the key of a pattern in a {@link Grammar}.
		 *
		 * @type {string}
		 * @see GrammarToken
		 * @public
		 */
		this.type = type;
		/**
		 * The strings or tokens contained by this token.
		 *
		 * This will be a token stream if the pattern matched also defined an `inside` grammar.
		 *
		 * @type {string | TokenStream}
		 * @public
		 */
		this.content = content;
		/**
		 * The alias(es) of the token.
		 *
		 * @type {string|string[]}
		 * @see GrammarToken
		 * @public
		 */
		this.alias = alias;
		// Copy of the full string this token was created from
		this.length = (matchedStr || '').length | 0;
	}

	/**
	 * A token stream is an array of strings and {@link Token Token} objects.
	 *
	 * Token streams have to fulfill a few properties that are assumed by most functions (mostly internal ones) that process
	 * them.
	 *
	 * 1. No adjacent strings.
	 * 2. No empty strings.
	 *
	 *    The only exception here is the token stream that only contains the empty string and nothing else.
	 *
	 * @typedef {Array<string | Token>} TokenStream
	 * @global
	 * @public
	 */

	/**
	 * Converts the given token or token stream to an HTML representation.
	 *
	 * The following hooks will be run:
	 * 1. `wrap`: On each {@link Token}.
	 *
	 * @param {string | Token | TokenStream} o The token or token stream to be converted.
	 * @param {string} language The name of current language.
	 * @returns {string} The HTML representation of the token or token stream.
	 * @memberof Token
	 * @static
	 */
	Token.stringify = function stringify(o, language) {
		if (typeof o == 'string') {
			return o;
		}
		if (Array.isArray(o)) {
			var s = '';
			o.forEach(function (e) {
				s += stringify(e, language);
			});
			return s;
		}

		var env = {
			type: o.type,
			content: stringify(o.content, language),
			tag: 'span',
			classes: ['token', o.type],
			attributes: {},
			language: language
		};

		var aliases = o.alias;
		if (aliases) {
			if (Array.isArray(aliases)) {
				Array.prototype.push.apply(env.classes, aliases);
			} else {
				env.classes.push(aliases);
			}
		}

		_.hooks.run('wrap', env);

		var attributes = '';
		for (var name in env.attributes) {
			attributes += ' ' + name + '="' + (env.attributes[name] || '').replace(/"/g, '&quot;') + '"';
		}

		return '<' + env.tag + ' class="' + env.classes.join(' ') + '"' + attributes + '>' + env.content + '</' + env.tag + '>';
	};

	/**
	 * @param {RegExp} pattern
	 * @param {number} pos
	 * @param {string} text
	 * @param {boolean} lookbehind
	 * @returns {RegExpExecArray | null}
	 */
	function matchPattern(pattern, pos, text, lookbehind) {
		pattern.lastIndex = pos;
		var match = pattern.exec(text);
		if (match && lookbehind && match[1]) {
			// change the match to remove the text matched by the Prism lookbehind group
			var lookbehindLength = match[1].length;
			match.index += lookbehindLength;
			match[0] = match[0].slice(lookbehindLength);
		}
		return match;
	}

	/**
	 * @param {string} text
	 * @param {LinkedList<string | Token>} tokenList
	 * @param {any} grammar
	 * @param {LinkedListNode<string | Token>} startNode
	 * @param {number} startPos
	 * @param {RematchOptions} [rematch]
	 * @returns {void}
	 * @private
	 *
	 * @typedef RematchOptions
	 * @property {string} cause
	 * @property {number} reach
	 */
	function matchGrammar(text, tokenList, grammar, startNode, startPos, rematch) {
		for (var token in grammar) {
			if (!grammar.hasOwnProperty(token) || !grammar[token]) {
				continue;
			}

			var patterns = grammar[token];
			patterns = Array.isArray(patterns) ? patterns : [patterns];

			for (var j = 0; j < patterns.length; ++j) {
				if (rematch && rematch.cause == token + ',' + j) {
					return;
				}

				var patternObj = patterns[j];
				var inside = patternObj.inside;
				var lookbehind = !!patternObj.lookbehind;
				var greedy = !!patternObj.greedy;
				var alias = patternObj.alias;

				if (greedy && !patternObj.pattern.global) {
					// Without the global flag, lastIndex won't work
					var flags = patternObj.pattern.toString().match(/[imsuy]*$/)[0];
					patternObj.pattern = RegExp(patternObj.pattern.source, flags + 'g');
				}

				/** @type {RegExp} */
				var pattern = patternObj.pattern || patternObj;

				for ( // iterate the token list and keep track of the current token/string position
					var currentNode = startNode.next, pos = startPos;
					currentNode !== tokenList.tail;
					pos += currentNode.value.length, currentNode = currentNode.next
				) {

					if (rematch && pos >= rematch.reach) {
						break;
					}

					var str = currentNode.value;

					if (tokenList.length > text.length) {
						// Something went terribly wrong, ABORT, ABORT!
						return;
					}

					if (str instanceof Token) {
						continue;
					}

					var removeCount = 1; // this is the to parameter of removeBetween
					var match;

					if (greedy) {
						match = matchPattern(pattern, pos, text, lookbehind);
						if (!match || match.index >= text.length) {
							break;
						}

						var from = match.index;
						var to = match.index + match[0].length;
						var p = pos;

						// find the node that contains the match
						p += currentNode.value.length;
						while (from >= p) {
							currentNode = currentNode.next;
							p += currentNode.value.length;
						}
						// adjust pos (and p)
						p -= currentNode.value.length;
						pos = p;

						// the current node is a Token, then the match starts inside another Token, which is invalid
						if (currentNode.value instanceof Token) {
							continue;
						}

						// find the last node which is affected by this match
						for (
							var k = currentNode;
							k !== tokenList.tail && (p < to || typeof k.value === 'string');
							k = k.next
						) {
							removeCount++;
							p += k.value.length;
						}
						removeCount--;

						// replace with the new match
						str = text.slice(pos, p);
						match.index -= pos;
					} else {
						match = matchPattern(pattern, 0, str, lookbehind);
						if (!match) {
							continue;
						}
					}

					// eslint-disable-next-line no-redeclare
					var from = match.index;
					var matchStr = match[0];
					var before = str.slice(0, from);
					var after = str.slice(from + matchStr.length);

					var reach = pos + str.length;
					if (rematch && reach > rematch.reach) {
						rematch.reach = reach;
					}

					var removeFrom = currentNode.prev;

					if (before) {
						removeFrom = addAfter(tokenList, removeFrom, before);
						pos += before.length;
					}

					removeRange(tokenList, removeFrom, removeCount);

					var wrapped = new Token(token, inside ? _.tokenize(matchStr, inside) : matchStr, alias, matchStr);
					currentNode = addAfter(tokenList, removeFrom, wrapped);

					if (after) {
						addAfter(tokenList, currentNode, after);
					}

					if (removeCount > 1) {
						// at least one Token object was removed, so we have to do some rematching
						// this can only happen if the current pattern is greedy

						/** @type {RematchOptions} */
						var nestedRematch = {
							cause: token + ',' + j,
							reach: reach
						};
						matchGrammar(text, tokenList, grammar, currentNode.prev, pos, nestedRematch);

						// the reach might have been extended because of the rematching
						if (rematch && nestedRematch.reach > rematch.reach) {
							rematch.reach = nestedRematch.reach;
						}
					}
				}
			}
		}
	}

	/**
	 * @typedef LinkedListNode
	 * @property {T} value
	 * @property {LinkedListNode<T> | null} prev The previous node.
	 * @property {LinkedListNode<T> | null} next The next node.
	 * @template T
	 * @private
	 */

	/**
	 * @template T
	 * @private
	 */
	function LinkedList() {
		/** @type {LinkedListNode<T>} */
		var head = { value: null, prev: null, next: null };
		/** @type {LinkedListNode<T>} */
		var tail = { value: null, prev: head, next: null };
		head.next = tail;

		/** @type {LinkedListNode<T>} */
		this.head = head;
		/** @type {LinkedListNode<T>} */
		this.tail = tail;
		this.length = 0;
	}

	/**
	 * Adds a new node with the given value to the list.
	 *
	 * @param {LinkedList<T>} list
	 * @param {LinkedListNode<T>} node
	 * @param {T} value
	 * @returns {LinkedListNode<T>} The added node.
	 * @template T
	 */
	function addAfter(list, node, value) {
		// assumes that node != list.tail && values.length >= 0
		var next = node.next;

		var newNode = { value: value, prev: node, next: next };
		node.next = newNode;
		next.prev = newNode;
		list.length++;

		return newNode;
	}
	/**
	 * Removes `count` nodes after the given node. The given node will not be removed.
	 *
	 * @param {LinkedList<T>} list
	 * @param {LinkedListNode<T>} node
	 * @param {number} count
	 * @template T
	 */
	function removeRange(list, node, count) {
		var next = node.next;
		for (var i = 0; i < count && next !== list.tail; i++) {
			next = next.next;
		}
		node.next = next;
		next.prev = node;
		list.length -= i;
	}
	/**
	 * @param {LinkedList<T>} list
	 * @returns {T[]}
	 * @template T
	 */
	function toArray(list) {
		var array = [];
		var node = list.head.next;
		while (node !== list.tail) {
			array.push(node.value);
			node = node.next;
		}
		return array;
	}


	if (!_self.document) {
		if (!_self.addEventListener) {
			// in Node.js
			return _;
		}

		if (!_.disableWorkerMessageHandler) {
			// In worker
			_self.addEventListener('message', function (evt) {
				var message = JSON.parse(evt.data);
				var lang = message.language;
				var code = message.code;
				var immediateClose = message.immediateClose;

				_self.postMessage(_.highlight(code, _.languages[lang], lang));
				if (immediateClose) {
					_self.close();
				}
			}, false);
		}

		return _;
	}

	// Get current script and highlight
	var script = _.util.currentScript();

	if (script) {
		_.filename = script.src;

		if (script.hasAttribute('data-manual')) {
			_.manual = true;
		}
	}

	function highlightAutomaticallyCallback() {
		if (!_.manual) {
			_.highlightAll();
		}
	}

	if (!_.manual) {
		// If the document state is "loading", then we'll use DOMContentLoaded.
		// If the document state is "interactive" and the prism.js script is deferred, then we'll also use the
		// DOMContentLoaded event because there might be some plugins or languages which have also been deferred and they
		// might take longer one animation frame to execute which can create a race condition where only some plugins have
		// been loaded when Prism.highlightAll() is executed, depending on how fast resources are loaded.
		// See https://github.com/PrismJS/prism/issues/2102
		var readyState = document.readyState;
		if (readyState === 'loading' || readyState === 'interactive' && script && script.defer) {
			document.addEventListener('DOMContentLoaded', highlightAutomaticallyCallback);
		} else {
			if (window.requestAnimationFrame) {
				window.requestAnimationFrame(highlightAutomaticallyCallback);
			} else {
				window.setTimeout(highlightAutomaticallyCallback, 16);
			}
		}
	}

	return _;

}(_self));

if (module.exports) {
	module.exports = Prism;
}

// hack for components to work correctly in node.js
if (typeof commonjsGlobal !== 'undefined') {
	commonjsGlobal.Prism = Prism;
}

// some additional documentation/types

/**
 * The expansion of a simple `RegExp` literal to support additional properties.
 *
 * @typedef GrammarToken
 * @property {RegExp} pattern The regular expression of the token.
 * @property {boolean} [lookbehind=false] If `true`, then the first capturing group of `pattern` will (effectively)
 * behave as a lookbehind group meaning that the captured text will not be part of the matched text of the new token.
 * @property {boolean} [greedy=false] Whether the token is greedy.
 * @property {string|string[]} [alias] An optional alias or list of aliases.
 * @property {Grammar} [inside] The nested grammar of this token.
 *
 * The `inside` grammar will be used to tokenize the text value of each token of this kind.
 *
 * This can be used to make nested and even recursive language definitions.
 *
 * Note: This can cause infinite recursion. Be careful when you embed different languages or even the same language into
 * each another.
 * @global
 * @public
 */

/**
 * @typedef Grammar
 * @type {Object<string, RegExp | GrammarToken | Array<RegExp | GrammarToken>>}
 * @property {Grammar} [rest] An optional grammar object that will be appended to this grammar.
 * @global
 * @public
 */

/**
 * A function which will invoked after an element was successfully highlighted.
 *
 * @callback HighlightCallback
 * @param {Element} element The element successfully highlighted.
 * @returns {void}
 * @global
 * @public
 */

/**
 * @callback HookCallback
 * @param {Object<string, any>} env The environment variables of the hook.
 * @returns {void}
 * @global
 * @public
 */


/* **********************************************
     Begin prism-markup.js
********************************************** */

Prism.languages.markup = {
	'comment': {
		pattern: /<!--(?:(?!<!--)[\s\S])*?-->/,
		greedy: true
	},
	'prolog': {
		pattern: /<\?[\s\S]+?\?>/,
		greedy: true
	},
	'doctype': {
		// https://www.w3.org/TR/xml/#NT-doctypedecl
		pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,
		greedy: true,
		inside: {
			'internal-subset': {
				pattern: /(^[^\[]*\[)[\s\S]+(?=\]>$)/,
				lookbehind: true,
				greedy: true,
				inside: null // see below
			},
			'string': {
				pattern: /"[^"]*"|'[^']*'/,
				greedy: true
			},
			'punctuation': /^<!|>$|[[\]]/,
			'doctype-tag': /^DOCTYPE/i,
			'name': /[^\s<>'"]+/
		}
	},
	'cdata': {
		pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
		greedy: true
	},
	'tag': {
		pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,
		greedy: true,
		inside: {
			'tag': {
				pattern: /^<\/?[^\s>\/]+/,
				inside: {
					'punctuation': /^<\/?/,
					'namespace': /^[^\s>\/:]+:/
				}
			},
			'special-attr': [],
			'attr-value': {
				pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,
				inside: {
					'punctuation': [
						{
							pattern: /^=/,
							alias: 'attr-equals'
						},
						/"|'/
					]
				}
			},
			'punctuation': /\/?>/,
			'attr-name': {
				pattern: /[^\s>\/]+/,
				inside: {
					'namespace': /^[^\s>\/:]+:/
				}
			}

		}
	},
	'entity': [
		{
			pattern: /&[\da-z]{1,8};/i,
			alias: 'named-entity'
		},
		/&#x?[\da-f]{1,8};/i
	]
};

Prism.languages.markup['tag'].inside['attr-value'].inside['entity'] =
	Prism.languages.markup['entity'];
Prism.languages.markup['doctype'].inside['internal-subset'].inside = Prism.languages.markup;

// Plugin to make entity title show the real entity, idea by Roman Komarov
Prism.hooks.add('wrap', function (env) {

	if (env.type === 'entity') {
		env.attributes['title'] = env.content.replace(/&amp;/, '&');
	}
});

Object.defineProperty(Prism.languages.markup.tag, 'addInlined', {
	/**
	 * Adds an inlined language to markup.
	 *
	 * An example of an inlined language is CSS with `<style>` tags.
	 *
	 * @param {string} tagName The name of the tag that contains the inlined language. This name will be treated as
	 * case insensitive.
	 * @param {string} lang The language key.
	 * @example
	 * addInlined('style', 'css');
	 */
	value: function addInlined(tagName, lang) {
		var includedCdataInside = {};
		includedCdataInside['language-' + lang] = {
			pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
			lookbehind: true,
			inside: Prism.languages[lang]
		};
		includedCdataInside['cdata'] = /^<!\[CDATA\[|\]\]>$/i;

		var inside = {
			'included-cdata': {
				pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
				inside: includedCdataInside
			}
		};
		inside['language-' + lang] = {
			pattern: /[\s\S]+/,
			inside: Prism.languages[lang]
		};

		var def = {};
		def[tagName] = {
			pattern: RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g, function () { return tagName; }), 'i'),
			lookbehind: true,
			greedy: true,
			inside: inside
		};

		Prism.languages.insertBefore('markup', 'cdata', def);
	}
});
Object.defineProperty(Prism.languages.markup.tag, 'addAttribute', {
	/**
	 * Adds an pattern to highlight languages embedded in HTML attributes.
	 *
	 * An example of an inlined language is CSS with `style` attributes.
	 *
	 * @param {string} attrName The name of the tag that contains the inlined language. This name will be treated as
	 * case insensitive.
	 * @param {string} lang The language key.
	 * @example
	 * addAttribute('style', 'css');
	 */
	value: function (attrName, lang) {
		Prism.languages.markup.tag.inside['special-attr'].push({
			pattern: RegExp(
				/(^|["'\s])/.source + '(?:' + attrName + ')' + /\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,
				'i'
			),
			lookbehind: true,
			inside: {
				'attr-name': /^[^\s=]+/,
				'attr-value': {
					pattern: /=[\s\S]+/,
					inside: {
						'value': {
							pattern: /(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,
							lookbehind: true,
							alias: [lang, 'language-' + lang],
							inside: Prism.languages[lang]
						},
						'punctuation': [
							{
								pattern: /^=/,
								alias: 'attr-equals'
							},
							/"|'/
						]
					}
				}
			}
		});
	}
});

Prism.languages.html = Prism.languages.markup;
Prism.languages.mathml = Prism.languages.markup;
Prism.languages.svg = Prism.languages.markup;

Prism.languages.xml = Prism.languages.extend('markup', {});
Prism.languages.ssml = Prism.languages.xml;
Prism.languages.atom = Prism.languages.xml;
Prism.languages.rss = Prism.languages.xml;


/* **********************************************
     Begin prism-css.js
********************************************** */

(function (Prism) {

	var string = /(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/;

	Prism.languages.css = {
		'comment': /\/\*[\s\S]*?\*\//,
		'atrule': {
			pattern: /@[\w-](?:[^;{\s]|\s+(?![\s{]))*(?:;|(?=\s*\{))/,
			inside: {
				'rule': /^@[\w-]+/,
				'selector-function-argument': {
					pattern: /(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/,
					lookbehind: true,
					alias: 'selector'
				},
				'keyword': {
					pattern: /(^|[^\w-])(?:and|not|only|or)(?![\w-])/,
					lookbehind: true
				}
				// See rest below
			}
		},
		'url': {
			// https://drafts.csswg.org/css-values-3/#urls
			pattern: RegExp('\\burl\\((?:' + string.source + '|' + /(?:[^\\\r\n()"']|\\[\s\S])*/.source + ')\\)', 'i'),
			greedy: true,
			inside: {
				'function': /^url/i,
				'punctuation': /^\(|\)$/,
				'string': {
					pattern: RegExp('^' + string.source + '$'),
					alias: 'url'
				}
			}
		},
		'selector': {
			pattern: RegExp('(^|[{}\\s])[^{}\\s](?:[^{};"\'\\s]|\\s+(?![\\s{])|' + string.source + ')*(?=\\s*\\{)'),
			lookbehind: true
		},
		'string': {
			pattern: string,
			greedy: true
		},
		'property': {
			pattern: /(^|[^-\w\xA0-\uFFFF])(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i,
			lookbehind: true
		},
		'important': /!important\b/i,
		'function': {
			pattern: /(^|[^-a-z0-9])[-a-z0-9]+(?=\()/i,
			lookbehind: true
		},
		'punctuation': /[(){};:,]/
	};

	Prism.languages.css['atrule'].inside.rest = Prism.languages.css;

	var markup = Prism.languages.markup;
	if (markup) {
		markup.tag.addInlined('style', 'css');
		markup.tag.addAttribute('style', 'css');
	}

}(Prism));


/* **********************************************
     Begin prism-clike.js
********************************************** */

Prism.languages.clike = {
	'comment': [
		{
			pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
			lookbehind: true,
			greedy: true
		},
		{
			pattern: /(^|[^\\:])\/\/.*/,
			lookbehind: true,
			greedy: true
		}
	],
	'string': {
		pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
		greedy: true
	},
	'class-name': {
		pattern: /(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,
		lookbehind: true,
		inside: {
			'punctuation': /[.\\]/
		}
	},
	'keyword': /\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/,
	'boolean': /\b(?:false|true)\b/,
	'function': /\b\w+(?=\()/,
	'number': /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
	'operator': /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
	'punctuation': /[{}[\];(),.:]/
};


/* **********************************************
     Begin prism-javascript.js
********************************************** */

Prism.languages.javascript = Prism.languages.extend('clike', {
	'class-name': [
		Prism.languages.clike['class-name'],
		{
			pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,
			lookbehind: true
		}
	],
	'keyword': [
		{
			pattern: /((?:^|\})\s*)catch\b/,
			lookbehind: true
		},
		{
			pattern: /(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
			lookbehind: true
		},
	],
	// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
	'function': /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
	'number': {
		pattern: RegExp(
			/(^|[^\w$])/.source +
			'(?:' +
			(
				// constant
				/NaN|Infinity/.source +
				'|' +
				// binary integer
				/0[bB][01]+(?:_[01]+)*n?/.source +
				'|' +
				// octal integer
				/0[oO][0-7]+(?:_[0-7]+)*n?/.source +
				'|' +
				// hexadecimal integer
				/0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source +
				'|' +
				// decimal bigint
				/\d+(?:_\d+)*n/.source +
				'|' +
				// decimal number (integer or float) but no bigint
				/(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/.source
			) +
			')' +
			/(?![\w$])/.source
		),
		lookbehind: true
	},
	'operator': /--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/
});

Prism.languages.javascript['class-name'][0].pattern = /(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/;

Prism.languages.insertBefore('javascript', 'keyword', {
	'regex': {
		pattern: RegExp(
			// lookbehind
			// eslint-disable-next-line regexp/no-dupe-characters-character-class
			/((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)/.source +
			// Regex pattern:
			// There are 2 regex patterns here. The RegExp set notation proposal added support for nested character
			// classes if the `v` flag is present. Unfortunately, nested CCs are both context-free and incompatible
			// with the only syntax, so we have to define 2 different regex patterns.
			/\//.source +
			'(?:' +
			/(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}/.source +
			'|' +
			// `v` flag syntax. This supports 3 levels of nested character classes.
			/(?:\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7}/.source +
			')' +
			// lookahead
			/(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/.source
		),
		lookbehind: true,
		greedy: true,
		inside: {
			'regex-source': {
				pattern: /^(\/)[\s\S]+(?=\/[a-z]*$)/,
				lookbehind: true,
				alias: 'language-regex',
				inside: Prism.languages.regex
			},
			'regex-delimiter': /^\/|\/$/,
			'regex-flags': /^[a-z]+$/,
		}
	},
	// This must be declared before keyword because we use "function" inside the look-forward
	'function-variable': {
		pattern: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,
		alias: 'function'
	},
	'parameter': [
		{
			pattern: /(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,
			lookbehind: true,
			inside: Prism.languages.javascript
		},
		{
			pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,
			lookbehind: true,
			inside: Prism.languages.javascript
		},
		{
			pattern: /(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,
			lookbehind: true,
			inside: Prism.languages.javascript
		},
		{
			pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,
			lookbehind: true,
			inside: Prism.languages.javascript
		}
	],
	'constant': /\b[A-Z](?:[A-Z_]|\dx?)*\b/
});

Prism.languages.insertBefore('javascript', 'string', {
	'hashbang': {
		pattern: /^#!.*/,
		greedy: true,
		alias: 'comment'
	},
	'template-string': {
		pattern: /`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,
		greedy: true,
		inside: {
			'template-punctuation': {
				pattern: /^`|`$/,
				alias: 'string'
			},
			'interpolation': {
				pattern: /((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,
				lookbehind: true,
				inside: {
					'interpolation-punctuation': {
						pattern: /^\$\{|\}$/,
						alias: 'punctuation'
					},
					rest: Prism.languages.javascript
				}
			},
			'string': /[\s\S]+/
		}
	},
	'string-property': {
		pattern: /((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,
		lookbehind: true,
		greedy: true,
		alias: 'property'
	}
});

Prism.languages.insertBefore('javascript', 'operator', {
	'literal-property': {
		pattern: /((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,
		lookbehind: true,
		alias: 'property'
	},
});

if (Prism.languages.markup) {
	Prism.languages.markup.tag.addInlined('script', 'javascript');

	// add attribute support for all DOM events.
	// https://developer.mozilla.org/en-US/docs/Web/Events#Standard_events
	Prism.languages.markup.tag.addAttribute(
		/on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source,
		'javascript'
	);
}

Prism.languages.js = Prism.languages.javascript;


/* **********************************************
     Begin prism-file-highlight.js
********************************************** */

(function () {

	if (typeof Prism === 'undefined' || typeof document === 'undefined') {
		return;
	}

	// https://developer.mozilla.org/en-US/docs/Web/API/Element/matches#Polyfill
	if (!Element.prototype.matches) {
		Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
	}

	var LOADING_MESSAGE = 'Loading…';
	var FAILURE_MESSAGE = function (status, message) {
		return '✖ Error ' + status + ' while fetching file: ' + message;
	};
	var FAILURE_EMPTY_MESSAGE = '✖ Error: File does not exist or is empty';

	var EXTENSIONS = {
		'js': 'javascript',
		'py': 'python',
		'rb': 'ruby',
		'ps1': 'powershell',
		'psm1': 'powershell',
		'sh': 'bash',
		'bat': 'batch',
		'h': 'c',
		'tex': 'latex'
	};

	var STATUS_ATTR = 'data-src-status';
	var STATUS_LOADING = 'loading';
	var STATUS_LOADED = 'loaded';
	var STATUS_FAILED = 'failed';

	var SELECTOR = 'pre[data-src]:not([' + STATUS_ATTR + '="' + STATUS_LOADED + '"])'
		+ ':not([' + STATUS_ATTR + '="' + STATUS_LOADING + '"])';

	/**
	 * Loads the given file.
	 *
	 * @param {string} src The URL or path of the source file to load.
	 * @param {(result: string) => void} success
	 * @param {(reason: string) => void} error
	 */
	function loadFile(src, success, error) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', src, true);
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {
				if (xhr.status < 400 && xhr.responseText) {
					success(xhr.responseText);
				} else {
					if (xhr.status >= 400) {
						error(FAILURE_MESSAGE(xhr.status, xhr.statusText));
					} else {
						error(FAILURE_EMPTY_MESSAGE);
					}
				}
			}
		};
		xhr.send(null);
	}

	/**
	 * Parses the given range.
	 *
	 * This returns a range with inclusive ends.
	 *
	 * @param {string | null | undefined} range
	 * @returns {[number, number | undefined] | undefined}
	 */
	function parseRange(range) {
		var m = /^\s*(\d+)\s*(?:(,)\s*(?:(\d+)\s*)?)?$/.exec(range || '');
		if (m) {
			var start = Number(m[1]);
			var comma = m[2];
			var end = m[3];

			if (!comma) {
				return [start, start];
			}
			if (!end) {
				return [start, undefined];
			}
			return [start, Number(end)];
		}
		return undefined;
	}

	Prism.hooks.add('before-highlightall', function (env) {
		env.selector += ', ' + SELECTOR;
	});

	Prism.hooks.add('before-sanity-check', function (env) {
		var pre = /** @type {HTMLPreElement} */ (env.element);
		if (pre.matches(SELECTOR)) {
			env.code = ''; // fast-path the whole thing and go to complete

			pre.setAttribute(STATUS_ATTR, STATUS_LOADING); // mark as loading

			// add code element with loading message
			var code = pre.appendChild(document.createElement('CODE'));
			code.textContent = LOADING_MESSAGE;

			var src = pre.getAttribute('data-src');

			var language = env.language;
			if (language === 'none') {
				// the language might be 'none' because there is no language set;
				// in this case, we want to use the extension as the language
				var extension = (/\.(\w+)$/.exec(src) || [, 'none'])[1];
				language = EXTENSIONS[extension] || extension;
			}

			// set language classes
			Prism.util.setLanguage(code, language);
			Prism.util.setLanguage(pre, language);

			// preload the language
			var autoloader = Prism.plugins.autoloader;
			if (autoloader) {
				autoloader.loadLanguages(language);
			}

			// load file
			loadFile(
				src,
				function (text) {
					// mark as loaded
					pre.setAttribute(STATUS_ATTR, STATUS_LOADED);

					// handle data-range
					var range = parseRange(pre.getAttribute('data-range'));
					if (range) {
						var lines = text.split(/\r\n?|\n/g);

						// the range is one-based and inclusive on both ends
						var start = range[0];
						var end = range[1] == null ? lines.length : range[1];

						if (start < 0) { start += lines.length; }
						start = Math.max(0, Math.min(start - 1, lines.length));
						if (end < 0) { end += lines.length; }
						end = Math.max(0, Math.min(end, lines.length));

						text = lines.slice(start, end).join('\n');

						// add data-start for line numbers
						if (!pre.hasAttribute('data-start')) {
							pre.setAttribute('data-start', String(start + 1));
						}
					}

					// highlight code
					code.textContent = text;
					Prism.highlightElement(code);
				},
				function (error) {
					// mark as failed
					pre.setAttribute(STATUS_ATTR, STATUS_FAILED);

					code.textContent = error;
				}
			);
		}
	});

	Prism.plugins.fileHighlight = {
		/**
		 * Executes the File Highlight plugin for all matching `pre` elements under the given container.
		 *
		 * Note: Elements which are already loaded or currently loading will not be touched by this method.
		 *
		 * @param {ParentNode} [container=document]
		 */
		highlight: function highlight(container) {
			var elements = (container || document).querySelectorAll(SELECTOR);

			for (var i = 0, element; (element = elements[i++]);) {
				Prism.highlightElement(element);
			}
		}
	};

	var logged = false;
	/** @deprecated Use `Prism.plugins.fileHighlight.highlight` instead. */
	Prism.fileHighlight = function () {
		if (!logged) {
			console.warn('Prism.fileHighlight is deprecated. Use `Prism.plugins.fileHighlight.highlight` instead.');
			logged = true;
		}
		Prism.plugins.fileHighlight.highlight.apply(this, arguments);
	};

}());
});

var css_248z$2 = "/*\n Solarized Color Schemes originally by Ethan Schoonover\n http://ethanschoonover.com/solarized\n\n Ported for PrismJS by Michael Deeb\n Website: https://michaeljdeeb.com\n Twitter Handle: https://twitter.com/michaeljdeeb)\n*/\n\n/*\nSOLARIZED HEX\n--------- -------\nbase03    #002b36\nbase02    #073642\nbase01    #586e75\nbase00    #657b83\nbase0     #839496\nbase1     #93a1a1\nbase2     #eee8d5\nbase3     #fdf6e3\nyellow    #b58900\norange    #cb4b16\nred       #dc322f\nmagenta   #d33682\nviolet    #6c71c4\nblue      #268bd2\ncyan      #2aa198\ngreen     #859900\n*/\n\ncode[class*=\"language-\"],\npre[class*=\"language-\"] {\n\tcolor: #839496; /* base0 */\n\tfont-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;\n\ttext-align: left;\n\twhite-space: pre;\n\tword-spacing: normal;\n\tword-break: normal;\n\tword-wrap: normal;\n\n\tline-height: 1.5;\n\n\t-moz-tab-size: 4;\n\t-o-tab-size: 4;\n\ttab-size: 4;\n\n\t-webkit-hyphens: none;\n\t-moz-hyphens: none;\n\t-ms-hyphens: none;\n\thyphens: none;\n}\n\npre[class*=\"language-\"]::-moz-selection, pre[class*=\"language-\"] ::-moz-selection,\ncode[class*=\"language-\"]::-moz-selection, code[class*=\"language-\"] ::-moz-selection {\n\tbackground: #073642; /* base02 */\n}\n\npre[class*=\"language-\"]::selection, pre[class*=\"language-\"] ::selection,\ncode[class*=\"language-\"]::selection, code[class*=\"language-\"] ::selection {\n\tbackground: #073642; /* base02 */\n}\n\n/* Code blocks */\npre[class*=\"language-\"] {\n\tpadding: 1em;\n\tmargin: .5em 0;\n\toverflow: auto;\n\tborder-radius: 0.3em;\n}\n\n:not(pre) > code[class*=\"language-\"],\npre[class*=\"language-\"] {\n  background: #002b36; /* base03 */\n}\n\n/* Inline code */\n:not(pre) > code[class*=\"language-\"] {\n\tpadding: .1em;\n\tborder-radius: .3em;\n}\n\n.token.attr-name,\n.token.comment,\n.token.prolog,\n.token.doctype,\n.token.cdata {\n\tcolor: #93a1a1; /* base1 */\n}\n\n.token.punctuation {\n\tcolor: #657b83; /* base00 */\n}\n\n.namespace {\n\topacity: .7;\n}\n\n.token.property,\n.token.boolean,\n.token.number,\n.token.constant,\n.token.symbol,\n.token.deleted {\n\tcolor: #d33682; /* magenta */\n}\n\n.token.attr-value,\n.token.selector,\n.token.string,\n.token.char,\n.token.builtin,\n.token.url,\n.token.inserted {\n\tcolor: #2aa198; /* cyan */\n}\n\n.token.entity {\n\tcolor: #2aa198; /* cyan */\n}\n\n.token.atrule,\n.token.keyword {\n\tcolor: #859900; /* yellow */\n}\n\n.token.tag,\n.token.function {\n\tcolor: #268bd2; /* blue */\n}\n\n.token.regex,\n.token.important,\n.token.variable {\n\tcolor: #cb4b16; /* orange */\n}\n\n.token.important,\n.token.bold {\n\tfont-weight: bold;\n}\n.token.italic {\n\tfont-style: italic;\n}\n\n.token.entity {\n\tcursor: help;\n}\n";
styleInject(css_248z$2);

!function(){if("undefined"!=typeof Prism&&"undefined"!=typeof document){var e=[],t={},n=function(){};Prism.plugins.toolbar={};var a=Prism.plugins.toolbar.registerButton=function(n,a){var r;r="function"==typeof a?a:function(e){var t;return "function"==typeof a.onClick?((t=document.createElement("button")).type="button",t.addEventListener("click",(function(){a.onClick.call(this,e);}))):"string"==typeof a.url?(t=document.createElement("a")).href=a.url:t=document.createElement("span"),a.className&&t.classList.add(a.className),t.textContent=a.text,t},n in t?console.warn('There is a button with the key "'+n+'" registered already.'):e.push(t[n]=r);},r=Prism.plugins.toolbar.hook=function(a){var r=a.element.parentNode;if(r&&/pre/i.test(r.nodeName)&&!r.parentNode.classList.contains("code-toolbar")){var o=document.createElement("div");o.classList.add("code-toolbar"),r.parentNode.insertBefore(o,r),o.appendChild(r);var i=document.createElement("div");i.classList.add("toolbar");var l=e,d=function(e){for(;e;){var t=e.getAttribute("data-toolbar-order");if(null!=t)return (t=t.trim()).length?t.split(/\s*,\s*/g):[];e=e.parentElement;}}(a.element);d&&(l=d.map((function(e){return t[e]||n}))),l.forEach((function(e){var t=e(a);if(t){var n=document.createElement("div");n.classList.add("toolbar-item"),n.appendChild(t),i.appendChild(n);}})),o.appendChild(i);}};a("label",(function(e){var t=e.element.parentNode;if(t&&/pre/i.test(t.nodeName)&&t.hasAttribute("data-label")){var n,a,r=t.getAttribute("data-label");try{a=document.querySelector("template#"+r);}catch(e){}return a?n=a.content:(t.hasAttribute("data-url")?(n=document.createElement("a")).href=t.getAttribute("data-url"):n=document.createElement("span"),n.textContent=r),n}})),Prism.hooks.add("complete",r);}}();

var css_248z$1 = "div.code-toolbar {\n\tposition: relative;\n}\n\ndiv.code-toolbar > .toolbar {\n\tposition: absolute;\n\tz-index: 10;\n\ttop: .3em;\n\tright: .2em;\n\ttransition: opacity 0.3s ease-in-out;\n\topacity: 0;\n}\n\ndiv.code-toolbar:hover > .toolbar {\n\topacity: 1;\n}\n\n/* Separate line b/c rules are thrown out if selector is invalid.\n   IE11 and old Edge versions don't support :focus-within. */\ndiv.code-toolbar:focus-within > .toolbar {\n\topacity: 1;\n}\n\ndiv.code-toolbar > .toolbar > .toolbar-item {\n\tdisplay: inline-block;\n}\n\ndiv.code-toolbar > .toolbar > .toolbar-item > a {\n\tcursor: pointer;\n}\n\ndiv.code-toolbar > .toolbar > .toolbar-item > button {\n\tbackground: none;\n\tborder: 0;\n\tcolor: inherit;\n\tfont: inherit;\n\tline-height: normal;\n\toverflow: visible;\n\tpadding: 0;\n\t-webkit-user-select: none; /* for button */\n\t-moz-user-select: none;\n\t-ms-user-select: none;\n}\n\ndiv.code-toolbar > .toolbar > .toolbar-item > a,\ndiv.code-toolbar > .toolbar > .toolbar-item > button,\ndiv.code-toolbar > .toolbar > .toolbar-item > span {\n\tcolor: #bbb;\n\tfont-size: .8em;\n\tpadding: 0 .5em;\n\tbackground: #f5f2f0;\n\tbackground: rgba(224, 224, 224, 0.2);\n\tbox-shadow: 0 2px 0 0 rgba(0,0,0,0.2);\n\tborder-radius: .5em;\n}\n\ndiv.code-toolbar > .toolbar > .toolbar-item > a:hover,\ndiv.code-toolbar > .toolbar > .toolbar-item > a:focus,\ndiv.code-toolbar > .toolbar > .toolbar-item > button:hover,\ndiv.code-toolbar > .toolbar > .toolbar-item > button:focus,\ndiv.code-toolbar > .toolbar > .toolbar-item > span:hover,\ndiv.code-toolbar > .toolbar > .toolbar-item > span:focus {\n\tcolor: inherit;\n\ttext-decoration: none;\n}\n";
styleInject(css_248z$1);

!function(){if("undefined"!=typeof Prism&&"undefined"!=typeof document)if(Prism.plugins.toolbar){var e={none:"Plain text",plain:"Plain text",plaintext:"Plain text",text:"Plain text",txt:"Plain text",html:"HTML",xml:"XML",svg:"SVG",mathml:"MathML",ssml:"SSML",rss:"RSS",css:"CSS",clike:"C-like",js:"JavaScript",abap:"ABAP",abnf:"ABNF",al:"AL",antlr4:"ANTLR4",g4:"ANTLR4",apacheconf:"Apache Configuration",apl:"APL",aql:"AQL",ino:"Arduino",arff:"ARFF",armasm:"ARM Assembly","arm-asm":"ARM Assembly",art:"Arturo",asciidoc:"AsciiDoc",adoc:"AsciiDoc",aspnet:"ASP.NET (C#)",asm6502:"6502 Assembly",asmatmel:"Atmel AVR Assembly",autohotkey:"AutoHotkey",autoit:"AutoIt",avisynth:"AviSynth",avs:"AviSynth","avro-idl":"Avro IDL",avdl:"Avro IDL",awk:"AWK",gawk:"GAWK",basic:"BASIC",bbcode:"BBcode",bnf:"BNF",rbnf:"RBNF",bsl:"BSL (1C:Enterprise)",oscript:"OneScript",csharp:"C#",cs:"C#",dotnet:"C#",cpp:"C++",cfscript:"CFScript",cfc:"CFScript",cil:"CIL",cmake:"CMake",cobol:"COBOL",coffee:"CoffeeScript",conc:"Concurnas",csp:"Content-Security-Policy","css-extras":"CSS Extras",csv:"CSV",cue:"CUE",dataweave:"DataWeave",dax:"DAX",django:"Django/Jinja2",jinja2:"Django/Jinja2","dns-zone-file":"DNS zone file","dns-zone":"DNS zone file",dockerfile:"Docker",dot:"DOT (Graphviz)",gv:"DOT (Graphviz)",ebnf:"EBNF",editorconfig:"EditorConfig",ejs:"EJS",etlua:"Embedded Lua templating",erb:"ERB","excel-formula":"Excel Formula",xlsx:"Excel Formula",xls:"Excel Formula",fsharp:"F#","firestore-security-rules":"Firestore security rules",ftl:"FreeMarker Template Language",gml:"GameMaker Language",gamemakerlanguage:"GameMaker Language",gap:"GAP (CAS)",gcode:"G-code",gdscript:"GDScript",gedcom:"GEDCOM",gettext:"gettext",po:"gettext",glsl:"GLSL",gn:"GN",gni:"GN","linker-script":"GNU Linker Script",ld:"GNU Linker Script","go-module":"Go module","go-mod":"Go module",graphql:"GraphQL",hbs:"Handlebars",hs:"Haskell",hcl:"HCL",hlsl:"HLSL",http:"HTTP",hpkp:"HTTP Public-Key-Pins",hsts:"HTTP Strict-Transport-Security",ichigojam:"IchigoJam","icu-message-format":"ICU Message Format",idr:"Idris",ignore:".ignore",gitignore:".gitignore",hgignore:".hgignore",npmignore:".npmignore",inform7:"Inform 7",javadoc:"JavaDoc",javadoclike:"JavaDoc-like",javastacktrace:"Java stack trace",jq:"JQ",jsdoc:"JSDoc","js-extras":"JS Extras",json:"JSON",webmanifest:"Web App Manifest",json5:"JSON5",jsonp:"JSONP",jsstacktrace:"JS stack trace","js-templates":"JS Templates",keepalived:"Keepalived Configure",kts:"Kotlin Script",kt:"Kotlin",kumir:"KuMir (КуМир)",kum:"KuMir (КуМир)",latex:"LaTeX",tex:"TeX",context:"ConTeXt",lilypond:"LilyPond",ly:"LilyPond",emacs:"Lisp",elisp:"Lisp","emacs-lisp":"Lisp",llvm:"LLVM IR",log:"Log file",lolcode:"LOLCODE",magma:"Magma (CAS)",md:"Markdown","markup-templating":"Markup templating",matlab:"MATLAB",maxscript:"MAXScript",mel:"MEL",mongodb:"MongoDB",moon:"MoonScript",n1ql:"N1QL",n4js:"N4JS",n4jsd:"N4JS","nand2tetris-hdl":"Nand To Tetris HDL",naniscript:"Naninovel Script",nani:"Naninovel Script",nasm:"NASM",neon:"NEON",nginx:"nginx",nsis:"NSIS",objectivec:"Objective-C",objc:"Objective-C",ocaml:"OCaml",opencl:"OpenCL",openqasm:"OpenQasm",qasm:"OpenQasm",parigp:"PARI/GP",objectpascal:"Object Pascal",psl:"PATROL Scripting Language",pcaxis:"PC-Axis",px:"PC-Axis",peoplecode:"PeopleCode",pcode:"PeopleCode",php:"PHP",phpdoc:"PHPDoc","php-extras":"PHP Extras","plant-uml":"PlantUML",plantuml:"PlantUML",plsql:"PL/SQL",powerquery:"PowerQuery",pq:"PowerQuery",mscript:"PowerQuery",powershell:"PowerShell",promql:"PromQL",properties:".properties",protobuf:"Protocol Buffers",purebasic:"PureBasic",pbfasm:"PureBasic",purs:"PureScript",py:"Python",qsharp:"Q#",qs:"Q#",q:"Q (kdb+ database)",qml:"QML",rkt:"Racket",cshtml:"Razor C#",razor:"Razor C#",jsx:"React JSX",tsx:"React TSX",renpy:"Ren'py",rpy:"Ren'py",res:"ReScript",rest:"reST (reStructuredText)",robotframework:"Robot Framework",robot:"Robot Framework",rb:"Ruby",sas:"SAS",sass:"Sass (Sass)",scss:"Sass (Scss)","shell-session":"Shell session","sh-session":"Shell session",shellsession:"Shell session",sml:"SML",smlnj:"SML/NJ",solidity:"Solidity (Ethereum)",sol:"Solidity (Ethereum)","solution-file":"Solution file",sln:"Solution file",soy:"Soy (Closure Template)",sparql:"SPARQL",rq:"SPARQL","splunk-spl":"Splunk SPL",sqf:"SQF: Status Quo Function (Arma 3)",sql:"SQL",stata:"Stata Ado",iecst:"Structured Text (IEC 61131-3)",supercollider:"SuperCollider",sclang:"SuperCollider",systemd:"Systemd configuration file","t4-templating":"T4 templating","t4-cs":"T4 Text Templates (C#)",t4:"T4 Text Templates (C#)","t4-vb":"T4 Text Templates (VB)",tap:"TAP",tt2:"Template Toolkit 2",toml:"TOML",trickle:"trickle",troy:"troy",trig:"TriG",ts:"TypeScript",tsconfig:"TSConfig",uscript:"UnrealScript",uc:"UnrealScript",uorazor:"UO Razor Script",uri:"URI",url:"URL",vbnet:"VB.Net",vhdl:"VHDL",vim:"vim","visual-basic":"Visual Basic",vba:"VBA",vb:"Visual Basic",wasm:"WebAssembly","web-idl":"Web IDL",webidl:"Web IDL",wiki:"Wiki markup",wolfram:"Wolfram language",nb:"Mathematica Notebook",wl:"Wolfram language",xeoracube:"XeoraCube","xml-doc":"XML doc (.net)",xojo:"Xojo (REALbasic)",xquery:"XQuery",yaml:"YAML",yml:"YAML",yang:"YANG"};Prism.plugins.toolbar.registerButton("show-language",(function(a){var t=a.element.parentNode;if(t&&/pre/i.test(t.nodeName)){var o,s=t.getAttribute("data-language")||e[a.language]||((o=a.language)?(o.substring(0,1).toUpperCase()+o.substring(1)).replace(/s(?=cript)/,"S"):o);if(s){var r=document.createElement("span");return r.textContent=s,r}}}));}else console.warn("Show Languages plugin loaded before Toolbar plugin.");}();

!function(){function t(t){var e=document.createElement("textarea");e.value=t.getText(),e.style.top="0",e.style.left="0",e.style.position="fixed",document.body.appendChild(e),e.focus(),e.select();try{var o=document.execCommand("copy");setTimeout((function(){o?t.success():t.error();}),1);}catch(e){setTimeout((function(){t.error(e);}),1);}document.body.removeChild(e);}"undefined"!=typeof Prism&&"undefined"!=typeof document&&(Prism.plugins.toolbar?Prism.plugins.toolbar.registerButton("copy-to-clipboard",(function(e){var o=e.element,n=function(t){var e={copy:"Copy","copy-error":"Press Ctrl+C to copy","copy-success":"Copied!","copy-timeout":5e3};for(var o in e){for(var n="data-prismjs-"+o,c=t;c&&!c.hasAttribute(n);)c=c.parentElement;c&&(e[o]=c.getAttribute(n));}return e}(o),c=document.createElement("button");c.className="copy-to-clipboard-button",c.setAttribute("type","button");var r=document.createElement("span");return c.appendChild(r),u("copy"),function(e,o){e.addEventListener("click",(function(){!function(e){navigator.clipboard?navigator.clipboard.writeText(e.getText()).then(e.success,(function(){t(e);})):t(e);}(o);}));}(c,{getText:function(){return o.textContent},success:function(){u("copy-success"),i();},error:function(){u("copy-error"),setTimeout((function(){!function(t){window.getSelection().selectAllChildren(t);}(o);}),1),i();}}),c;function i(){setTimeout((function(){u("copy");}),n["copy-timeout"]);}function u(t){r.textContent=n[t],c.setAttribute("data-copy-state",t);}})):console.warn("Copy to Clipboard plugin loaded before Toolbar plugin."));}();

!function(){if("undefined"!=typeof Prism&&"undefined"!=typeof document){var e="line-numbers",n=/\n(?!$)/g,t=Prism.plugins.lineNumbers={getLine:function(n,t){if("PRE"===n.tagName&&n.classList.contains(e)){var i=n.querySelector(".line-numbers-rows");if(i){var r=parseInt(n.getAttribute("data-start"),10)||1,s=r+(i.children.length-1);t<r&&(t=r),t>s&&(t=s);var l=t-r;return i.children[l]}}},resize:function(e){r([e]);},assumeViewportIndependence:!0},i=void 0;window.addEventListener("resize",(function(){t.assumeViewportIndependence&&i===window.innerWidth||(i=window.innerWidth,r(Array.prototype.slice.call(document.querySelectorAll("pre.line-numbers"))));})),Prism.hooks.add("complete",(function(t){if(t.code){var i=t.element,s=i.parentNode;if(s&&/pre/i.test(s.nodeName)&&!i.querySelector(".line-numbers-rows")&&Prism.util.isActive(i,e)){i.classList.remove(e),s.classList.add(e);var l,o=t.code.match(n),a=o?o.length+1:1,u=new Array(a+1).join("<span></span>");(l=document.createElement("span")).setAttribute("aria-hidden","true"),l.className="line-numbers-rows",l.innerHTML=u,s.hasAttribute("data-start")&&(s.style.counterReset="linenumber "+(parseInt(s.getAttribute("data-start"),10)-1)),t.element.appendChild(l),r([s]),Prism.hooks.run("line-numbers",t);}}})),Prism.hooks.add("line-numbers",(function(e){e.plugins=e.plugins||{},e.plugins.lineNumbers=!0;}));}function r(e){if(0!=(e=e.filter((function(e){var n,t=(n=e,n?window.getComputedStyle?getComputedStyle(n):n.currentStyle||null:null)["white-space"];return "pre-wrap"===t||"pre-line"===t}))).length){var t=e.map((function(e){var t=e.querySelector("code"),i=e.querySelector(".line-numbers-rows");if(t&&i){var r=e.querySelector(".line-numbers-sizer"),s=t.textContent.split(n);r||((r=document.createElement("span")).className="line-numbers-sizer",t.appendChild(r)),r.innerHTML="0",r.style.display="block";var l=r.getBoundingClientRect().height;return r.innerHTML="",{element:e,lines:s,lineHeights:[],oneLinerHeight:l,sizer:r}}})).filter(Boolean);t.forEach((function(e){var n=e.sizer,t=e.lines,i=e.lineHeights,r=e.oneLinerHeight;i[t.length-1]=void 0,t.forEach((function(e,t){if(e&&e.length>1){var s=n.appendChild(document.createElement("span"));s.style.display="block",s.textContent=e;}else i[t]=r;}));})),t.forEach((function(e){for(var n=e.sizer,t=e.lineHeights,i=0,r=0;r<t.length;r++)void 0===t[r]&&(t[r]=n.children[i++].getBoundingClientRect().height);})),t.forEach((function(e){var n=e.sizer,t=e.element.querySelector(".line-numbers-rows");n.style.display="none",n.innerHTML="",e.lineHeights.forEach((function(e,n){t.children[n].style.height=e+"px";}));}));}}}();

var css_248z = "pre[class*=\"language-\"].line-numbers {\n\tposition: relative;\n\tpadding-left: 3.8em;\n\tcounter-reset: linenumber;\n}\n\npre[class*=\"language-\"].line-numbers > code {\n\tposition: relative;\n\twhite-space: inherit;\n}\n\n.line-numbers .line-numbers-rows {\n\tposition: absolute;\n\tpointer-events: none;\n\ttop: 0;\n\tfont-size: 100%;\n\tleft: -3.8em;\n\twidth: 3em; /* works for line-numbers below 1000 lines */\n\tletter-spacing: -1px;\n\tborder-right: 1px solid #999;\n\n\t-webkit-user-select: none;\n\t-moz-user-select: none;\n\t-ms-user-select: none;\n\tuser-select: none;\n\n}\n\n\t.line-numbers-rows > span {\n\t\tdisplay: block;\n\t\tcounter-increment: linenumber;\n\t}\n\n\t\t.line-numbers-rows > span:before {\n\t\t\tcontent: counter(linenumber);\n\t\t\tcolor: #999;\n\t\t\tdisplay: block;\n\t\t\tpadding-right: 0.8em;\n\t\t\ttext-align: right;\n\t\t}\n";
styleInject(css_248z);

createCommonjsModule(function (module) {
!function(){if("undefined"!=typeof Prism){var e=Object.assign||function(e,n){for(var t in n)n.hasOwnProperty(t)&&(e[t]=n[t]);return e};n.prototype={setDefaults:function(n){this.defaults=e(this.defaults,n);},normalize:function(n,t){for(var r in t=e(this.defaults,t)){var i=r.replace(/-(\w)/g,(function(e,n){return n.toUpperCase()}));"normalize"!==r&&"setDefaults"!==i&&t[r]&&this[i]&&(n=this[i].call(this,n,t[r]));}return n},leftTrim:function(e){return e.replace(/^\s+/,"")},rightTrim:function(e){return e.replace(/\s+$/,"")},tabsToSpaces:function(e,n){return n=0|n||4,e.replace(/\t/g,new Array(++n).join(" "))},spacesToTabs:function(e,n){return n=0|n||4,e.replace(RegExp(" {"+n+"}","g"),"\t")},removeTrailing:function(e){return e.replace(/\s*?$/gm,"")},removeInitialLineFeed:function(e){return e.replace(/^(?:\r?\n|\r)/,"")},removeIndent:function(e){var n=e.match(/^[^\S\n\r]*(?=\S)/gm);return n&&n[0].length?(n.sort((function(e,n){return e.length-n.length})),n[0].length?e.replace(RegExp("^"+n[0],"gm"),""):e):e},indent:function(e,n){return e.replace(/^[^\S\n\r]*(?=\S)/gm,new Array(++n).join("\t")+"$&")},breakLines:function(e,n){n=!0===n?80:0|n||80;for(var r=e.split("\n"),i=0;i<r.length;++i)if(!(t(r[i])<=n)){for(var o=r[i].split(/(\s+)/g),a=0,l=0;l<o.length;++l){var s=t(o[l]);(a+=s)>n&&(o[l]="\n"+o[l],a=s);}r[i]=o.join("");}return r.join("\n")}},module.exports&&(module.exports=n),Prism.plugins.NormalizeWhitespace=new n({"remove-trailing":!0,"remove-indent":!0,"left-trim":!0,"right-trim":!0}),Prism.hooks.add("before-sanity-check",(function(e){var n=Prism.plugins.NormalizeWhitespace;if((!e.settings||!1!==e.settings["whitespace-normalization"])&&Prism.util.isActive(e.element,"whitespace-normalization",!0))if(e.element&&e.element.parentNode||!e.code){var t=e.element.parentNode;if(e.code&&t&&"pre"===t.nodeName.toLowerCase()){for(var r=t.childNodes,i="",o="",a=!1,l=0;l<r.length;++l){var s=r[l];s==e.element?a=!0:"#text"===s.nodeName&&(a?o+=s.nodeValue:i+=s.nodeValue,t.removeChild(s),--l);}if(e.element.children.length&&Prism.plugins.KeepMarkup){var c=i+e.element.innerHTML+o;e.element.innerHTML=n.normalize(c,e.settings),e.code=e.element.textContent;}else e.code=i+e.code+o,e.code=n.normalize(e.code,e.settings);}}else e.code=n.normalize(e.code,e.settings);}));}function n(n){this.defaults=e({},n);}function t(e){for(var n=0,t=0;t<e.length;++t)e.charCodeAt(t)=="\t".charCodeAt(0)&&(n+=3);return e.length+n}}();
});

/* src/components/Code.svelte generated by Svelte v3.49.0 */

function add_css$1(target) {
	append_styles(target, "svelte-2v3wzz", ".notion-code.svelte-2v3wzz{padding:30px 16px 30px 20px;margin:4px 0;tab-size:2;font-size:85%;display:block;font-family:SFMono-Regular, Consolas, 'Liberation Mono', Menlo, Courier,\n            monospace;box-sizing:border-box;overflow-x:scroll}");
}

function create_fragment$q(ctx) {
	let t0;
	let pre;
	let t1;
	let code_1;
	let t2;
	let t3;
	let t4;
	let t5;
	let pre_id_value;
	let current;
	let if_block = false ;

	return {
		c() {
			t0 = space();
			pre = element("pre");
			t1 = text("    ");
			code_1 = element("code");
			t2 = text("\n        ");
			t3 = text(/*code*/ ctx[2]);
			t4 = text("\n    ");
			t5 = text("\n");
			attr(code_1, "class", "" + (null_to_empty(`language-${/*language*/ ctx[3].toLowerCase()}`) + " svelte-2v3wzz"));
			attr(pre, "id", pre_id_value = `_block-${/*block*/ ctx[0].id}`);
			attr(pre, "class", "line-numbers notion-code svelte-2v3wzz");
		},
		m(target, anchor) {
			insert(target, t0, anchor);
			insert(target, pre, anchor);
			append(pre, t1);
			append(pre, code_1);
			append(code_1, t2);
			append(code_1, t3);
			append(code_1, t4);
			/*code_1_binding*/ ctx[9](code_1);
			append(pre, t5);
			current = true;
		},
		p(ctx, [dirty]) {

			if (!current || dirty & /*block*/ 1 && pre_id_value !== (pre_id_value = `_block-${/*block*/ ctx[0].id}`)) {
				attr(pre, "id", pre_id_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(t0);
			if (detaching) detach(pre);
			/*code_1_binding*/ ctx[9](null);
		}
	};
}

function instance$q($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { block = {} } = $$props;
	let { blocks = [] } = $$props;
	let { fullPage = null } = $$props;
	let { api = null } = $$props;
	let highlight;
	const code = getTextContent(block);

	const language = block.properties
	? block.properties.language[0][0]
	: 'javascript';

	onMount(() => {
		prism.highlightElement(highlight);
	});

	function code_1_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			highlight = $$value;
			$$invalidate(1, highlight);
		});
	}

	$$self.$$set = $$props => {
		if ('block' in $$props) $$invalidate(0, block = $$props.block);
		if ('blocks' in $$props) $$invalidate(4, blocks = $$props.blocks);
		if ('fullPage' in $$props) $$invalidate(5, fullPage = $$props.fullPage);
		if ('api' in $$props) $$invalidate(6, api = $$props.api);
		if ('$$scope' in $$props) $$invalidate(7, $$scope = $$props.$$scope);
	};

	return [
		block,
		highlight,
		code,
		language,
		blocks,
		fullPage,
		api,
		$$scope,
		slots,
		code_1_binding
	];
}

class Code extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$q, create_fragment$q, safe_not_equal, { block: 0, blocks: 4, fullPage: 5, api: 6 }, add_css$1);
	}
}

/* src/components/Column.svelte generated by Svelte v3.49.0 */

function create_fragment$p(ctx) {
	let div0;
	let div0_id_value;
	let t;
	let div1;
	let current;
	const default_slot_template = /*#slots*/ ctx[6].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

	return {
		c() {
			div0 = element("div");
			if (default_slot) default_slot.c();
			t = space();
			div1 = element("div");
			attr(div0, "id", div0_id_value = `_block-${/*block*/ ctx[0].id}`);
			attr(div0, "class", "notion-column");
			attr(div0, "style", `width: ${/*width*/ ctx[1]}`);
			attr(div1, "class", "notion-spacer");
			attr(div1, "style", `width: var(--column-spacing)`);
		},
		m(target, anchor) {
			insert(target, div0, anchor);

			if (default_slot) {
				default_slot.m(div0, null);
			}

			insert(target, t, anchor);
			insert(target, div1, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[5],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
						null
					);
				}
			}

			if (!current || dirty & /*block*/ 1 && div0_id_value !== (div0_id_value = `_block-${/*block*/ ctx[0].id}`)) {
				attr(div0, "id", div0_id_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div0);
			if (default_slot) default_slot.d(detaching);
			if (detaching) detach(t);
			if (detaching) detach(div1);
		}
	};
}

function instance$p($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { block = {} } = $$props;
	let { blocks = [] } = $$props;
	let { fullPage = false } = $$props;
	let { api } = $$props;
	const ratio = block.format ? block.format.column_ratio : 1;
	Number((1 / ratio).toFixed(0));

	// const spacerTotalWidth = (columns - 1) * spacerWidth
	const width = `calc((100% - var(--column-spacing)) * ${ratio})`;

	$$self.$$set = $$props => {
		if ('block' in $$props) $$invalidate(0, block = $$props.block);
		if ('blocks' in $$props) $$invalidate(2, blocks = $$props.blocks);
		if ('fullPage' in $$props) $$invalidate(3, fullPage = $$props.fullPage);
		if ('api' in $$props) $$invalidate(4, api = $$props.api);
		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
	};

	return [block, width, blocks, fullPage, api, $$scope, slots];
}

class Column extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$p, create_fragment$p, safe_not_equal, { block: 0, blocks: 2, fullPage: 3, api: 4 });
	}
}

/* src/components/ColumnList.svelte generated by Svelte v3.49.0 */

function create_fragment$o(ctx) {
	let div;
	let div_id_value;
	let current;
	const default_slot_template = /*#slots*/ ctx[5].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

	return {
		c() {
			div = element("div");
			if (default_slot) default_slot.c();
			attr(div, "id", div_id_value = `_block-${/*block*/ ctx[0].id}`);
			attr(div, "class", "notion-row");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			if (default_slot) {
				default_slot.m(div, null);
			}

			current = true;
		},
		p(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[4],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
						null
					);
				}
			}

			if (!current || dirty & /*block*/ 1 && div_id_value !== (div_id_value = `_block-${/*block*/ ctx[0].id}`)) {
				attr(div, "id", div_id_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (default_slot) default_slot.d(detaching);
		}
	};
}

function instance$o($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { block = {} } = $$props;
	let { blocks = [] } = $$props;
	let { fullPage = false } = $$props;
	let { api = null } = $$props;

	$$self.$$set = $$props => {
		if ('block' in $$props) $$invalidate(0, block = $$props.block);
		if ('blocks' in $$props) $$invalidate(1, blocks = $$props.blocks);
		if ('fullPage' in $$props) $$invalidate(2, fullPage = $$props.fullPage);
		if ('api' in $$props) $$invalidate(3, api = $$props.api);
		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
	};

	return [block, blocks, fullPage, api, $$scope, slots];
}

class ColumnList extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$o, create_fragment$o, safe_not_equal, { block: 0, blocks: 1, fullPage: 2, api: 3 });
	}
}

/* src/components/Divider.svelte generated by Svelte v3.49.0 */

function create_fragment$n(ctx) {
	let t;
	let hr;
	let hr_id_value;
	let current;
	let if_block = false ;

	return {
		c() {
			t = space();
			hr = element("hr");
			attr(hr, "id", hr_id_value = `_block-${/*block*/ ctx[0].id}`);
			attr(hr, "class", "notion-hr");
		},
		m(target, anchor) {
			insert(target, t, anchor);
			insert(target, hr, anchor);
			current = true;
		},
		p(ctx, [dirty]) {

			if (!current || dirty & /*block*/ 1 && hr_id_value !== (hr_id_value = `_block-${/*block*/ ctx[0].id}`)) {
				attr(hr, "id", hr_id_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(t);
			if (detaching) detach(hr);
		}
	};
}

function instance$n($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { block = {} } = $$props;
	let { blocks = [] } = $$props;
	let { fullPage = false } = $$props;
	let { api = null } = $$props;

	$$self.$$set = $$props => {
		if ('block' in $$props) $$invalidate(0, block = $$props.block);
		if ('blocks' in $$props) $$invalidate(1, blocks = $$props.blocks);
		if ('fullPage' in $$props) $$invalidate(2, fullPage = $$props.fullPage);
		if ('api' in $$props) $$invalidate(3, api = $$props.api);
		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
	};

	return [block, blocks, fullPage, api, $$scope, slots];
}

class Divider extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$n, create_fragment$n, safe_not_equal, { block: 0, blocks: 1, fullPage: 2, api: 3 });
	}
}

/* src/components/Embed.svelte generated by Svelte v3.49.0 */

// (89:0) {:else}
function create_else_block$e(ctx) {
	let figure;
	let div;
	let iframe;
	let iframe_src_value;
	let div_style_value;
	let t;
	let figure_id_value;
	let current;
	let if_block = /*block*/ ctx[0].properties.caption && create_if_block_1$e(ctx);

	return {
		c() {
			figure = element("figure");
			div = element("div");
			iframe = element("iframe");
			t = space();
			if (if_block) if_block.c();
			attr(iframe, "class", "notion-image-inset");
			if (!src_url_equal(iframe.src, iframe_src_value = /*display_source*/ ctx[1])) attr(iframe, "src", iframe_src_value);
			attr(iframe, "title", /*alt*/ ctx[7]);
			attr(div, "style", div_style_value = `padding-bottom: ${/*frame_height*/ ctx[3]}; position: relative`);
			attr(figure, "id", figure_id_value = `_block-${/*block*/ ctx[0].id}`);
			attr(figure, "class", "notion-asset-wrapper notion-embed");
			attr(figure, "style", `width: ${/*block_width*/ ctx[6]}px`);
		},
		m(target, anchor) {
			insert(target, figure, anchor);
			append(figure, div);
			append(div, iframe);
			/*iframe_binding*/ ctx[14](iframe);
			append(figure, t);
			if (if_block) if_block.m(figure, null);
			current = true;
		},
		p(ctx, dirty) {
			if (!current || dirty & /*display_source*/ 2 && !src_url_equal(iframe.src, iframe_src_value = /*display_source*/ ctx[1])) {
				attr(iframe, "src", iframe_src_value);
			}

			if (!current || dirty & /*frame_height*/ 8 && div_style_value !== (div_style_value = `padding-bottom: ${/*frame_height*/ ctx[3]}; position: relative`)) {
				attr(div, "style", div_style_value);
			}

			if (/*block*/ ctx[0].properties.caption) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*block*/ 1) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block_1$e(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(figure, null);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}

			if (!current || dirty & /*block*/ 1 && figure_id_value !== (figure_id_value = `_block-${/*block*/ ctx[0].id}`)) {
				attr(figure, "id", figure_id_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(figure);
			/*iframe_binding*/ ctx[14](null);
			if (if_block) if_block.d();
		}
	};
}

// (81:0) {#if block.type == 'file'}
function create_if_block$h(ctx) {
	let div;
	let a;
	let t;
	let div_id_value;

	return {
		c() {
			div = element("div");
			a = element("a");
			t = text(/*filename*/ ctx[4]);
			attr(a, "href", /*display_source*/ ctx[1]);
			attr(a, "alt", "download file");
			attr(div, "id", div_id_value = `_block-${/*block*/ ctx[0].id}`);
			attr(div, "class", "notion-file");
			attr(div, "style", `padding-bottom: ${/*block_height*/ ctx[5] / /*block_width*/ ctx[6] * 100}%; position: relative`);
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, a);
			append(a, t);
		},
		p(ctx, dirty) {
			if (dirty & /*filename*/ 16) set_data(t, /*filename*/ ctx[4]);

			if (dirty & /*display_source*/ 2) {
				attr(a, "href", /*display_source*/ ctx[1]);
			}

			if (dirty & /*block*/ 1 && div_id_value !== (div_id_value = `_block-${/*block*/ ctx[0].id}`)) {
				attr(div, "id", div_id_value);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (102:4) {#if block.properties.caption}
function create_if_block_1$e(ctx) {
	let figcaption;
	let formattedtext;
	let current;
	formattedtext = new FormattedText({ props: { block: /*block*/ ctx[0] } });

	return {
		c() {
			figcaption = element("figcaption");
			create_component(formattedtext.$$.fragment);
			attr(figcaption, "class", "notion-image-caption");
		},
		m(target, anchor) {
			insert(target, figcaption, anchor);
			mount_component(formattedtext, figcaption, null);
			current = true;
		},
		p(ctx, dirty) {
			const formattedtext_changes = {};
			if (dirty & /*block*/ 1) formattedtext_changes.block = /*block*/ ctx[0];
			formattedtext.$set(formattedtext_changes);
		},
		i(local) {
			if (current) return;
			transition_in(formattedtext.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formattedtext.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(figcaption);
			destroy_component(formattedtext);
		}
	};
}

function create_fragment$m(ctx) {
	let t;
	let current_block_type_index;
	let if_block1;
	let if_block1_anchor;
	let current;
	let if_block0 = false ;
	const if_block_creators = [create_if_block$h, create_else_block$e];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*block*/ ctx[0].type == 'file') return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			t = space();
			if_block1.c();
			if_block1_anchor = empty();
		},
		m(target, anchor) {
			insert(target, t, anchor);
			if_blocks[current_block_type_index].m(target, anchor);
			insert(target, if_block1_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block1 = if_blocks[current_block_type_index];

				if (!if_block1) {
					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block1.c();
				} else {
					if_block1.p(ctx, dirty);
				}

				transition_in(if_block1, 1);
				if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block1);
			current = true;
		},
		o(local) {
			transition_out(if_block0);
			transition_out(if_block1);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(t);
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach(if_block1_anchor);
		}
	};
}

function instance$m($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { block = {} } = $$props;
	let { blocks = [] } = $$props;
	let { fullPage = false } = $$props;
	let { api = null } = $$props;
	let { siteSrc } = $$props;
	const format = block.format ? block.format : null;
	let { block_height, block_width, display_source } = format ? format : {};

	let frame,
		// frame_height = (block_height / block_width) * 100 + '%' // doesn't seem to work well for forms in mobile / narrow views
		frame_height = block_height + "px";

	// if embedded sends a postMessage for height, use that
	if (browser) {
		window.addEventListener(
			"message",
			event => {
				// console.log('event????:', event.origin, display_source, display_source.includes(event.origin), event.data, event.data[1])
				if (display_source.includes(event.origin)) {
					// make sure it's the embedded site's event
					// get an array of [outerW, outerH, clientW, clientH]
					// console.log('event:', event.origin, display_source, event.data, event.data[1])
					if (Array.isArray(event.data) && event.data[3]) $$invalidate(3, frame_height = event.data[3] + "px"); // event.data should be
					// event.data[1] / event.data[0] * 100
				}
			},
			false
		); // event.data should be
	}

	const alt = block.properties && block.properties.caption
	? block.properties.caption[0][0]
	: "";

	block.properties && block.properties.source
	? toNotionImageUrl(block.properties.source[0][0], block.id, siteSrc)
	: block.properties.source[0][0];

	let url, filename;

	if (block.properties && block.properties.source && block.type == "file") {
		url = new URL(block.properties.source[0][0]);
		filename = url.pathname.substring(url.pathname.lastIndexOf("/") + 1);
	}

	if (!display_source && browser) {
		get();
	}

	// embed is a file, not an image
	async function get() {
		fetch(`${api}/v1/asset?url=${block.properties.source[0][0]}&blockId=${block.id}`).then(res => res.json()).then(json => {
			if (json["signedUrls"] && json["signedUrls"][0]) $$invalidate(1, display_source = json["signedUrls"][0]);
			console.log("src url:", url, filename);
			return json;
		});
	}

	function iframe_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			frame = $$value;
			$$invalidate(2, frame);
		});
	}

	$$self.$$set = $$props => {
		if ('block' in $$props) $$invalidate(0, block = $$props.block);
		if ('blocks' in $$props) $$invalidate(8, blocks = $$props.blocks);
		if ('fullPage' in $$props) $$invalidate(9, fullPage = $$props.fullPage);
		if ('api' in $$props) $$invalidate(10, api = $$props.api);
		if ('siteSrc' in $$props) $$invalidate(11, siteSrc = $$props.siteSrc);
		if ('$$scope' in $$props) $$invalidate(12, $$scope = $$props.$$scope);
	};

	return [
		block,
		display_source,
		frame,
		frame_height,
		filename,
		block_height,
		block_width,
		alt,
		blocks,
		fullPage,
		api,
		siteSrc,
		$$scope,
		slots,
		iframe_binding
	];
}

class Embed extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$m, create_fragment$m, safe_not_equal, {
			block: 0,
			blocks: 8,
			fullPage: 9,
			api: 10,
			siteSrc: 11
		});
	}
}

/* src/components/Header.svelte generated by Svelte v3.49.0 */

function create_fragment$l(ctx) {
	let t;
	let h2;
	let formattedtext;
	let h2_id_value;
	let current;
	let if_block = false ;
	formattedtext = new FormattedText({ props: { block: /*block*/ ctx[0] } });

	return {
		c() {
			t = space();
			h2 = element("h2");
			create_component(formattedtext.$$.fragment);
			attr(h2, "id", h2_id_value = `_block-${/*block*/ ctx[0].id}`);
			attr(h2, "class", "notion-h1");
		},
		m(target, anchor) {
			insert(target, t, anchor);
			insert(target, h2, anchor);
			mount_component(formattedtext, h2, null);
			current = true;
		},
		p(ctx, [dirty]) {
			const formattedtext_changes = {};
			if (dirty & /*block*/ 1) formattedtext_changes.block = /*block*/ ctx[0];
			formattedtext.$set(formattedtext_changes);

			if (!current || dirty & /*block*/ 1 && h2_id_value !== (h2_id_value = `_block-${/*block*/ ctx[0].id}`)) {
				attr(h2, "id", h2_id_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			transition_in(formattedtext.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			transition_out(formattedtext.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(t);
			if (detaching) detach(h2);
			destroy_component(formattedtext);
		}
	};
}

function instance$l($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { block = {} } = $$props;
	let { blocks = [] } = $$props;
	let { fullPage = false } = $$props;
	let { api = null } = $$props;

	$$self.$$set = $$props => {
		if ('block' in $$props) $$invalidate(0, block = $$props.block);
		if ('blocks' in $$props) $$invalidate(1, blocks = $$props.blocks);
		if ('fullPage' in $$props) $$invalidate(2, fullPage = $$props.fullPage);
		if ('api' in $$props) $$invalidate(3, api = $$props.api);
		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
	};

	return [block, blocks, fullPage, api, $$scope, slots];
}

class Header extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$l, create_fragment$l, safe_not_equal, { block: 0, blocks: 1, fullPage: 2, api: 3 });
	}
}

/* src/components/Image.svelte generated by Svelte v3.49.0 */

// (4:0) {#if format}
function create_if_block$g(ctx) {
	let figure;
	let t;
	let figure_id_value;
	let figure_class_value;
	let figure_resize_listener;
	let current;

	function select_block_type(ctx, dirty) {
		if (/*block_aspect_ratio*/ ctx[3]) return create_if_block_2$b;
		return create_else_block$d;
	}

	let current_block_type = select_block_type(ctx);
	let if_block0 = current_block_type(ctx);
	let if_block1 = /*block*/ ctx[0].properties.caption && create_if_block_1$d(ctx);

	return {
		c() {
			figure = element("figure");
			if_block0.c();
			t = space();
			if (if_block1) if_block1.c();
			attr(figure, "id", figure_id_value = `_block-${/*block*/ ctx[0].id}`);

			attr(figure, "class", figure_class_value = "notion-asset-wrapper notion-image " + (/*block_width*/ ctx[4] > /*width*/ ctx[1]
			? 'notion-image-fullwidth'
			: ''));

			attr(figure, "style", `width: ${/*block_width*/ ctx[4]}px`);
			add_render_callback(() => /*figure_elementresize_handler*/ ctx[13].call(figure));
		},
		m(target, anchor) {
			insert(target, figure, anchor);
			if_block0.m(figure, null);
			append(figure, t);
			if (if_block1) if_block1.m(figure, null);
			figure_resize_listener = add_resize_listener(figure, /*figure_elementresize_handler*/ ctx[13].bind(figure));
			current = true;
		},
		p(ctx, dirty) {
			if_block0.p(ctx, dirty);

			if (/*block*/ ctx[0].properties.caption) {
				if (if_block1) {
					if_block1.p(ctx, dirty);

					if (dirty & /*block*/ 1) {
						transition_in(if_block1, 1);
					}
				} else {
					if_block1 = create_if_block_1$d(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(figure, null);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}

			if (!current || dirty & /*block*/ 1 && figure_id_value !== (figure_id_value = `_block-${/*block*/ ctx[0].id}`)) {
				attr(figure, "id", figure_id_value);
			}

			if (!current || dirty & /*width*/ 2 && figure_class_value !== (figure_class_value = "notion-asset-wrapper notion-image " + (/*block_width*/ ctx[4] > /*width*/ ctx[1]
			? 'notion-image-fullwidth'
			: ''))) {
				attr(figure, "class", figure_class_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block1);
			current = true;
		},
		o(local) {
			transition_out(if_block1);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(figure);
			if_block0.d();
			if (if_block1) if_block1.d();
			figure_resize_listener();
		}
	};
}

// (14:8) {:else}
function create_else_block$d(ctx) {
	let img;
	let img_src_value;

	return {
		c() {
			img = element("img");
			attr(img, "alt", /*alt*/ ctx[5]);
			if (!src_url_equal(img.src, img_src_value = /*src*/ ctx[6])) attr(img, "src", img_src_value);
			attr(img, "loading", "lazy");
		},
		m(target, anchor) {
			insert(target, img, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(img);
		}
	};
}

// (10:8) {#if block_aspect_ratio}
function create_if_block_2$b(ctx) {
	let img;
	let img_src_value;

	return {
		c() {
			img = element("img");
			attr(img, "class", "notion-image-inset");
			attr(img, "alt", /*alt*/ ctx[5]);
			if (!src_url_equal(img.src, img_src_value = /*src*/ ctx[6])) attr(img, "src", img_src_value);
			attr(img, "loading", "lazy");
		},
		m(target, anchor) {
			insert(target, img, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(img);
		}
	};
}

// (15:8) {#if block.properties.caption}
function create_if_block_1$d(ctx) {
	let figcaption;
	let formattedtext;
	let current;
	formattedtext = new FormattedText({ props: { block: /*block*/ ctx[0] } });

	return {
		c() {
			figcaption = element("figcaption");
			create_component(formattedtext.$$.fragment);
			attr(figcaption, "class", "notion-image-caption");
		},
		m(target, anchor) {
			insert(target, figcaption, anchor);
			mount_component(formattedtext, figcaption, null);
			current = true;
		},
		p(ctx, dirty) {
			const formattedtext_changes = {};
			if (dirty & /*block*/ 1) formattedtext_changes.block = /*block*/ ctx[0];
			formattedtext.$set(formattedtext_changes);
		},
		i(local) {
			if (current) return;
			transition_in(formattedtext.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formattedtext.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(figcaption);
			destroy_component(formattedtext);
		}
	};
}

function create_fragment$k(ctx) {
	let t;
	let if_block1_anchor;
	let current;
	let if_block0 = false ;
	let if_block1 = /*format*/ ctx[2] && create_if_block$g(ctx);

	return {
		c() {
			t = space();
			if (if_block1) if_block1.c();
			if_block1_anchor = empty();
		},
		m(target, anchor) {
			insert(target, t, anchor);
			if (if_block1) if_block1.m(target, anchor);
			insert(target, if_block1_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			if (/*format*/ ctx[2]) if_block1.p(ctx, dirty);
		},
		i(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block1);
			current = true;
		},
		o(local) {
			transition_out(if_block0);
			transition_out(if_block1);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(t);
			if (if_block1) if_block1.d(detaching);
			if (detaching) detach(if_block1_anchor);
		}
	};
}

function instance$k($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { block = {} } = $$props;
	let { blocks = [] } = $$props;
	let { fullPage = false } = $$props;
	let { api = null } = $$props;
	let { siteSrc } = $$props;
	if (block.properties.title) block.properties.title = null; // notion sometimes adds "untitled" as the title, which we don't need
	const format = block.format ? block.format : null;
	const { block_aspect_ratio, block_width } = format ? format : {};

	const alt = block.properties.caption
	? block.properties.caption[0][0]
	: '';

	let src = block.properties.source
	? toNotionImageUrl(block.properties.source[0][0], block.id, siteSrc)
	: '';

	let width;

	function figure_elementresize_handler() {
		width = this.clientWidth;
		$$invalidate(1, width);
	}

	$$self.$$set = $$props => {
		if ('block' in $$props) $$invalidate(0, block = $$props.block);
		if ('blocks' in $$props) $$invalidate(7, blocks = $$props.blocks);
		if ('fullPage' in $$props) $$invalidate(8, fullPage = $$props.fullPage);
		if ('api' in $$props) $$invalidate(9, api = $$props.api);
		if ('siteSrc' in $$props) $$invalidate(10, siteSrc = $$props.siteSrc);
		if ('$$scope' in $$props) $$invalidate(11, $$scope = $$props.$$scope);
	};

	return [
		block,
		width,
		format,
		block_aspect_ratio,
		block_width,
		alt,
		src,
		blocks,
		fullPage,
		api,
		siteSrc,
		$$scope,
		slots,
		figure_elementresize_handler
	];
}

class Image extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$k, create_fragment$k, safe_not_equal, {
			block: 0,
			blocks: 7,
			fullPage: 8,
			api: 9,
			siteSrc: 10
		});
	}
}

/* src/components/NumberedList.svelte generated by Svelte v3.49.0 */

function create_else_block$c(ctx) {
	let t;
	let if_block1_anchor;
	let current;
	let if_block0 = /*block*/ ctx[0].properties && create_if_block_4$3(ctx);
	let if_block1 = /*block*/ ctx[0].content && create_if_block_3$5(ctx);

	return {
		c() {
			if (if_block0) if_block0.c();
			t = space();
			if (if_block1) if_block1.c();
			if_block1_anchor = empty();
		},
		m(target, anchor) {
			if (if_block0) if_block0.m(target, anchor);
			insert(target, t, anchor);
			if (if_block1) if_block1.m(target, anchor);
			insert(target, if_block1_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if (/*block*/ ctx[0].properties) {
				if (if_block0) {
					if_block0.p(ctx, dirty);

					if (dirty & /*block*/ 1) {
						transition_in(if_block0, 1);
					}
				} else {
					if_block0 = create_if_block_4$3(ctx);
					if_block0.c();
					transition_in(if_block0, 1);
					if_block0.m(t.parentNode, t);
				}
			} else if (if_block0) {
				group_outros();

				transition_out(if_block0, 1, 1, () => {
					if_block0 = null;
				});

				check_outros();
			}

			if (/*block*/ ctx[0].content) {
				if (if_block1) {
					if_block1.p(ctx, dirty);

					if (dirty & /*block*/ 1) {
						transition_in(if_block1, 1);
					}
				} else {
					if_block1 = create_if_block_3$5(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block1);
			current = true;
		},
		o(local) {
			transition_out(if_block0);
			transition_out(if_block1);
			current = false;
		},
		d(detaching) {
			if (if_block0) if_block0.d(detaching);
			if (detaching) detach(t);
			if (if_block1) if_block1.d(detaching);
			if (detaching) detach(if_block1_anchor);
		}
	};
}

// (1:0) {#if isTopLevel(block, blocks)}
function create_if_block$f(ctx) {
	let ol;
	let t;
	let ol_id_value;
	let current;
	let if_block0 = /*block*/ ctx[0].properties && create_if_block_2$a(ctx);
	let if_block1 = /*block*/ ctx[0].content && create_if_block_1$c(ctx);

	return {
		c() {
			ol = element("ol");
			if (if_block0) if_block0.c();
			t = space();
			if (if_block1) if_block1.c();
			attr(ol, "id", ol_id_value = `_block-${/*block*/ ctx[0].id}`);
			attr(ol, "start", /*start*/ ctx[2]);
			attr(ol, "class", "notion-list notion-list-numbered");
		},
		m(target, anchor) {
			insert(target, ol, anchor);
			if (if_block0) if_block0.m(ol, null);
			append(ol, t);
			if (if_block1) if_block1.m(ol, null);
			current = true;
		},
		p(ctx, dirty) {
			if (/*block*/ ctx[0].properties) {
				if (if_block0) {
					if_block0.p(ctx, dirty);

					if (dirty & /*block*/ 1) {
						transition_in(if_block0, 1);
					}
				} else {
					if_block0 = create_if_block_2$a(ctx);
					if_block0.c();
					transition_in(if_block0, 1);
					if_block0.m(ol, t);
				}
			} else if (if_block0) {
				group_outros();

				transition_out(if_block0, 1, 1, () => {
					if_block0 = null;
				});

				check_outros();
			}

			if (/*block*/ ctx[0].content) {
				if (if_block1) {
					if_block1.p(ctx, dirty);

					if (dirty & /*block*/ 1) {
						transition_in(if_block1, 1);
					}
				} else {
					if_block1 = create_if_block_1$c(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(ol, null);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}

			if (!current || dirty & /*block*/ 1 && ol_id_value !== (ol_id_value = `_block-${/*block*/ ctx[0].id}`)) {
				attr(ol, "id", ol_id_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block1);
			current = true;
		},
		o(local) {
			transition_out(if_block0);
			transition_out(if_block1);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(ol);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
		}
	};
}

// (18:4) {#if block.properties}
function create_if_block_4$3(ctx) {
	let li;
	let formattedtext;
	let li_id_value;
	let current;
	formattedtext = new FormattedText({ props: { block: /*block*/ ctx[0] } });

	return {
		c() {
			li = element("li");
			create_component(formattedtext.$$.fragment);
			attr(li, "id", li_id_value = `_block-${/*block*/ ctx[0].id}`);
		},
		m(target, anchor) {
			insert(target, li, anchor);
			mount_component(formattedtext, li, null);
			current = true;
		},
		p(ctx, dirty) {
			const formattedtext_changes = {};
			if (dirty & /*block*/ 1) formattedtext_changes.block = /*block*/ ctx[0];
			formattedtext.$set(formattedtext_changes);

			if (!current || dirty & /*block*/ 1 && li_id_value !== (li_id_value = `_block-${/*block*/ ctx[0].id}`)) {
				attr(li, "id", li_id_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(formattedtext.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formattedtext.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(li);
			destroy_component(formattedtext);
		}
	};
}

// (23:4) {#if block.content}
function create_if_block_3$5(ctx) {
	let ol;
	let ol_id_value;
	let current;
	const default_slot_template = /*#slots*/ ctx[6].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

	return {
		c() {
			ol = element("ol");
			if (default_slot) default_slot.c();
			attr(ol, "id", ol_id_value = `_block-${/*block*/ ctx[0].id}`);
			attr(ol, "start", /*start*/ ctx[2]);
			attr(ol, "class", "notion-list notion-list-numbered");
		},
		m(target, anchor) {
			insert(target, ol, anchor);

			if (default_slot) {
				default_slot.m(ol, null);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[5],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
						null
					);
				}
			}

			if (!current || dirty & /*block*/ 1 && ol_id_value !== (ol_id_value = `_block-${/*block*/ ctx[0].id}`)) {
				attr(ol, "id", ol_id_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(ol);
			if (default_slot) default_slot.d(detaching);
		}
	};
}

// (6:8) {#if block.properties}
function create_if_block_2$a(ctx) {
	let li;
	let formattedtext;
	let current;
	formattedtext = new FormattedText({ props: { block: /*block*/ ctx[0] } });

	return {
		c() {
			li = element("li");
			create_component(formattedtext.$$.fragment);
		},
		m(target, anchor) {
			insert(target, li, anchor);
			mount_component(formattedtext, li, null);
			current = true;
		},
		p(ctx, dirty) {
			const formattedtext_changes = {};
			if (dirty & /*block*/ 1) formattedtext_changes.block = /*block*/ ctx[0];
			formattedtext.$set(formattedtext_changes);
		},
		i(local) {
			if (current) return;
			transition_in(formattedtext.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formattedtext.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(li);
			destroy_component(formattedtext);
		}
	};
}

// (11:8) {#if block.content}
function create_if_block_1$c(ctx) {
	let current;
	const default_slot_template = /*#slots*/ ctx[6].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

	return {
		c() {
			if (default_slot) default_slot.c();
		},
		m(target, anchor) {
			if (default_slot) {
				default_slot.m(target, anchor);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[5],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
						null
					);
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (default_slot) default_slot.d(detaching);
		}
	};
}

function create_fragment$j(ctx) {
	let show_if;
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block$f, create_else_block$c];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (dirty & /*block, blocks*/ 3) show_if = null;
		if (show_if == null) show_if = !!isTopLevel(/*block*/ ctx[0], /*blocks*/ ctx[1]);
		if (show_if) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx, -1);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx, dirty);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				} else {
					if_block.p(ctx, dirty);
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$j($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { block = {} } = $$props;
	let { blocks = [] } = $$props;
	let { fullPage = false } = $$props;
	let { api = null } = $$props;
	const start = getListNumber(block, blocks);

	$$self.$$set = $$props => {
		if ('block' in $$props) $$invalidate(0, block = $$props.block);
		if ('blocks' in $$props) $$invalidate(1, blocks = $$props.blocks);
		if ('fullPage' in $$props) $$invalidate(3, fullPage = $$props.fullPage);
		if ('api' in $$props) $$invalidate(4, api = $$props.api);
		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
	};

	return [block, blocks, start, fullPage, api, $$scope, slots];
}

class NumberedList extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$j, create_fragment$j, safe_not_equal, { block: 0, blocks: 1, fullPage: 3, api: 4 });
	}
}

/* src/components/Page.svelte generated by Svelte v3.49.0 */

function create_else_block$b(ctx) {
	let div;
	let div_id_value;
	let current;
	const default_slot_template = /*#slots*/ ctx[11].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

	return {
		c() {
			div = element("div");
			if (default_slot) default_slot.c();
			attr(div, "id", div_id_value = `_block-${/*block*/ ctx[0].id}`);
			attr(div, "class", "notion-page");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			if (default_slot) {
				default_slot.m(div, null);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[10],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[10], dirty, null),
						null
					);
				}
			}

			if (!current || dirty & /*block*/ 1 && div_id_value !== (div_id_value = `_block-${/*block*/ ctx[0].id}`)) {
				attr(div, "id", div_id_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (default_slot) default_slot.d(detaching);
		}
	};
}

// (53:0) {#if fullPage}
function create_if_block$e(ctx) {
	let if_block_anchor;
	let current;
	let if_block = /*block*/ ctx[0].properties && create_if_block_1$b(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if (/*block*/ ctx[0].properties) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*block*/ 1) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block_1$b(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

// (54:4) {#if block.properties}
function create_if_block_1$b(ctx) {
	let div2;
	let t0;
	let div1;
	let t1;
	let div0;
	let formattedtext;
	let t2;
	let div2_id_value;
	let current;
	let if_block0 = /*page_cover*/ ctx[4] && create_if_block_3$4(ctx);
	let if_block1 = /*page_icon*/ ctx[3] && create_if_block_2$9(ctx);
	formattedtext = new FormattedText({ props: { block: /*block*/ ctx[0] } });
	const default_slot_template = /*#slots*/ ctx[11].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

	return {
		c() {
			div2 = element("div");
			if (if_block0) if_block0.c();
			t0 = space();
			div1 = element("div");
			if (if_block1) if_block1.c();
			t1 = space();
			div0 = element("div");
			create_component(formattedtext.$$.fragment);
			t2 = space();
			if (default_slot) default_slot.c();
			attr(div0, "class", "notion-title");
			attr(div1, "class", `notion-page ${!/*page_cover*/ ctx[4] && 'notion-page-offset'} ${/*page_full_width*/ ctx[5] && 'notion-full-width'} ${/*page_small_text*/ ctx[6] && 'notion-small-text'}`);
			attr(div2, "id", div2_id_value = `_block-${/*block*/ ctx[0].id}`);
			attr(div2, "class", "notion-page");
		},
		m(target, anchor) {
			insert(target, div2, anchor);
			if (if_block0) if_block0.m(div2, null);
			append(div2, t0);
			append(div2, div1);
			if (if_block1) if_block1.m(div1, null);
			append(div1, t1);
			append(div1, div0);
			mount_component(formattedtext, div0, null);
			append(div1, t2);

			if (default_slot) {
				default_slot.m(div1, null);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (/*page_cover*/ ctx[4]) if_block0.p(ctx, dirty);
			if (/*page_icon*/ ctx[3]) if_block1.p(ctx, dirty);
			const formattedtext_changes = {};
			if (dirty & /*block*/ 1) formattedtext_changes.block = /*block*/ ctx[0];
			formattedtext.$set(formattedtext_changes);

			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[10],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[10], dirty, null),
						null
					);
				}
			}

			if (!current || dirty & /*block*/ 1 && div2_id_value !== (div2_id_value = `_block-${/*block*/ ctx[0].id}`)) {
				attr(div2, "id", div2_id_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block1);
			transition_in(formattedtext.$$.fragment, local);
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(if_block1);
			transition_out(formattedtext.$$.fragment, local);
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div2);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			destroy_component(formattedtext);
			if (default_slot) default_slot.d(detaching);
		}
	};
}

// (56:12) {#if page_cover}
function create_if_block_3$4(ctx) {
	let img;
	let img_src_value;
	let img_alt_value;

	return {
		c() {
			img = element("img");
			if (!src_url_equal(img.src, img_src_value = toNotionImageUrl(/*page_cover*/ ctx[4], /*block*/ ctx[0].id, /*siteSrc*/ ctx[2]))) attr(img, "src", img_src_value);
			attr(img, "alt", img_alt_value = getTextContent(/*block*/ ctx[0]));
			attr(img, "class", "notion-page-cover");
			attr(img, "style", `object-position: center ${/*coverPosition*/ ctx[7]}%`);
		},
		m(target, anchor) {
			insert(target, img, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*block, siteSrc*/ 5 && !src_url_equal(img.src, img_src_value = toNotionImageUrl(/*page_cover*/ ctx[4], /*block*/ ctx[0].id, /*siteSrc*/ ctx[2]))) {
				attr(img, "src", img_src_value);
			}

			if (dirty & /*block*/ 1 && img_alt_value !== (img_alt_value = getTextContent(/*block*/ ctx[0]))) {
				attr(img, "alt", img_alt_value);
			}
		},
		d(detaching) {
			if (detaching) detach(img);
		}
	};
}

// (65:16) {#if page_icon}
function create_if_block_2$9(ctx) {
	let pageicon;
	let current;

	pageicon = new PageIcon({
			props: {
				class: /*page_cover*/ ctx[4]
				? 'notion-page-icon-offset'
				: undefined,
				block: /*block*/ ctx[0],
				big: true
			}
		});

	return {
		c() {
			create_component(pageicon.$$.fragment);
		},
		m(target, anchor) {
			mount_component(pageicon, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const pageicon_changes = {};
			if (dirty & /*block*/ 1) pageicon_changes.block = /*block*/ ctx[0];
			pageicon.$set(pageicon_changes);
		},
		i(local) {
			if (current) return;
			transition_in(pageicon.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(pageicon.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(pageicon, detaching);
		}
	};
}

function create_fragment$i(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block$e, create_else_block$b];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*fullPage*/ ctx[1]) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				} else {
					if_block.p(ctx, dirty);
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$i($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { block = {} } = $$props;
	let { blocks = [] } = $$props;
	let { fullPage = false } = $$props;
	let { api = undefined } = $$props;
	let { siteSrc } = $$props;
	const { page_icon, page_cover, page_cover_position, page_full_width, page_small_text } = block.format ? block.format : {};
	const coverPosition = (1 - (page_cover_position || 0.5)) * 100;

	$$self.$$set = $$props => {
		if ('block' in $$props) $$invalidate(0, block = $$props.block);
		if ('blocks' in $$props) $$invalidate(8, blocks = $$props.blocks);
		if ('fullPage' in $$props) $$invalidate(1, fullPage = $$props.fullPage);
		if ('api' in $$props) $$invalidate(9, api = $$props.api);
		if ('siteSrc' in $$props) $$invalidate(2, siteSrc = $$props.siteSrc);
		if ('$$scope' in $$props) $$invalidate(10, $$scope = $$props.$$scope);
	};

	return [
		block,
		fullPage,
		siteSrc,
		page_icon,
		page_cover,
		page_full_width,
		page_small_text,
		coverPosition,
		blocks,
		api,
		$$scope,
		slots
	];
}

class Page extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$i, create_fragment$i, safe_not_equal, {
			block: 0,
			blocks: 8,
			fullPage: 1,
			api: 9,
			siteSrc: 2
		});
	}
}

/* src/components/Quote.svelte generated by Svelte v3.49.0 */

function create_fragment$h(ctx) {
	let t0;
	let blockquote;
	let formattedtext;
	let t1;
	let div;
	let blockquote_id_value;
	let current;
	let if_block = false ;
	formattedtext = new FormattedText({ props: { block: /*block*/ ctx[0] } });
	const default_slot_template = /*#slots*/ ctx[5].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

	return {
		c() {
			t0 = space();
			blockquote = element("blockquote");
			create_component(formattedtext.$$.fragment);
			t1 = space();
			div = element("div");
			if (default_slot) default_slot.c();
			attr(div, "class", "notion-callout-children");
			attr(blockquote, "id", blockquote_id_value = `_block-${/*block*/ ctx[0].id}`);
			attr(blockquote, "class", "notion-quote");
		},
		m(target, anchor) {
			insert(target, t0, anchor);
			insert(target, blockquote, anchor);
			mount_component(formattedtext, blockquote, null);
			append(blockquote, t1);
			append(blockquote, div);

			if (default_slot) {
				default_slot.m(div, null);
			}

			current = true;
		},
		p(ctx, [dirty]) {
			const formattedtext_changes = {};
			if (dirty & /*block*/ 1) formattedtext_changes.block = /*block*/ ctx[0];
			formattedtext.$set(formattedtext_changes);

			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[4],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
						null
					);
				}
			}

			if (!current || dirty & /*block*/ 1 && blockquote_id_value !== (blockquote_id_value = `_block-${/*block*/ ctx[0].id}`)) {
				attr(blockquote, "id", blockquote_id_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			transition_in(formattedtext.$$.fragment, local);
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			transition_out(formattedtext.$$.fragment, local);
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(t0);
			if (detaching) detach(blockquote);
			destroy_component(formattedtext);
			if (default_slot) default_slot.d(detaching);
		}
	};
}

function instance$h($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { block = {} } = $$props;
	let { blocks = [] } = $$props;
	let { fullPage = false } = $$props;
	let { api = null } = $$props;

	$$self.$$set = $$props => {
		if ('block' in $$props) $$invalidate(0, block = $$props.block);
		if ('blocks' in $$props) $$invalidate(1, blocks = $$props.blocks);
		if ('fullPage' in $$props) $$invalidate(2, fullPage = $$props.fullPage);
		if ('api' in $$props) $$invalidate(3, api = $$props.api);
		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
	};

	return [block, blocks, fullPage, api, $$scope, slots];
}

class Quote extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$h, create_fragment$h, safe_not_equal, { block: 0, blocks: 1, fullPage: 2, api: 3 });
	}
}

/* src/components/SubHeader.svelte generated by Svelte v3.49.0 */

function create_fragment$g(ctx) {
	let t;
	let h3;
	let formattedtext;
	let h3_id_value;
	let current;
	let if_block = false ;
	formattedtext = new FormattedText({ props: { block: /*block*/ ctx[0] } });

	return {
		c() {
			t = space();
			h3 = element("h3");
			create_component(formattedtext.$$.fragment);
			attr(h3, "id", h3_id_value = `_block-${/*block*/ ctx[0].id}`);
			attr(h3, "class", "notion-h2");
		},
		m(target, anchor) {
			insert(target, t, anchor);
			insert(target, h3, anchor);
			mount_component(formattedtext, h3, null);
			current = true;
		},
		p(ctx, [dirty]) {
			const formattedtext_changes = {};
			if (dirty & /*block*/ 1) formattedtext_changes.block = /*block*/ ctx[0];
			formattedtext.$set(formattedtext_changes);

			if (!current || dirty & /*block*/ 1 && h3_id_value !== (h3_id_value = `_block-${/*block*/ ctx[0].id}`)) {
				attr(h3, "id", h3_id_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			transition_in(formattedtext.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			transition_out(formattedtext.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(t);
			if (detaching) detach(h3);
			destroy_component(formattedtext);
		}
	};
}

function instance$g($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { block = {} } = $$props;
	let { blocks = [] } = $$props;
	let { fullPage = null } = $$props;
	let { api = null } = $$props;

	$$self.$$set = $$props => {
		if ('block' in $$props) $$invalidate(0, block = $$props.block);
		if ('blocks' in $$props) $$invalidate(1, blocks = $$props.blocks);
		if ('fullPage' in $$props) $$invalidate(2, fullPage = $$props.fullPage);
		if ('api' in $$props) $$invalidate(3, api = $$props.api);
		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
	};

	return [block, blocks, fullPage, api, $$scope, slots];
}

class SubHeader extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$g, create_fragment$g, safe_not_equal, { block: 0, blocks: 1, fullPage: 2, api: 3 });
	}
}

/* src/components/SubSubHeader.svelte generated by Svelte v3.49.0 */

function create_fragment$f(ctx) {
	let t;
	let h4;
	let formattedtext;
	let h4_id_value;
	let current;
	let if_block = false ;
	formattedtext = new FormattedText({ props: { block: /*block*/ ctx[0] } });

	return {
		c() {
			t = space();
			h4 = element("h4");
			create_component(formattedtext.$$.fragment);
			attr(h4, "id", h4_id_value = `_block-${/*block*/ ctx[0].id}`);
			attr(h4, "class", "notion-h3");
		},
		m(target, anchor) {
			insert(target, t, anchor);
			insert(target, h4, anchor);
			mount_component(formattedtext, h4, null);
			current = true;
		},
		p(ctx, [dirty]) {
			const formattedtext_changes = {};
			if (dirty & /*block*/ 1) formattedtext_changes.block = /*block*/ ctx[0];
			formattedtext.$set(formattedtext_changes);

			if (!current || dirty & /*block*/ 1 && h4_id_value !== (h4_id_value = `_block-${/*block*/ ctx[0].id}`)) {
				attr(h4, "id", h4_id_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			transition_in(formattedtext.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			transition_out(formattedtext.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(t);
			if (detaching) detach(h4);
			destroy_component(formattedtext);
		}
	};
}

function instance$f($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { block = {} } = $$props;
	let { blocks = [] } = $$props;
	let { fullPage = null } = $$props;
	let { api = null } = $$props;

	$$self.$$set = $$props => {
		if ('block' in $$props) $$invalidate(0, block = $$props.block);
		if ('blocks' in $$props) $$invalidate(1, blocks = $$props.blocks);
		if ('fullPage' in $$props) $$invalidate(2, fullPage = $$props.fullPage);
		if ('api' in $$props) $$invalidate(3, api = $$props.api);
		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
	};

	return [block, blocks, fullPage, api, $$scope, slots];
}

class SubSubHeader extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$f, create_fragment$f, safe_not_equal, { block: 0, blocks: 1, fullPage: 2, api: 3 });
	}
}

/* src/components/Text.svelte generated by Svelte v3.49.0 */

// (34:0) {:else}
function create_else_block_1$2(ctx) {
	let div;
	let div_id_value;

	return {
		c() {
			div = element("div");
			attr(div, "id", div_id_value = `_block-${/*block*/ ctx[0].id}`);
			attr(div, "class", "notion-blank");
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*block*/ 1 && div_id_value !== (div_id_value = `_block-${/*block*/ ctx[0].id}`)) {
				attr(div, "id", div_id_value);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (30:55) 
function create_if_block_2$8(ctx) {
	let span;
	let formattedtext;
	let span_id_value;
	let current;
	formattedtext = new FormattedText({ props: { block: /*block*/ ctx[0] } });

	return {
		c() {
			span = element("span");
			create_component(formattedtext.$$.fragment);
			attr(span, "id", span_id_value = `_block-${/*block*/ ctx[0].id}`);
			attr(span, "class", "notion-text");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			mount_component(formattedtext, span, null);
			current = true;
		},
		p(ctx, dirty) {
			const formattedtext_changes = {};
			if (dirty & /*block*/ 1) formattedtext_changes.block = /*block*/ ctx[0];
			formattedtext.$set(formattedtext_changes);

			if (!current || dirty & /*block*/ 1 && span_id_value !== (span_id_value = `_block-${/*block*/ ctx[0].id}`)) {
				attr(span, "id", span_id_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(formattedtext.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formattedtext.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(span);
			destroy_component(formattedtext);
		}
	};
}

// (20:0) {#if block.properties && block.properties.title}
function create_if_block$d(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block_1$a, create_else_block$a];
	const if_blocks = [];

	function select_block_type_1(ctx, dirty) {
		if (/*useHtml*/ ctx[1]) return 0;
		return 1;
	}

	current_block_type_index = select_block_type_1(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if_block.p(ctx, dirty);
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

// (25:2) {:else}
function create_else_block$a(ctx) {
	let p;
	let formattedtext;
	let p_id_value;
	let current;
	formattedtext = new FormattedText({ props: { block: /*block*/ ctx[0] } });

	return {
		c() {
			p = element("p");
			create_component(formattedtext.$$.fragment);
			attr(p, "id", p_id_value = `_block-${/*block*/ ctx[0].id}`);
			attr(p, "class", "notion-text");
		},
		m(target, anchor) {
			insert(target, p, anchor);
			mount_component(formattedtext, p, null);
			current = true;
		},
		p(ctx, dirty) {
			const formattedtext_changes = {};
			if (dirty & /*block*/ 1) formattedtext_changes.block = /*block*/ ctx[0];
			formattedtext.$set(formattedtext_changes);

			if (!current || dirty & /*block*/ 1 && p_id_value !== (p_id_value = `_block-${/*block*/ ctx[0].id}`)) {
				attr(p, "id", p_id_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(formattedtext.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formattedtext.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(p);
			destroy_component(formattedtext);
		}
	};
}

// (21:2) {#if useHtml}
function create_if_block_1$a(ctx) {
	let div;
	let raw_value = getTextContent(/*block*/ ctx[0]) + "";
	let div_id_value;

	return {
		c() {
			div = element("div");
			attr(div, "id", div_id_value = `_block-${/*block*/ ctx[0].id}`);
			attr(div, "class", "notion-text-html");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			div.innerHTML = raw_value;
		},
		p(ctx, dirty) {
			if (dirty & /*block*/ 1 && raw_value !== (raw_value = getTextContent(/*block*/ ctx[0]) + "")) div.innerHTML = raw_value;
			if (dirty & /*block*/ 1 && div_id_value !== (div_id_value = `_block-${/*block*/ ctx[0].id}`)) {
				attr(div, "id", div_id_value);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

function create_fragment$e(ctx) {
	let t;
	let current_block_type_index;
	let if_block1;
	let if_block1_anchor;
	let current;
	let if_block0 = false ;
	const if_block_creators = [create_if_block$d, create_if_block_2$8, create_else_block_1$2];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*block*/ ctx[0].properties && /*block*/ ctx[0].properties.title) return 0;
		if (/*block*/ ctx[0].properties && /*block*/ ctx[0].properties.caption) return 1;
		return 2;
	}

	current_block_type_index = select_block_type(ctx);
	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			t = space();
			if_block1.c();
			if_block1_anchor = empty();
		},
		m(target, anchor) {
			insert(target, t, anchor);
			if_blocks[current_block_type_index].m(target, anchor);
			insert(target, if_block1_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block1 = if_blocks[current_block_type_index];

				if (!if_block1) {
					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block1.c();
				} else {
					if_block1.p(ctx, dirty);
				}

				transition_in(if_block1, 1);
				if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block1);
			current = true;
		},
		o(local) {
			transition_out(if_block0);
			transition_out(if_block1);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(t);
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach(if_block1_anchor);
		}
	};
}

function instance$e($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { block = {} } = $$props;
	let { api = null } = $$props;
	let { blocks = [] } = $$props;
	let { fullPage = null } = $$props;
	let { markdown = false } = $$props;
	let useHtml = getContext("useHtml") || false;

	$$self.$$set = $$props => {
		if ('block' in $$props) $$invalidate(0, block = $$props.block);
		if ('api' in $$props) $$invalidate(2, api = $$props.api);
		if ('blocks' in $$props) $$invalidate(3, blocks = $$props.blocks);
		if ('fullPage' in $$props) $$invalidate(4, fullPage = $$props.fullPage);
		if ('markdown' in $$props) $$invalidate(5, markdown = $$props.markdown);
		if ('$$scope' in $$props) $$invalidate(6, $$scope = $$props.$$scope);
	};

	return [block, useHtml, api, blocks, fullPage, markdown, $$scope, slots];
}

class Text extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
			block: 0,
			api: 2,
			blocks: 3,
			fullPage: 4,
			markdown: 5
		});
	}
}

/* src/components/Toggle.svelte generated by Svelte v3.49.0 */

function add_css(target) {
	append_styles(target, "svelte-1opg8bm", "summary.svelte-1opg8bm{white-space:nowrap;margin-left:0}");
}

// (46:0) {:else}
function create_else_block$9(ctx) {
	let details;
	let summary;
	let span;
	let formattedtext;
	let t;
	let div;
	let details_id_value;
	let current;
	formattedtext = new FormattedText({ props: { block: /*block*/ ctx[2] } });
	const default_slot_template = /*#slots*/ ctx[7].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

	return {
		c() {
			details = element("details");
			summary = element("summary");
			span = element("span");
			create_component(formattedtext.$$.fragment);
			t = space();
			div = element("div");
			if (default_slot) default_slot.c();
			attr(span, "class", "notion-toggle-summary");
			attr(summary, "class", "svelte-1opg8bm");
			attr(div, "class", "notion-toggle-children");
			attr(details, "id", details_id_value = `_block-${/*block*/ ctx[2].id}`);
			attr(details, "class", "notion-toggle");
		},
		m(target, anchor) {
			insert(target, details, anchor);
			append(details, summary);
			append(summary, span);
			mount_component(formattedtext, span, null);
			append(details, t);
			append(details, div);

			if (default_slot) {
				default_slot.m(div, null);
			}

			current = true;
		},
		p(ctx, dirty) {
			const formattedtext_changes = {};
			if (dirty & /*block*/ 4) formattedtext_changes.block = /*block*/ ctx[2];
			formattedtext.$set(formattedtext_changes);

			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[6],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
						null
					);
				}
			}

			if (!current || dirty & /*block*/ 4 && details_id_value !== (details_id_value = `_block-${/*block*/ ctx[2].id}`)) {
				attr(details, "id", details_id_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(formattedtext.$$.fragment, local);
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(formattedtext.$$.fragment, local);
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(details);
			destroy_component(formattedtext);
			if (default_slot) default_slot.d(detaching);
		}
	};
}

// (42:22) 
function create_if_block_1$9(ctx) {
	let div;
	let div_id_value;
	let current;
	const default_slot_template = /*#slots*/ ctx[7].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

	return {
		c() {
			div = element("div");
			if (default_slot) default_slot.c();
			attr(div, "id", div_id_value = `_block-${/*block*/ ctx[2].id}`);
			attr(div, "class", "notion-toggle-container");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			if (default_slot) {
				default_slot.m(div, null);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[6],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
						null
					);
				}
			}

			if (!current || dirty & /*block*/ 4 && div_id_value !== (div_id_value = `_block-${/*block*/ ctx[2].id}`)) {
				attr(div, "id", div_id_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (default_slot) default_slot.d(detaching);
		}
	};
}

// (38:0) {#if useHtml}
function create_if_block$c(ctx) {
	let div;
	let div_id_value;
	let current;
	const default_slot_template = /*#slots*/ ctx[7].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

	return {
		c() {
			div = element("div");
			if (default_slot) default_slot.c();
			attr(div, "id", div_id_value = `_block-${/*block*/ ctx[2].id}`);
			attr(div, "class", "notion-toggle-html");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			if (default_slot) {
				default_slot.m(div, null);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[6],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
						null
					);
				}
			}

			if (!current || dirty & /*block*/ 4 && div_id_value !== (div_id_value = `_block-${/*block*/ ctx[2].id}`)) {
				attr(div, "id", div_id_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (default_slot) default_slot.d(detaching);
		}
	};
}

function create_fragment$d(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block$c, create_if_block_1$9, create_else_block$9];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*useHtml*/ ctx[0]) return 0;
		if (/*isContainer*/ ctx[1]) return 1;
		return 2;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				} else {
					if_block.p(ctx, dirty);
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$d($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { block = {} } = $$props;
	let { blocks = [] } = $$props;
	let { fullPage = null } = $$props;
	let { api = null } = $$props;
	let { useHtml = false, isContainer = false } = $$props;
	const title = getTextContent(block);

	$$self.$$set = $$props => {
		if ('block' in $$props) $$invalidate(2, block = $$props.block);
		if ('blocks' in $$props) $$invalidate(3, blocks = $$props.blocks);
		if ('fullPage' in $$props) $$invalidate(4, fullPage = $$props.fullPage);
		if ('api' in $$props) $$invalidate(5, api = $$props.api);
		if ('useHtml' in $$props) $$invalidate(0, useHtml = $$props.useHtml);
		if ('isContainer' in $$props) $$invalidate(1, isContainer = $$props.isContainer);
		if ('$$scope' in $$props) $$invalidate(6, $$scope = $$props.$$scope);
	};

	if (title) {
		// child blocks can get 'useHtml' context to process html
		if (title && title.includes("#html")) {
			setContext("useHtml", true);
			$$invalidate(0, useHtml = true);
		}

		// treats the callout as a composable container; no toggle, no padding
		if (title && title.includes("#container")) {
			$$invalidate(1, isContainer = true);
		}
	}

	return [useHtml, isContainer, block, blocks, fullPage, api, $$scope, slots];
}

class Toggle extends SvelteComponent {
	constructor(options) {
		super();

		init(
			this,
			options,
			instance$d,
			create_fragment$d,
			safe_not_equal,
			{
				block: 2,
				blocks: 3,
				fullPage: 4,
				api: 5,
				useHtml: 0,
				isContainer: 1
			},
			add_css
		);
	}
}

/* src/components/Video.svelte generated by Svelte v3.49.0 */

// (13:6) {:else}
function create_else_block$8(ctx) {
	let video;
	let source;
	let source_src_value;
	let t;

	return {
		c() {
			video = element("video");
			source = element("source");
			t = text("\n          Your browser does not support the video tag.");
			if (!src_url_equal(source.src, source_src_value = /*src*/ ctx[2])) attr(source, "src", source_src_value);
			attr(video, "width", "640");
			attr(video, "height", "360");
			video.controls = true;
		},
		m(target, anchor) {
			insert(target, video, anchor);
			append(video, source);
			append(video, t);
		},
		p(ctx, dirty) {
			if (dirty & /*src*/ 4 && !src_url_equal(source.src, source_src_value = /*src*/ ctx[2])) {
				attr(source, "src", source_src_value);
			}
		},
		d(detaching) {
			if (detaching) detach(video);
		}
	};
}

// (11:6) {#if videoType == 'iframe'}
function create_if_block_1$8(ctx) {
	let iframe;
	let iframe_src_value;

	return {
		c() {
			iframe = element("iframe");
			attr(iframe, "class", "notion-image-inset");
			if (!src_url_equal(iframe.src, iframe_src_value = /*src*/ ctx[2])) attr(iframe, "src", iframe_src_value);
			attr(iframe, "title", /*alt*/ ctx[4]);
			set_style(iframe, "min-height", "360px");
		},
		m(target, anchor) {
			insert(target, iframe, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*src*/ 4 && !src_url_equal(iframe.src, iframe_src_value = /*src*/ ctx[2])) {
				attr(iframe, "src", iframe_src_value);
			}
		},
		d(detaching) {
			if (detaching) detach(iframe);
		}
	};
}

// (20:4) {#if block.properties.caption}
function create_if_block$b(ctx) {
	let figcaption;
	let formattedtext;
	let current;
	formattedtext = new FormattedText({ props: { block: /*block*/ ctx[1] } });

	return {
		c() {
			figcaption = element("figcaption");
			create_component(formattedtext.$$.fragment);
			attr(figcaption, "class", "notion-image-caption");
		},
		m(target, anchor) {
			insert(target, figcaption, anchor);
			mount_component(formattedtext, figcaption, null);
			current = true;
		},
		p(ctx, dirty) {
			const formattedtext_changes = {};
			if (dirty & /*block*/ 2) formattedtext_changes.block = /*block*/ ctx[1];
			formattedtext.$set(formattedtext_changes);
		},
		i(local) {
			if (current) return;
			transition_in(formattedtext.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formattedtext.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(figcaption);
			destroy_component(formattedtext);
		}
	};
}

function create_fragment$c(ctx) {
	let t0;
	let figure;
	let div;
	let t1;
	let figure_id_value;
	let current;
	let if_block0 = false ;

	function select_block_type(ctx, dirty) {
		if (/*videoType*/ ctx[0] == 'iframe') return create_if_block_1$8;
		return create_else_block$8;
	}

	let current_block_type = select_block_type(ctx);
	let if_block1 = current_block_type(ctx);
	let if_block2 = /*block*/ ctx[1].properties.caption && create_if_block$b(ctx);

	return {
		c() {
			t0 = space();
			figure = element("figure");
			div = element("div");
			if_block1.c();
			t1 = space();
			if (if_block2) if_block2.c();
			set_style(div, "position", "relative");
			attr(figure, "id", figure_id_value = `_block-${/*block*/ ctx[1].id}`);
			attr(figure, "class", "notion-asset-wrapper");
			attr(figure, "style", `width: ${/*block_width*/ ctx[3]}px`);
		},
		m(target, anchor) {
			insert(target, t0, anchor);
			insert(target, figure, anchor);
			append(figure, div);
			if_block1.m(div, null);
			append(figure, t1);
			if (if_block2) if_block2.m(figure, null);
			current = true;
		},
		p(ctx, [dirty]) {

			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
				if_block1.p(ctx, dirty);
			} else {
				if_block1.d(1);
				if_block1 = current_block_type(ctx);

				if (if_block1) {
					if_block1.c();
					if_block1.m(div, null);
				}
			}

			if (/*block*/ ctx[1].properties.caption) {
				if (if_block2) {
					if_block2.p(ctx, dirty);

					if (dirty & /*block*/ 2) {
						transition_in(if_block2, 1);
					}
				} else {
					if_block2 = create_if_block$b(ctx);
					if_block2.c();
					transition_in(if_block2, 1);
					if_block2.m(figure, null);
				}
			} else if (if_block2) {
				group_outros();

				transition_out(if_block2, 1, 1, () => {
					if_block2 = null;
				});

				check_outros();
			}

			if (!current || dirty & /*block*/ 2 && figure_id_value !== (figure_id_value = `_block-${/*block*/ ctx[1].id}`)) {
				attr(figure, "id", figure_id_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block2);
			current = true;
		},
		o(local) {
			transition_out(if_block0);
			transition_out(if_block2);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(t0);
			if (detaching) detach(figure);
			if_block1.d();
			if (if_block2) if_block2.d();
		}
	};
}

function instance$c($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { block = {} } = $$props;
	let { blocks = [] } = $$props;
	let { fullPage = null } = $$props;
	let { api = null } = $$props;
	let { siteSrc } = $$props;
	let { videoType = null } = $$props;
	const format = block.format ? block.format : null;
	const { block_aspect_ratio, block_width, display_source } = format ? format : {};

	const alt = block.properties.caption
	? block.properties.caption[0][0]
	: '';

	// const src = block.properties.source
	//     ? toNotionImageUrl(block.properties.source[0][0], block.id, siteSrc)
	//     : '';
	let src = block.properties.source
	? block.properties.source[0][0]
	: '';

	if (src.includes('youtube.com/watch') || src.includes('youtu.be')) {
		videoType = 'iframe';

		if (src.includes('youtube.com/watch')) {
			src = src.replace('youtube.com/watch?v=', 'youtube.com/embed/');
		} else if (src.includes('youtu.be')) {
			let videoId = src.split('youtu.be/')[1];
			src = `https://www.youtube.com/embed/${videoId}`;
		}
	}

	$$self.$$set = $$props => {
		if ('block' in $$props) $$invalidate(1, block = $$props.block);
		if ('blocks' in $$props) $$invalidate(5, blocks = $$props.blocks);
		if ('fullPage' in $$props) $$invalidate(6, fullPage = $$props.fullPage);
		if ('api' in $$props) $$invalidate(7, api = $$props.api);
		if ('siteSrc' in $$props) $$invalidate(8, siteSrc = $$props.siteSrc);
		if ('videoType' in $$props) $$invalidate(0, videoType = $$props.videoType);
		if ('$$scope' in $$props) $$invalidate(9, $$scope = $$props.$$scope);
	};

	return [
		videoType,
		block,
		src,
		block_width,
		alt,
		blocks,
		fullPage,
		api,
		siteSrc,
		$$scope,
		slots
	];
}

class Video extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$c, create_fragment$c, safe_not_equal, {
			block: 1,
			blocks: 5,
			fullPage: 6,
			api: 7,
			siteSrc: 8,
			videoType: 0
		});
	}
}

/* src/components/Tweet.svelte generated by Svelte v3.49.0 */

function create_if_block$a(ctx) {
	let blockquote;
	let a;
	let t0;
	let t1;
	let t2;
	let blockquote_id_value;

	return {
		c() {
			blockquote = element("blockquote");
			a = element("a");
			t0 = text("Tweet from ");
			t1 = text(/*href*/ ctx[1]);
			t2 = text(".");
			attr(a, "href", /*href*/ ctx[1]);
			attr(blockquote, "id", blockquote_id_value = `_block-${/*block*/ ctx[0].id}`);
			attr(blockquote, "class", "twitter-tweet");
			attr(blockquote, "data-lang", "en");
		},
		m(target, anchor) {
			insert(target, blockquote, anchor);
			append(blockquote, a);
			append(a, t0);
			append(a, t1);
			append(a, t2);
		},
		p(ctx, dirty) {
			if (dirty & /*href*/ 2) set_data(t1, /*href*/ ctx[1]);

			if (dirty & /*href*/ 2) {
				attr(a, "href", /*href*/ ctx[1]);
			}

			if (dirty & /*block*/ 1 && blockquote_id_value !== (blockquote_id_value = `_block-${/*block*/ ctx[0].id}`)) {
				attr(blockquote, "id", blockquote_id_value);
			}
		},
		d(detaching) {
			if (detaching) detach(blockquote);
		}
	};
}

function create_fragment$b(ctx) {
	let if_block_anchor;
	let if_block = /*href*/ ctx[1] && create_if_block$a(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, [dirty]) {
			if (/*href*/ ctx[1]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block$a(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$b($$self, $$props, $$invalidate) {
	let { block = {} } = $$props;
	let { blocks = [] } = $$props;
	let { fullPage = null } = $$props;
	let { api = null } = $$props;
	let { siteSrc } = $$props;
	let href;
	if (block.properties && block.properties.source) href = block.properties.source[0][0];

	onMount(async () => {
		loadTwitter();
	});

	$$self.$$set = $$props => {
		if ('block' in $$props) $$invalidate(0, block = $$props.block);
		if ('blocks' in $$props) $$invalidate(2, blocks = $$props.blocks);
		if ('fullPage' in $$props) $$invalidate(3, fullPage = $$props.fullPage);
		if ('api' in $$props) $$invalidate(4, api = $$props.api);
		if ('siteSrc' in $$props) $$invalidate(5, siteSrc = $$props.siteSrc);
	};

	return [block, href, blocks, fullPage, api, siteSrc];
}

class Tweet extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
			block: 0,
			blocks: 2,
			fullPage: 3,
			api: 4,
			siteSrc: 5
		});
	}
}

/* src/subcomponents/CollectionProp.svelte generated by Svelte v3.49.0 */

function get_each_context_1$5(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[15] = list[i];
	child_ctx[17] = i;
	return child_ctx;
}

function get_each_context$6(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[12] = list[i];
	child_ctx[14] = i;
	return child_ctx;
}

// (70:0) {#if fieldItem}
function create_if_block$9(ctx) {
	let show_if;
	let if_block_anchor;

	function select_block_type(ctx, dirty) {
		if (dirty & /*fieldItem*/ 1) show_if = null;
		if (show_if == null) show_if = !!Array.isArray(/*fieldItem*/ ctx[0]);
		if (show_if) return create_if_block_1$7;
		return create_else_block_2$1;
	}

	let current_block_type = select_block_type(ctx, -1);
	let if_block = current_block_type(ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			}
		},
		d(detaching) {
			if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

// (101:2) {:else}
function create_else_block_2$1(ctx) {
	let if_block_anchor;

	function select_block_type_3(ctx, dirty) {
		if (/*schema*/ ctx[3].type == 'select') return create_if_block_4$2;
		if (/*schema*/ ctx[3].type == 'multi_select') return create_if_block_5$2;
		if (/*schema*/ ctx[3].type == 'url') return create_if_block_6$1;
		if (/*schema*/ ctx[3].type == 'title') return create_if_block_7$1;
		if (/*fieldItem*/ ctx[0].type == 'date') return create_if_block_8$1;
		if (/*fieldItem*/ ctx[0].type == 'datetime') return create_if_block_9$1;
		if (/*fieldItem*/ ctx[0].type == 'datetimerange') return create_if_block_10$1;
		return create_else_block_3$1;
	}

	let current_block_type = select_block_type_3(ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type_3(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			}
		},
		d(detaching) {
			if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

// (71:2) {#if Array.isArray(fieldItem)}
function create_if_block_1$7(ctx) {
	let if_block_anchor;

	function select_block_type_1(ctx, dirty) {
		if (typeof /*fieldItem*/ ctx[0][0] === 'object') return create_if_block_2$7;
		return create_else_block_1$1;
	}

	let current_block_type = select_block_type_1(ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			}
		},
		d(detaching) {
			if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

// (127:4) {:else}
function create_else_block_3$1(ctx) {
	let html_tag;
	let html_anchor;

	return {
		c() {
			html_tag = new HtmlTag(false);
			html_anchor = empty();
			html_tag.a = html_anchor;
		},
		m(target, anchor) {
			html_tag.m(/*fieldItem*/ ctx[0], target, anchor);
			insert(target, html_anchor, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*fieldItem*/ 1) html_tag.p(/*fieldItem*/ ctx[0]);
		},
		d(detaching) {
			if (detaching) detach(html_anchor);
			if (detaching) html_tag.d();
		}
	};
}

// (125:48) 
function create_if_block_10$1(ctx) {
	let span;
	let t_value = /*getDateTime*/ ctx[5](/*fieldItem*/ ctx[0]) + "";
	let t;

	return {
		c() {
			span = element("span");
			t = text(t_value);
			attr(span, "class", "notion-datetimerange");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t);
		},
		p(ctx, dirty) {
			if (dirty & /*fieldItem*/ 1 && t_value !== (t_value = /*getDateTime*/ ctx[5](/*fieldItem*/ ctx[0]) + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(span);
		}
	};
}

// (123:43) 
function create_if_block_9$1(ctx) {
	let span;
	let t_value = /*getDateTime*/ ctx[5](/*fieldItem*/ ctx[0]) + "";
	let t;

	return {
		c() {
			span = element("span");
			t = text(t_value);
			attr(span, "class", "notion-datetime");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t);
		},
		p(ctx, dirty) {
			if (dirty & /*fieldItem*/ 1 && t_value !== (t_value = /*getDateTime*/ ctx[5](/*fieldItem*/ ctx[0]) + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(span);
		}
	};
}

// (121:39) 
function create_if_block_8$1(ctx) {
	let span;
	let t_value = /*getDateTime*/ ctx[5](/*fieldItem*/ ctx[0]) + "";
	let t;

	return {
		c() {
			span = element("span");
			t = text(t_value);
			attr(span, "class", "notion-date");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t);
		},
		p(ctx, dirty) {
			if (dirty & /*fieldItem*/ 1 && t_value !== (t_value = /*getDateTime*/ ctx[5](/*fieldItem*/ ctx[0]) + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(span);
		}
	};
}

// (119:37) 
function create_if_block_7$1(ctx) {
	let span;
	let t;

	return {
		c() {
			span = element("span");
			t = text(/*fieldItem*/ ctx[0]);
			attr(span, "class", "notion-inline-title");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t);
		},
		p(ctx, dirty) {
			if (dirty & /*fieldItem*/ 1) set_data(t, /*fieldItem*/ ctx[0]);
		},
		d(detaching) {
			if (detaching) detach(span);
		}
	};
}

// (113:35) 
function create_if_block_6$1(ctx) {
	let a;
	let t_value = (/*getHostname*/ ctx[4](/*fieldItem*/ ctx[0]) || /*fieldItem*/ ctx[0]) + "";
	let t;

	return {
		c() {
			a = element("a");
			t = text(t_value);
			attr(a, "href", /*fieldItem*/ ctx[0]);
			attr(a, "class", "notion-link");
			set_style(a, "display", "inline-block");
		},
		m(target, anchor) {
			insert(target, a, anchor);
			append(a, t);
		},
		p(ctx, dirty) {
			if (dirty & /*fieldItem*/ 1 && t_value !== (t_value = (/*getHostname*/ ctx[4](/*fieldItem*/ ctx[0]) || /*fieldItem*/ ctx[0]) + "")) set_data(t, t_value);

			if (dirty & /*fieldItem*/ 1) {
				attr(a, "href", /*fieldItem*/ ctx[0]);
			}
		},
		d(detaching) {
			if (detaching) detach(a);
		}
	};
}

// (106:44) 
function create_if_block_5$2(ctx) {
	let span;
	let t;
	let span_class_value;

	return {
		c() {
			span = element("span");
			t = text(/*fieldItem*/ ctx[0]);
			attr(span, "class", span_class_value = "notion-tag notion-" + /*schema*/ ctx[3].options.find(/*func_4*/ ctx[10]).color + " notion-" + /*schema*/ ctx[3].options.find(/*func_5*/ ctx[11]).color + "_background");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t);
		},
		p(ctx, dirty) {
			if (dirty & /*fieldItem*/ 1) set_data(t, /*fieldItem*/ ctx[0]);

			if (dirty & /*schema, fieldItem*/ 9 && span_class_value !== (span_class_value = "notion-tag notion-" + /*schema*/ ctx[3].options.find(/*func_4*/ ctx[10]).color + " notion-" + /*schema*/ ctx[3].options.find(/*func_5*/ ctx[11]).color + "_background")) {
				attr(span, "class", span_class_value);
			}
		},
		d(detaching) {
			if (detaching) detach(span);
		}
	};
}

// (103:4) {#if schema.type == 'select'}
function create_if_block_4$2(ctx) {
	let span;
	let t;
	let span_class_value;

	return {
		c() {
			span = element("span");
			t = text(/*fieldItem*/ ctx[0]);
			attr(span, "class", span_class_value = "notion-tag notion-" + /*schema*/ ctx[3].options[/*schema*/ ctx[3].options.findIndex(/*func_2*/ ctx[8])].color + " notion-" + /*schema*/ ctx[3].options[/*schema*/ ctx[3].options.findIndex(/*func_3*/ ctx[9])].color + "_background");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t);
		},
		p(ctx, dirty) {
			if (dirty & /*fieldItem*/ 1) set_data(t, /*fieldItem*/ ctx[0]);

			if (dirty & /*schema, fieldItem*/ 9 && span_class_value !== (span_class_value = "notion-tag notion-" + /*schema*/ ctx[3].options[/*schema*/ ctx[3].options.findIndex(/*func_2*/ ctx[8])].color + " notion-" + /*schema*/ ctx[3].options[/*schema*/ ctx[3].options.findIndex(/*func_3*/ ctx[9])].color + "_background")) {
				attr(span, "class", span_class_value);
			}
		},
		d(detaching) {
			if (detaching) detach(span);
		}
	};
}

// (91:4) {:else}
function create_else_block_1$1(ctx) {
	let each_1_anchor;
	let each_value_1 = /*fieldItem*/ ctx[0];
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1$5(get_each_context_1$5(ctx, each_value_1, i));
	}

	return {
		c() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},
		m(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert(target, each_1_anchor, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*schema, fieldItem*/ 9) {
				each_value_1 = /*fieldItem*/ ctx[0];
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1$5(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_1$5(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_1.length;
			}
		},
		d(detaching) {
			destroy_each(each_blocks, detaching);
			if (detaching) detach(each_1_anchor);
		}
	};
}

// (72:4) {#if typeof fieldItem[0] === 'object'}
function create_if_block_2$7(ctx) {
	let each_1_anchor;
	let each_value = /*fieldItem*/ ctx[0];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
	}

	return {
		c() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},
		m(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert(target, each_1_anchor, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*api, fieldItem, record, isImage*/ 7) {
				each_value = /*fieldItem*/ ctx[0];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$6(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block$6(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}
		},
		d(detaching) {
			destroy_each(each_blocks, detaching);
			if (detaching) detach(each_1_anchor);
		}
	};
}

// (93:6) {#each fieldItem as tag, tagCounter}
function create_each_block_1$5(ctx) {
	let span;
	let t_value = /*tag*/ ctx[15] + "";
	let t;
	let span_class_value;

	function func(...args) {
		return /*func*/ ctx[6](/*tag*/ ctx[15], ...args);
	}

	function func_1(...args) {
		return /*func_1*/ ctx[7](/*tag*/ ctx[15], ...args);
	}

	return {
		c() {
			span = element("span");
			t = text(t_value);
			attr(span, "class", span_class_value = "notion-tag notion-" + /*schema*/ ctx[3].options.find(func).color + " notion-" + /*schema*/ ctx[3].options.find(func_1).color + "_background");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t);
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty & /*fieldItem*/ 1 && t_value !== (t_value = /*tag*/ ctx[15] + "")) set_data(t, t_value);

			if (dirty & /*schema, fieldItem*/ 9 && span_class_value !== (span_class_value = "notion-tag notion-" + /*schema*/ ctx[3].options.find(func).color + " notion-" + /*schema*/ ctx[3].options.find(func_1).color + "_background")) {
				attr(span, "class", span_class_value);
			}
		},
		d(detaching) {
			if (detaching) detach(span);
		}
	};
}

// (84:8) {:else}
function create_else_block$7(ctx) {
	let a;
	let t_value = /*attachment*/ ctx[12].name + "";
	let t;
	let a_href_value;

	return {
		c() {
			a = element("a");
			t = text(t_value);
			attr(a, "href", a_href_value = `${/*api*/ ctx[1]}/v1/file?url=${/*attachment*/ ctx[12].rawUrl}&blockId=${/*record*/ ctx[2].id}`);
			attr(a, "target", "_blank");
			attr(a, "rel", "external noreferrer");
		},
		m(target, anchor) {
			insert(target, a, anchor);
			append(a, t);
		},
		p(ctx, dirty) {
			if (dirty & /*fieldItem*/ 1 && t_value !== (t_value = /*attachment*/ ctx[12].name + "")) set_data(t, t_value);

			if (dirty & /*api, fieldItem, record*/ 7 && a_href_value !== (a_href_value = `${/*api*/ ctx[1]}/v1/file?url=${/*attachment*/ ctx[12].rawUrl}&blockId=${/*record*/ ctx[2].id}`)) {
				attr(a, "href", a_href_value);
			}
		},
		d(detaching) {
			if (detaching) detach(a);
		}
	};
}

// (74:8) {#if isImage(attachment)}
function create_if_block_3$3(ctx) {
	let a;
	let img;
	let img_alt_value;
	let img_src_value;
	let t;
	let a_href_value;

	return {
		c() {
			a = element("a");
			img = element("img");
			t = space();
			attr(img, "class", "notion-collection-image");
			attr(img, "alt", img_alt_value = /*attachment*/ ctx[12].name);
			if (!src_url_equal(img.src, img_src_value = /*attachment*/ ctx[12].url)) attr(img, "src", img_src_value);
			attr(a, "href", a_href_value = `${/*api*/ ctx[1]}/v1/file?url=${/*attachment*/ ctx[12].rawUrl}&blockId=${/*record*/ ctx[2].id}`);
			attr(a, "target", "_blank");
			attr(a, "rel", "external noreferrer");
		},
		m(target, anchor) {
			insert(target, a, anchor);
			append(a, img);
			append(a, t);
		},
		p(ctx, dirty) {
			if (dirty & /*fieldItem*/ 1 && img_alt_value !== (img_alt_value = /*attachment*/ ctx[12].name)) {
				attr(img, "alt", img_alt_value);
			}

			if (dirty & /*fieldItem*/ 1 && !src_url_equal(img.src, img_src_value = /*attachment*/ ctx[12].url)) {
				attr(img, "src", img_src_value);
			}

			if (dirty & /*api, fieldItem, record*/ 7 && a_href_value !== (a_href_value = `${/*api*/ ctx[1]}/v1/file?url=${/*attachment*/ ctx[12].rawUrl}&blockId=${/*record*/ ctx[2].id}`)) {
				attr(a, "href", a_href_value);
			}
		},
		d(detaching) {
			if (detaching) detach(a);
		}
	};
}

// (73:6) {#each fieldItem as attachment, id}
function create_each_block$6(ctx) {
	let show_if;
	let if_block_anchor;

	function select_block_type_2(ctx, dirty) {
		if (dirty & /*fieldItem*/ 1) show_if = null;
		if (show_if == null) show_if = !!isImage(/*attachment*/ ctx[12]);
		if (show_if) return create_if_block_3$3;
		return create_else_block$7;
	}

	let current_block_type = select_block_type_2(ctx, -1);
	let if_block = current_block_type(ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type_2(ctx, dirty)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			}
		},
		d(detaching) {
			if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function create_fragment$a(ctx) {
	let if_block_anchor;
	let if_block = /*fieldItem*/ ctx[0] && create_if_block$9(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, [dirty]) {
			if (/*fieldItem*/ ctx[0]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block$9(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$a($$self, $$props, $$invalidate) {
	let { fieldItem, api, record, schema } = $$props;

	// removes lengthy URLs for cleaner look
	const getHostname = url => {
		try {
			if (browser) return new URL(url).hostname;
		} catch(e) {
			
		} // local URLs or malformed urls

		return url;
	};

	const getDateTime = dateObj => {
		let _date;

		if (fieldItem.type == "date") {
			_date = new Date(dateObj.start_date);

			return _date.toLocaleString("en-US", {
				timeZone: "UTC",
				day: "numeric",
				month: "long",
				year: "numeric"
			});
		}

		if (fieldItem.type == "datetime") {
			_date = new Date(dateObj.start_date + " " + dateObj.start_time);
			let timeZone = dateObj.time_zone || "UTC";

			return _date.toLocaleString("en-US", {
				timeZone,
				dateStyle: "medium",
				timeStyle: "short"
			});
		}

		if (fieldItem.type == "datetimerange") {
			_date = new Date(dateObj.start_date + " " + dateObj.start_time);
			let _end = new Date(dateObj.end_date + " " + dateObj.end_time);
			let timeZone = dateObj.time_zone || "UTC";

			let start = _date.toLocaleString("en-US", {
				timeZone,
				dateStyle: "medium",
				timeStyle: "short"
			});

			let end = _end.toLocaleString("en-US", {
				timeZone,
				dateStyle: "medium",
				timeStyle: "short"
			});

			return `${start} → ${end}`;
		}
	};

	const func = (tag, f) => f.value == tag;
	const func_1 = (tag, f) => f.value == tag;
	const func_2 = f => f.value == fieldItem;
	const func_3 = f => f.value == fieldItem;
	const func_4 = f => f.value == fieldItem;
	const func_5 = f => f.value == fieldItem;

	$$self.$$set = $$props => {
		if ('fieldItem' in $$props) $$invalidate(0, fieldItem = $$props.fieldItem);
		if ('api' in $$props) $$invalidate(1, api = $$props.api);
		if ('record' in $$props) $$invalidate(2, record = $$props.record);
		if ('schema' in $$props) $$invalidate(3, schema = $$props.schema);
	};

	return [
		fieldItem,
		api,
		record,
		schema,
		getHostname,
		getDateTime,
		func,
		func_1,
		func_2,
		func_3,
		func_4,
		func_5
	];
}

class CollectionProp extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
			fieldItem: 0,
			api: 1,
			record: 2,
			schema: 3
		});
	}
}

/* src/subcomponents/CollectionTable.svelte generated by Svelte v3.49.0 */

function get_each_context$5(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[8] = list[i];
	child_ctx[10] = i;
	return child_ctx;
}

function get_each_context_1$4(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[11] = list[i];
	child_ctx[13] = i;
	return child_ctx;
}

function get_each_context_2$3(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[11] = list[i];
	return child_ctx;
}

// (3:4) {#if tableData.columns}
function create_if_block_2$6(ctx) {
	let thead;
	let tr;
	let each_value_2 = /*tableData*/ ctx[1].columns;
	let each_blocks = [];

	for (let i = 0; i < each_value_2.length; i += 1) {
		each_blocks[i] = create_each_block_2$3(get_each_context_2$3(ctx, each_value_2, i));
	}

	return {
		c() {
			thead = element("thead");
			tr = element("tr");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
		},
		m(target, anchor) {
			insert(target, thead, anchor);
			append(thead, tr);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(tr, null);
			}
		},
		p(ctx, dirty) {
			if (dirty & /*tableData*/ 2) {
				each_value_2 = /*tableData*/ ctx[1].columns;
				let i;

				for (i = 0; i < each_value_2.length; i += 1) {
					const child_ctx = get_each_context_2$3(ctx, each_value_2, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_2$3(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(tr, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_2.length;
			}
		},
		d(detaching) {
			if (detaching) detach(thead);
			destroy_each(each_blocks, detaching);
		}
	};
}

// (7:20) {#if column.visible == true && column.name}
function create_if_block_3$2(ctx) {
	let th;
	let t_value = /*column*/ ctx[11].name + "";
	let t;

	return {
		c() {
			th = element("th");
			t = text(t_value);
			set_style(th, "width", /*column*/ ctx[11].width + "px");
		},
		m(target, anchor) {
			insert(target, th, anchor);
			append(th, t);
		},
		p(ctx, dirty) {
			if (dirty & /*tableData*/ 2 && t_value !== (t_value = /*column*/ ctx[11].name + "")) set_data(t, t_value);

			if (dirty & /*tableData*/ 2) {
				set_style(th, "width", /*column*/ ctx[11].width + "px");
			}
		},
		d(detaching) {
			if (detaching) detach(th);
		}
	};
}

// (6:16) {#each tableData.columns as column}
function create_each_block_2$3(ctx) {
	let if_block_anchor;
	let if_block = /*column*/ ctx[11].visible == true && /*column*/ ctx[11].name && create_if_block_3$2(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, dirty) {
			if (/*column*/ ctx[11].visible == true && /*column*/ ctx[11].name) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_3$2(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

// (14:4) {#if tableData.columns}
function create_if_block$8(ctx) {
	let tbody;
	let current;
	let each_value = /*tableRows*/ ctx[2];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			tbody = element("tbody");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
		},
		m(target, anchor) {
			insert(target, tbody, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(tbody, null);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (dirty & /*tableRows, tableData, api*/ 7) {
				each_value = /*tableRows*/ ctx[2];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$5(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block$5(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(tbody, null);
					}
				}

				group_outros();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(tbody);
			destroy_each(each_blocks, detaching);
		}
	};
}

// (19:24) {#if column.visible == true && column.name}
function create_if_block_1$6(ctx) {
	let td;
	let collectionprop;
	let td_class_value;
	let current;

	function func(...args) {
		return /*func*/ ctx[5](/*column*/ ctx[11], ...args);
	}

	collectionprop = new CollectionProp({
			props: {
				fieldItem: /*record*/ ctx[8][/*column*/ ctx[11].name],
				tableData: /*tableData*/ ctx[1],
				api: /*api*/ ctx[0],
				record: /*record*/ ctx[8],
				schema: /*tableData*/ ctx[1].columns[/*tableData*/ ctx[1].columns.findIndex(func)]
			}
		});

	return {
		c() {
			td = element("td");
			create_component(collectionprop.$$.fragment);
			attr(td, "class", td_class_value = /*tableData*/ ctx[1].columns[/*colCounter*/ ctx[13]].type);
		},
		m(target, anchor) {
			insert(target, td, anchor);
			mount_component(collectionprop, td, null);
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			const collectionprop_changes = {};
			if (dirty & /*tableRows, tableData*/ 6) collectionprop_changes.fieldItem = /*record*/ ctx[8][/*column*/ ctx[11].name];
			if (dirty & /*tableData*/ 2) collectionprop_changes.tableData = /*tableData*/ ctx[1];
			if (dirty & /*api*/ 1) collectionprop_changes.api = /*api*/ ctx[0];
			if (dirty & /*tableRows*/ 4) collectionprop_changes.record = /*record*/ ctx[8];
			if (dirty & /*tableData*/ 2) collectionprop_changes.schema = /*tableData*/ ctx[1].columns[/*tableData*/ ctx[1].columns.findIndex(func)];
			collectionprop.$set(collectionprop_changes);

			if (!current || dirty & /*tableData*/ 2 && td_class_value !== (td_class_value = /*tableData*/ ctx[1].columns[/*colCounter*/ ctx[13]].type)) {
				attr(td, "class", td_class_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(collectionprop.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(collectionprop.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(td);
			destroy_component(collectionprop);
		}
	};
}

// (18:20) {#each tableData.columns as column, colCounter}
function create_each_block_1$4(ctx) {
	let if_block_anchor;
	let current;
	let if_block = /*column*/ ctx[11].visible == true && /*column*/ ctx[11].name && create_if_block_1$6(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if (/*column*/ ctx[11].visible == true && /*column*/ ctx[11].name) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*tableData*/ 2) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block_1$6(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

// (16:12) {#each tableRows as record, rowCounter}
function create_each_block$5(ctx) {
	let tr;
	let t;
	let tr_id_value;
	let current;
	let each_value_1 = /*tableData*/ ctx[1].columns;
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1$4(get_each_context_1$4(ctx, each_value_1, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			tr = element("tr");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t = space();
			attr(tr, "id", tr_id_value = "block-" + /*record*/ ctx[8].id);
		},
		m(target, anchor) {
			insert(target, tr, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(tr, null);
			}

			append(tr, t);
			current = true;
		},
		p(ctx, dirty) {
			if (dirty & /*tableData, tableRows, api*/ 7) {
				each_value_1 = /*tableData*/ ctx[1].columns;
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1$4(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block_1$4(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(tr, t);
					}
				}

				group_outros();

				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}

			if (!current || dirty & /*tableRows*/ 4 && tr_id_value !== (tr_id_value = "block-" + /*record*/ ctx[8].id)) {
				attr(tr, "id", tr_id_value);
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value_1.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(tr);
			destroy_each(each_blocks, detaching);
		}
	};
}

function create_fragment$9(ctx) {
	let table;
	let t;
	let current;
	let if_block0 = /*tableData*/ ctx[1].columns && create_if_block_2$6(ctx);
	let if_block1 = /*tableData*/ ctx[1].columns && create_if_block$8(ctx);

	return {
		c() {
			table = element("table");
			if (if_block0) if_block0.c();
			t = space();
			if (if_block1) if_block1.c();

			attr(table, "class", "notion-collection-table " + (/*tableWrap*/ ctx[3]
			? 'notion-collection-tablewrap'
			: ''));
		},
		m(target, anchor) {
			insert(target, table, anchor);
			if (if_block0) if_block0.m(table, null);
			append(table, t);
			if (if_block1) if_block1.m(table, null);
			current = true;
		},
		p(ctx, [dirty]) {
			if (/*tableData*/ ctx[1].columns) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_2$6(ctx);
					if_block0.c();
					if_block0.m(table, t);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (/*tableData*/ ctx[1].columns) {
				if (if_block1) {
					if_block1.p(ctx, dirty);

					if (dirty & /*tableData*/ 2) {
						transition_in(if_block1, 1);
					}
				} else {
					if_block1 = create_if_block$8(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(table, null);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block1);
			current = true;
		},
		o(local) {
			transition_out(if_block1);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(table);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
		}
	};
}

function instance$9($$self, $$props, $$invalidate) {
	let { api } = $$props;
	let { tableData = null } = $$props;
	let { tableRows, view } = $$props;
	let _format = view.format;
	let tableWrap = _format.table_wrap;
	const func = (column, f) => f.name == column.name;

	$$self.$$set = $$props => {
		if ('api' in $$props) $$invalidate(0, api = $$props.api);
		if ('tableData' in $$props) $$invalidate(1, tableData = $$props.tableData);
		if ('tableRows' in $$props) $$invalidate(2, tableRows = $$props.tableRows);
		if ('view' in $$props) $$invalidate(4, view = $$props.view);
	};

	return [api, tableData, tableRows, tableWrap, view, func];
}

class CollectionTable extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
			api: 0,
			tableData: 1,
			tableRows: 2,
			view: 4
		});
	}
}

/* src/subcomponents/CollectionGallery.svelte generated by Svelte v3.49.0 */

function get_each_context$4(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[17] = list[i];
	return child_ctx;
}

function get_each_context_3(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[20] = list[i];
	return child_ctx;
}

function get_each_context_2$2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[20] = list[i];
	return child_ctx;
}

function get_each_context_1$3(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[20] = list[i];
	return child_ctx;
}

// (180:4) {:else}
function create_else_block_2(ctx) {
	let div1;
	let t0;
	let div0;
	let t1;
	let current;
	let if_block = /*_format*/ ctx[12].gallery_cover && create_if_block_13(ctx);
	let each_value_3 = /*getRecordItems*/ ctx[3](/*record*/ ctx[17]);
	let each_blocks = [];

	for (let i = 0; i < each_value_3.length; i += 1) {
		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			div1 = element("div");
			if (if_block) if_block.c();
			t0 = space();
			div0 = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t1 = space();
			attr(div0, "class", "notion-galleryboard-props");
			attr(div1, "class", "notion-galleryboard-item");
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			if (if_block) if_block.m(div1, null);
			append(div1, t0);
			append(div1, div0);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div0, null);
			}

			append(div1, t1);
			current = true;
		},
		p(ctx, dirty) {
			if (/*_format*/ ctx[12].gallery_cover) if_block.p(ctx, dirty);

			if (dirty & /*getRecordItems, tableRows, tableData, api*/ 15) {
				each_value_3 = /*getRecordItems*/ ctx[3](/*record*/ ctx[17]);
				let i;

				for (i = 0; i < each_value_3.length; i += 1) {
					const child_ctx = get_each_context_3(ctx, each_value_3, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block_3(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(div0, null);
					}
				}

				group_outros();

				for (i = each_value_3.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value_3.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(div1);
			if (if_block) if_block.d();
			destroy_each(each_blocks, detaching);
		}
	};
}

// (136:25) 
function create_if_block_6(ctx) {
	let div1;
	let t0;
	let div0;
	let t1;
	let t2;
	let current;
	let if_block0 = /*_format*/ ctx[12].gallery_cover && create_if_block_10(ctx);

	function select_block_type_3(ctx, dirty) {
		if (/*record*/ ctx[17]['URL']) return create_if_block_7;
		if (/*record*/ ctx[17]['Name'] && !/*hideGalleryTitles*/ ctx[11]) return create_if_block_9;
	}

	let current_block_type = select_block_type_3(ctx);
	let if_block1 = current_block_type && current_block_type(ctx);
	let each_value_2 = /*getRecordItems*/ ctx[3](/*record*/ ctx[17], ['Name']);
	let each_blocks = [];

	for (let i = 0; i < each_value_2.length; i += 1) {
		each_blocks[i] = create_each_block_2$2(get_each_context_2$2(ctx, each_value_2, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			div1 = element("div");
			if (if_block0) if_block0.c();
			t0 = space();
			div0 = element("div");
			if (if_block1) if_block1.c();
			t1 = space();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t2 = space();
			attr(div0, "class", "notion-galleryboard-description");
			attr(div1, "class", "notion-galleryboard-item notion-galleryboard-profile");
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			if (if_block0) if_block0.m(div1, null);
			append(div1, t0);
			append(div1, div0);
			if (if_block1) if_block1.m(div0, null);
			append(div0, t1);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div0, null);
			}

			append(div1, t2);
			current = true;
		},
		p(ctx, dirty) {
			if (/*_format*/ ctx[12].gallery_cover) if_block0.p(ctx, dirty);

			if (current_block_type === (current_block_type = select_block_type_3(ctx)) && if_block1) {
				if_block1.p(ctx, dirty);
			} else {
				if (if_block1) if_block1.d(1);
				if_block1 = current_block_type && current_block_type(ctx);

				if (if_block1) {
					if_block1.c();
					if_block1.m(div0, t1);
				}
			}

			if (dirty & /*getRecordItems, tableRows, tableData, api*/ 15) {
				each_value_2 = /*getRecordItems*/ ctx[3](/*record*/ ctx[17], ['Name']);
				let i;

				for (i = 0; i < each_value_2.length; i += 1) {
					const child_ctx = get_each_context_2$2(ctx, each_value_2, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block_2$2(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(div0, null);
					}
				}

				group_outros();

				for (i = each_value_2.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value_2.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(div1);
			if (if_block0) if_block0.d();

			if (if_block1) {
				if_block1.d();
			}

			destroy_each(each_blocks, detaching);
		}
	};
}

// (98:4) {#if isImageLinks}
function create_if_block$7(ctx) {
	let div;
	let t;
	let current;
	let if_block = /*_format*/ ctx[12].gallery_cover && create_if_block_1$5(ctx);

	return {
		c() {
			div = element("div");
			if (if_block) if_block.c();
			t = space();
			attr(div, "class", "notion-galleryboard-item notion-galleryboard-imagelinks");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if (if_block) if_block.m(div, null);
			append(div, t);
			current = true;
		},
		p(ctx, dirty) {
			if (/*_format*/ ctx[12].gallery_cover) if_block.p(ctx, dirty);
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (if_block) if_block.d();
		}
	};
}

// (182:8) {#if _format.gallery_cover}
function create_if_block_13(ctx) {
	let div;

	function select_block_type_4(ctx, dirty) {
		if (/*record*/ ctx[17]['URL']) return create_if_block_14;
		return create_else_block_3;
	}

	let current_block_type = select_block_type_4(ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			div = element("div");
			if_block.c();
			attr(div, "class", "notion-galleryboard-cover");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if_block.m(div, null);
		},
		p(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type_4(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(div, null);
				}
			}
		},
		d(detaching) {
			if (detaching) detach(div);
			if_block.d();
		}
	};
}

// (191:12) {:else}
function create_else_block_3(ctx) {
	let img;
	let img_style_value;
	let img_alt_value;
	let img_src_value;
	let t;
	let if_block_anchor;
	let if_block = /*record*/ ctx[17]['Name'] && !/*hideGalleryTitles*/ ctx[11] && create_if_block_15(ctx);

	return {
		c() {
			img = element("img");
			t = space();
			if (if_block) if_block.c();
			if_block_anchor = empty();

			attr(img, "style", img_style_value = /*_coverAspect*/ ctx[6]
			? `object-fit: ${/*_coverAspect*/ ctx[6]}`
			: ``);

			attr(img, "alt", img_alt_value = /*getCover*/ ctx[4](/*record*/ ctx[17]).name);
			if (!src_url_equal(img.src, img_src_value = /*getCover*/ ctx[4](/*record*/ ctx[17]).url)) attr(img, "src", img_src_value);
		},
		m(target, anchor) {
			insert(target, img, anchor);
			insert(target, t, anchor);
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*_coverAspect*/ 64 && img_style_value !== (img_style_value = /*_coverAspect*/ ctx[6]
			? `object-fit: ${/*_coverAspect*/ ctx[6]}`
			: ``)) {
				attr(img, "style", img_style_value);
			}

			if (dirty & /*tableRows*/ 4 && img_alt_value !== (img_alt_value = /*getCover*/ ctx[4](/*record*/ ctx[17]).name)) {
				attr(img, "alt", img_alt_value);
			}

			if (dirty & /*tableRows*/ 4 && !src_url_equal(img.src, img_src_value = /*getCover*/ ctx[4](/*record*/ ctx[17]).url)) {
				attr(img, "src", img_src_value);
			}

			if (/*record*/ ctx[17]['Name'] && !/*hideGalleryTitles*/ ctx[11]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_15(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		d(detaching) {
			if (detaching) detach(img);
			if (detaching) detach(t);
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

// (184:12) {#if record['URL']}
function create_if_block_14(ctx) {
	let a;
	let img;
	let img_style_value;
	let img_alt_value;
	let img_src_value;
	let a_href_value;

	return {
		c() {
			a = element("a");
			img = element("img");

			attr(img, "style", img_style_value = /*_coverAspect*/ ctx[6]
			? `object-fit: ${/*_coverAspect*/ ctx[6]}`
			: ``);

			attr(img, "alt", img_alt_value = /*getCover*/ ctx[4](/*record*/ ctx[17]).name);
			if (!src_url_equal(img.src, img_src_value = /*getCover*/ ctx[4](/*record*/ ctx[17]).url)) attr(img, "src", img_src_value);
			attr(a, "sapper:prefetch", "");
			attr(a, "href", a_href_value = /*record*/ ctx[17]['URL']);
		},
		m(target, anchor) {
			insert(target, a, anchor);
			append(a, img);
		},
		p(ctx, dirty) {
			if (dirty & /*_coverAspect*/ 64 && img_style_value !== (img_style_value = /*_coverAspect*/ ctx[6]
			? `object-fit: ${/*_coverAspect*/ ctx[6]}`
			: ``)) {
				attr(img, "style", img_style_value);
			}

			if (dirty & /*tableRows*/ 4 && img_alt_value !== (img_alt_value = /*getCover*/ ctx[4](/*record*/ ctx[17]).name)) {
				attr(img, "alt", img_alt_value);
			}

			if (dirty & /*tableRows*/ 4 && !src_url_equal(img.src, img_src_value = /*getCover*/ ctx[4](/*record*/ ctx[17]).url)) {
				attr(img, "src", img_src_value);
			}

			if (dirty & /*tableRows*/ 4 && a_href_value !== (a_href_value = /*record*/ ctx[17]['URL'])) {
				attr(a, "href", a_href_value);
			}
		},
		d(detaching) {
			if (detaching) detach(a);
		}
	};
}

// (196:14) {#if record['Name'] && !hideGalleryTitles}
function create_if_block_15(ctx) {
	let t_value = /*record*/ ctx[17]['Name'] + "";
	let t;

	return {
		c() {
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*tableRows*/ 4 && t_value !== (t_value = /*record*/ ctx[17]['Name'] + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (201:10) {#each getRecordItems(record) as item}
function create_each_block_3(ctx) {
	let div;
	let collectionprop;
	let t;
	let current;

	collectionprop = new CollectionProp({
			props: {
				fieldItem: /*item*/ ctx[20].value,
				tableData: /*tableData*/ ctx[1],
				api: /*api*/ ctx[0],
				record: /*record*/ ctx[17],
				schema: /*item*/ ctx[20].schema
			}
		});

	return {
		c() {
			div = element("div");
			create_component(collectionprop.$$.fragment);
			t = space();
			attr(div, "class", "notion-item");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			mount_component(collectionprop, div, null);
			append(div, t);
			current = true;
		},
		p(ctx, dirty) {
			const collectionprop_changes = {};
			if (dirty & /*tableRows*/ 4) collectionprop_changes.fieldItem = /*item*/ ctx[20].value;
			if (dirty & /*tableData*/ 2) collectionprop_changes.tableData = /*tableData*/ ctx[1];
			if (dirty & /*api*/ 1) collectionprop_changes.api = /*api*/ ctx[0];
			if (dirty & /*tableRows*/ 4) collectionprop_changes.record = /*record*/ ctx[17];
			if (dirty & /*tableRows*/ 4) collectionprop_changes.schema = /*item*/ ctx[20].schema;
			collectionprop.$set(collectionprop_changes);
		},
		i(local) {
			if (current) return;
			transition_in(collectionprop.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(collectionprop.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_component(collectionprop);
		}
	};
}

// (138:8) {#if _format.gallery_cover}
function create_if_block_10(ctx) {
	let div;
	let show_if = /*getCover*/ ctx[4](/*record*/ ctx[17]);
	let if_block = show_if && create_if_block_11(ctx);

	return {
		c() {
			div = element("div");
			if (if_block) if_block.c();
			attr(div, "class", "notion-galleryboard-cover");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if (if_block) if_block.m(div, null);
		},
		p(ctx, dirty) {
			if (dirty & /*tableRows*/ 4) show_if = /*getCover*/ ctx[4](/*record*/ ctx[17]);

			if (show_if) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_11(ctx);
					if_block.c();
					if_block.m(div, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		d(detaching) {
			if (detaching) detach(div);
			if (if_block) if_block.d();
		}
	};
}

// (140:12) {#if getCover(record)}
function create_if_block_11(ctx) {
	let if_block_anchor;

	function select_block_type_2(ctx, dirty) {
		if (/*record*/ ctx[17]['URL']) return create_if_block_12;
		return create_else_block_1;
	}

	let current_block_type = select_block_type_2(ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			}
		},
		d(detaching) {
			if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

// (148:14) {:else}
function create_else_block_1(ctx) {
	let img;
	let img_style_value;
	let img_alt_value;
	let img_src_value;

	return {
		c() {
			img = element("img");

			attr(img, "style", img_style_value = /*_coverAspect*/ ctx[6]
			? `object-fit: ${/*_coverAspect*/ ctx[6]}`
			: ``);

			attr(img, "alt", img_alt_value = /*getCover*/ ctx[4](/*record*/ ctx[17]).name);
			if (!src_url_equal(img.src, img_src_value = /*getCover*/ ctx[4](/*record*/ ctx[17]).url)) attr(img, "src", img_src_value);
		},
		m(target, anchor) {
			insert(target, img, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*_coverAspect*/ 64 && img_style_value !== (img_style_value = /*_coverAspect*/ ctx[6]
			? `object-fit: ${/*_coverAspect*/ ctx[6]}`
			: ``)) {
				attr(img, "style", img_style_value);
			}

			if (dirty & /*tableRows*/ 4 && img_alt_value !== (img_alt_value = /*getCover*/ ctx[4](/*record*/ ctx[17]).name)) {
				attr(img, "alt", img_alt_value);
			}

			if (dirty & /*tableRows*/ 4 && !src_url_equal(img.src, img_src_value = /*getCover*/ ctx[4](/*record*/ ctx[17]).url)) {
				attr(img, "src", img_src_value);
			}
		},
		d(detaching) {
			if (detaching) detach(img);
		}
	};
}

// (141:14) {#if record['URL']}
function create_if_block_12(ctx) {
	let a;
	let img;
	let img_style_value;
	let img_alt_value;
	let img_src_value;
	let a_href_value;

	return {
		c() {
			a = element("a");
			img = element("img");

			attr(img, "style", img_style_value = /*_coverAspect*/ ctx[6]
			? `object-fit: ${/*_coverAspect*/ ctx[6]}`
			: ``);

			attr(img, "alt", img_alt_value = /*getCover*/ ctx[4](/*record*/ ctx[17]).name);
			if (!src_url_equal(img.src, img_src_value = /*getCover*/ ctx[4](/*record*/ ctx[17]).url)) attr(img, "src", img_src_value);
			attr(a, "sapper:prefetch", "");
			attr(a, "href", a_href_value = /*record*/ ctx[17]['URL']);
		},
		m(target, anchor) {
			insert(target, a, anchor);
			append(a, img);
		},
		p(ctx, dirty) {
			if (dirty & /*_coverAspect*/ 64 && img_style_value !== (img_style_value = /*_coverAspect*/ ctx[6]
			? `object-fit: ${/*_coverAspect*/ ctx[6]}`
			: ``)) {
				attr(img, "style", img_style_value);
			}

			if (dirty & /*tableRows*/ 4 && img_alt_value !== (img_alt_value = /*getCover*/ ctx[4](/*record*/ ctx[17]).name)) {
				attr(img, "alt", img_alt_value);
			}

			if (dirty & /*tableRows*/ 4 && !src_url_equal(img.src, img_src_value = /*getCover*/ ctx[4](/*record*/ ctx[17]).url)) {
				attr(img, "src", img_src_value);
			}

			if (dirty & /*tableRows*/ 4 && a_href_value !== (a_href_value = /*record*/ ctx[17]['URL'])) {
				attr(a, "href", a_href_value);
			}
		},
		d(detaching) {
			if (detaching) detach(a);
		}
	};
}

// (165:57) 
function create_if_block_9(ctx) {
	let span;
	let t_value = /*record*/ ctx[17]['Name'] + "";
	let t;

	return {
		c() {
			span = element("span");
			t = text(t_value);
			attr(span, "class", "notion-galleryboard-name");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t);
		},
		p(ctx, dirty) {
			if (dirty & /*tableRows*/ 4 && t_value !== (t_value = /*record*/ ctx[17]['Name'] + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(span);
		}
	};
}

// (158:10) {#if record['URL']}
function create_if_block_7(ctx) {
	let a;
	let a_href_value;
	let if_block = /*record*/ ctx[17]['Name'] && !/*hideGalleryTitles*/ ctx[11] && create_if_block_8(ctx);

	return {
		c() {
			a = element("a");
			if (if_block) if_block.c();
			attr(a, "class", "notion-galleryboard-name");
			attr(a, "sapper:prefetch", "");
			attr(a, "href", a_href_value = /*record*/ ctx[17]['URL']);
		},
		m(target, anchor) {
			insert(target, a, anchor);
			if (if_block) if_block.m(a, null);
		},
		p(ctx, dirty) {
			if (/*record*/ ctx[17]['Name'] && !/*hideGalleryTitles*/ ctx[11]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_8(ctx);
					if_block.c();
					if_block.m(a, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (dirty & /*tableRows*/ 4 && a_href_value !== (a_href_value = /*record*/ ctx[17]['URL'])) {
				attr(a, "href", a_href_value);
			}
		},
		d(detaching) {
			if (detaching) detach(a);
			if (if_block) if_block.d();
		}
	};
}

// (163:14) {#if record['Name'] && !hideGalleryTitles}
function create_if_block_8(ctx) {
	let t_value = /*record*/ ctx[17]['Name'] + "";
	let t;

	return {
		c() {
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*tableRows*/ 4 && t_value !== (t_value = /*record*/ ctx[17]['Name'] + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (168:10) {#each getRecordItems(record, ['Name']) as item}
function create_each_block_2$2(ctx) {
	let div;
	let collectionprop;
	let t;
	let current;

	collectionprop = new CollectionProp({
			props: {
				fieldItem: /*item*/ ctx[20].value,
				tableData: /*tableData*/ ctx[1],
				api: /*api*/ ctx[0],
				record: /*record*/ ctx[17],
				schema: /*item*/ ctx[20].schema
			}
		});

	return {
		c() {
			div = element("div");
			create_component(collectionprop.$$.fragment);
			t = space();
			attr(div, "class", "notion-item");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			mount_component(collectionprop, div, null);
			append(div, t);
			current = true;
		},
		p(ctx, dirty) {
			const collectionprop_changes = {};
			if (dirty & /*tableRows*/ 4) collectionprop_changes.fieldItem = /*item*/ ctx[20].value;
			if (dirty & /*tableData*/ 2) collectionprop_changes.tableData = /*tableData*/ ctx[1];
			if (dirty & /*api*/ 1) collectionprop_changes.api = /*api*/ ctx[0];
			if (dirty & /*tableRows*/ 4) collectionprop_changes.record = /*record*/ ctx[17];
			if (dirty & /*tableRows*/ 4) collectionprop_changes.schema = /*item*/ ctx[20].schema;
			collectionprop.$set(collectionprop_changes);
		},
		i(local) {
			if (current) return;
			transition_in(collectionprop.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(collectionprop.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_component(collectionprop);
		}
	};
}

// (100:8) {#if _format.gallery_cover}
function create_if_block_1$5(ctx) {
	let div;
	let show_if = /*getCover*/ ctx[4](/*record*/ ctx[17]);
	let current;
	let if_block = show_if && create_if_block_2$5(ctx);

	return {
		c() {
			div = element("div");
			if (if_block) if_block.c();
			attr(div, "class", "notion-galleryboard-cover");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if (if_block) if_block.m(div, null);
			current = true;
		},
		p(ctx, dirty) {
			if (dirty & /*tableRows*/ 4) show_if = /*getCover*/ ctx[4](/*record*/ ctx[17]);

			if (show_if) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*tableRows*/ 4) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block_2$5(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(div, null);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (if_block) if_block.d();
		}
	};
}

// (102:12) {#if getCover(record)}
function create_if_block_2$5(ctx) {
	let t;
	let div;
	let current;

	function select_block_type_1(ctx, dirty) {
		if (/*record*/ ctx[17]['URL']) return create_if_block_3$1;
		return create_else_block$6;
	}

	let current_block_type = select_block_type_1(ctx);
	let if_block = current_block_type(ctx);
	let each_value_1 = /*getRecordItems*/ ctx[3](/*record*/ ctx[17], ['Name']);
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			if_block.c();
			t = space();
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(div, "class", "notion-galleryboard-description");
		},
		m(target, anchor) {
			if_block.m(target, anchor);
			insert(target, t, anchor);
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(t.parentNode, t);
				}
			}

			if (dirty & /*getRecordItems, tableRows, tableData, api*/ 15) {
				each_value_1 = /*getRecordItems*/ ctx[3](/*record*/ ctx[17], ['Name']);
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block_1$3(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(div, null);
					}
				}

				group_outros();

				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value_1.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if_block.d(detaching);
			if (detaching) detach(t);
			if (detaching) detach(div);
			destroy_each(each_blocks, detaching);
		}
	};
}

// (113:14) {:else}
function create_else_block$6(ctx) {
	let img;
	let img_style_value;
	let img_alt_value;
	let img_src_value;
	let t;
	let if_block_anchor;
	let if_block = /*record*/ ctx[17]['Name'] && !/*hideGalleryTitles*/ ctx[11] && create_if_block_5$1(ctx);

	return {
		c() {
			img = element("img");
			t = space();
			if (if_block) if_block.c();
			if_block_anchor = empty();

			attr(img, "style", img_style_value = /*_coverAspect*/ ctx[6]
			? `object-fit: ${/*_coverAspect*/ ctx[6]}`
			: ``);

			attr(img, "alt", img_alt_value = /*getCover*/ ctx[4](/*record*/ ctx[17]).name);
			if (!src_url_equal(img.src, img_src_value = /*getCover*/ ctx[4](/*record*/ ctx[17]).url)) attr(img, "src", img_src_value);
		},
		m(target, anchor) {
			insert(target, img, anchor);
			insert(target, t, anchor);
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*_coverAspect*/ 64 && img_style_value !== (img_style_value = /*_coverAspect*/ ctx[6]
			? `object-fit: ${/*_coverAspect*/ ctx[6]}`
			: ``)) {
				attr(img, "style", img_style_value);
			}

			if (dirty & /*tableRows*/ 4 && img_alt_value !== (img_alt_value = /*getCover*/ ctx[4](/*record*/ ctx[17]).name)) {
				attr(img, "alt", img_alt_value);
			}

			if (dirty & /*tableRows*/ 4 && !src_url_equal(img.src, img_src_value = /*getCover*/ ctx[4](/*record*/ ctx[17]).url)) {
				attr(img, "src", img_src_value);
			}

			if (/*record*/ ctx[17]['Name'] && !/*hideGalleryTitles*/ ctx[11]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_5$1(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		d(detaching) {
			if (detaching) detach(img);
			if (detaching) detach(t);
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

// (103:14) {#if record['URL']}
function create_if_block_3$1(ctx) {
	let a;
	let img;
	let img_style_value;
	let img_alt_value;
	let img_src_value;
	let t;
	let a_href_value;
	let if_block = /*record*/ ctx[17]['Name'] && !/*hideGalleryTitles*/ ctx[11] && create_if_block_4$1(ctx);

	return {
		c() {
			a = element("a");
			img = element("img");
			t = space();
			if (if_block) if_block.c();

			attr(img, "style", img_style_value = /*_coverAspect*/ ctx[6]
			? `object-fit: ${/*_coverAspect*/ ctx[6]}`
			: ``);

			attr(img, "alt", img_alt_value = /*getCover*/ ctx[4](/*record*/ ctx[17]).name);
			if (!src_url_equal(img.src, img_src_value = /*getCover*/ ctx[4](/*record*/ ctx[17]).url)) attr(img, "src", img_src_value);
			attr(a, "sapper:prefetch", "");
			attr(a, "href", a_href_value = /*record*/ ctx[17]['URL']);
		},
		m(target, anchor) {
			insert(target, a, anchor);
			append(a, img);
			append(a, t);
			if (if_block) if_block.m(a, null);
		},
		p(ctx, dirty) {
			if (dirty & /*_coverAspect*/ 64 && img_style_value !== (img_style_value = /*_coverAspect*/ ctx[6]
			? `object-fit: ${/*_coverAspect*/ ctx[6]}`
			: ``)) {
				attr(img, "style", img_style_value);
			}

			if (dirty & /*tableRows*/ 4 && img_alt_value !== (img_alt_value = /*getCover*/ ctx[4](/*record*/ ctx[17]).name)) {
				attr(img, "alt", img_alt_value);
			}

			if (dirty & /*tableRows*/ 4 && !src_url_equal(img.src, img_src_value = /*getCover*/ ctx[4](/*record*/ ctx[17]).url)) {
				attr(img, "src", img_src_value);
			}

			if (/*record*/ ctx[17]['Name'] && !/*hideGalleryTitles*/ ctx[11]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_4$1(ctx);
					if_block.c();
					if_block.m(a, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (dirty & /*tableRows*/ 4 && a_href_value !== (a_href_value = /*record*/ ctx[17]['URL'])) {
				attr(a, "href", a_href_value);
			}
		},
		d(detaching) {
			if (detaching) detach(a);
			if (if_block) if_block.d();
		}
	};
}

// (118:16) {#if record['Name'] && !hideGalleryTitles}
function create_if_block_5$1(ctx) {
	let t_value = /*record*/ ctx[17]['Name'] + "";
	let t;

	return {
		c() {
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*tableRows*/ 4 && t_value !== (t_value = /*record*/ ctx[17]['Name'] + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (109:18) {#if record['Name'] && !hideGalleryTitles}
function create_if_block_4$1(ctx) {
	let t_value = /*record*/ ctx[17]['Name'] + "";
	let t;

	return {
		c() {
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*tableRows*/ 4 && t_value !== (t_value = /*record*/ ctx[17]['Name'] + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (121:16) {#each getRecordItems(record, ['Name']) as item}
function create_each_block_1$3(ctx) {
	let div;
	let collectionprop;
	let t;
	let current;

	collectionprop = new CollectionProp({
			props: {
				fieldItem: /*item*/ ctx[20].value,
				tableData: /*tableData*/ ctx[1],
				api: /*api*/ ctx[0],
				record: /*record*/ ctx[17],
				schema: /*item*/ ctx[20].schema
			}
		});

	return {
		c() {
			div = element("div");
			create_component(collectionprop.$$.fragment);
			t = space();
			attr(div, "class", "notion-item");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			mount_component(collectionprop, div, null);
			append(div, t);
			current = true;
		},
		p(ctx, dirty) {
			const collectionprop_changes = {};
			if (dirty & /*tableRows*/ 4) collectionprop_changes.fieldItem = /*item*/ ctx[20].value;
			if (dirty & /*tableData*/ 2) collectionprop_changes.tableData = /*tableData*/ ctx[1];
			if (dirty & /*api*/ 1) collectionprop_changes.api = /*api*/ ctx[0];
			if (dirty & /*tableRows*/ 4) collectionprop_changes.record = /*record*/ ctx[17];
			if (dirty & /*tableRows*/ 4) collectionprop_changes.schema = /*item*/ ctx[20].schema;
			collectionprop.$set(collectionprop_changes);
		},
		i(local) {
			if (current) return;
			transition_in(collectionprop.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(collectionprop.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_component(collectionprop);
		}
	};
}

// (97:2) {#each tableRows as record}
function create_each_block$4(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block$7, create_if_block_6, create_else_block_2];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*isImageLinks*/ ctx[10]) return 0;
		if (/*isProfiles*/ ctx[9]) return 1;
		return 2;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				} else {
					if_block.p(ctx, dirty);
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function create_fragment$8(ctx) {
	let div;
	let div_class_value;
	let current;
	let each_value = /*tableRows*/ ctx[2];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(div, "class", div_class_value = "notion-collection-gallery " + /*classes*/ ctx[8] + " notion-galleryboard-" + /*_coverType*/ ctx[5] + " notion-galleryboard-" + /*_coverSize*/ ctx[7] + " notion-galleryboard-" + /*_coverAspect*/ ctx[6]);
			toggle_class(div, "isProfiles", /*isProfiles*/ ctx[9]);
		},
		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			current = true;
		},
		p(ctx, [dirty]) {
			if (dirty & /*getRecordItems, tableRows, tableData, api, hideGalleryTitles, _coverAspect, getCover, _format, isImageLinks, isProfiles*/ 7775) {
				each_value = /*tableRows*/ ctx[2];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$4(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block$4(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(div, null);
					}
				}

				group_outros();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}

			if (!current || dirty & /*classes, _coverType, _coverSize, _coverAspect*/ 480 && div_class_value !== (div_class_value = "notion-collection-gallery " + /*classes*/ ctx[8] + " notion-galleryboard-" + /*_coverType*/ ctx[5] + " notion-galleryboard-" + /*_coverSize*/ ctx[7] + " notion-galleryboard-" + /*_coverAspect*/ ctx[6])) {
				attr(div, "class", div_class_value);
			}

			if (dirty & /*classes, _coverType, _coverSize, _coverAspect, isProfiles*/ 992) {
				toggle_class(div, "isProfiles", /*isProfiles*/ ctx[9]);
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_each(each_blocks, detaching);
		}
	};
}

function instance$8($$self, $$props, $$invalidate) {
	let { api, tableData = null, tableRows, view } = $$props;
	let _format = view.format;
	let _coverType, _coverProperty, _coverAspect, _coverSize, _props;

	// these strings are weird and have some hidden properties this erases them
	let _description, classes, isProfiles, isImageLinks, hideGalleryTitles;

	const getRecordItems = (card, skip = []) => {
		let recordItem = [];

		_props.map(p => {
			if (p.visible) {
				let schema = tableData.schema[p.property];
				let colName = schema.name;

				// recordItem.push({...card, schema: tableData.schema[p.property]})
				if (!skip.includes(colName)) recordItem.push({ value: card[colName], schema });
			}
		});

		return recordItem;
	};

	const getCover = card => {
		let cover;

		if (_coverType && _coverType == "property") {
			let colName = tableData.schema[_coverProperty].name;

			cover = card[colName] && card[colName].length > 0
			? card[colName][0]
			: "";
		} else if (_coverType && _coverType == "page_cover") {
			cover = {
				url: card.format && card.format.page_cover && toNotionImageUrl(card.format.page_cover, card.id)
			};
		}

		return cover;
	};

	$$self.$$set = $$props => {
		if ('api' in $$props) $$invalidate(0, api = $$props.api);
		if ('tableData' in $$props) $$invalidate(1, tableData = $$props.tableData);
		if ('tableRows' in $$props) $$invalidate(2, tableRows = $$props.tableRows);
		if ('view' in $$props) $$invalidate(13, view = $$props.view);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*tableData, _description, classes*/ 16642) {
			if (tableData && tableData.collection.value.description && tableData.collection.value.description[0]) {
				$$invalidate(14, _description = tableData.collection.value.description && tableData.collection.value.description[0][0]);

				if (_description.includes("#classes")) {
					$$invalidate(8, classes += " " + _description);
				}

				$$invalidate(9, isProfiles = _description.includes("#profiles"));
				$$invalidate(10, isImageLinks = _description.includes("#image_links"));
				$$invalidate(11, hideGalleryTitles = _description.includes("#hide_gallery_titles")); // hides gallery titles
			}
		}

		if ($$self.$$.dirty & /*view*/ 8192) {
			if (view) {
				$$invalidate(5, _coverType = _format.gallery_cover && _format.gallery_cover.type);
				_coverProperty = _format.gallery_cover && _format.gallery_cover.property;
				$$invalidate(6, _coverAspect = _format.gallery_cover && _format.gallery_cover_aspect || "contain");
				$$invalidate(7, _coverSize = _format.gallery_cover_size || "medium");
				_props = _format.gallery_properties;
			}
		}
	};

	return [
		api,
		tableData,
		tableRows,
		getRecordItems,
		getCover,
		_coverType,
		_coverAspect,
		_coverSize,
		classes,
		isProfiles,
		isImageLinks,
		hideGalleryTitles,
		_format,
		view,
		_description
	];
}

class CollectionGallery extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
			api: 0,
			tableData: 1,
			tableRows: 2,
			view: 13,
			getRecordItems: 3,
			getCover: 4
		});
	}

	get getRecordItems() {
		return this.$$.ctx[3];
	}

	get getCover() {
		return this.$$.ctx[4];
	}
}

/* src/subcomponents/CollectionList.svelte generated by Svelte v3.49.0 */

function get_each_context$3(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[9] = list[i];
	return child_ctx;
}

function get_each_context_2$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[12] = list[i];
	return child_ctx;
}

function get_each_context_1$2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[12] = list[i];
	return child_ctx;
}

// (81:4) {:else}
function create_else_block$5(ctx) {
	let div2;
	let div0;
	let span;
	let t0_value = /*record*/ ctx[9].Name + "";
	let t0;
	let t1;
	let div1;
	let t2;
	let current;
	let each_value_2 = /*getRecordItems*/ ctx[3](/*record*/ ctx[9]);
	let each_blocks = [];

	for (let i = 0; i < each_value_2.length; i += 1) {
		each_blocks[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			div2 = element("div");
			div0 = element("div");
			span = element("span");
			t0 = text(t0_value);
			t1 = space();
			div1 = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t2 = space();
			attr(span, "class", "notion-inline-title");
			attr(div0, "class", "notion-collection-name");
			attr(div1, "class", "notion-collection-props");
			attr(div2, "class", "notion-collection-item");
		},
		m(target, anchor) {
			insert(target, div2, anchor);
			append(div2, div0);
			append(div0, span);
			append(span, t0);
			append(div2, t1);
			append(div2, div1);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div1, null);
			}

			append(div2, t2);
			current = true;
		},
		p(ctx, dirty) {
			if ((!current || dirty & /*tableRows*/ 4) && t0_value !== (t0_value = /*record*/ ctx[9].Name + "")) set_data(t0, t0_value);

			if (dirty & /*getRecordItems, tableRows, tableData, api*/ 15) {
				each_value_2 = /*getRecordItems*/ ctx[3](/*record*/ ctx[9]);
				let i;

				for (i = 0; i < each_value_2.length; i += 1) {
					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block_2$1(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(div1, null);
					}
				}

				group_outros();

				for (i = each_value_2.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value_2.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(div2);
			destroy_each(each_blocks, detaching);
		}
	};
}

// (55:4) {#if record.URL}
function create_if_block$6(ctx) {
	let div;
	let a;
	let span3;
	let span1;
	let span0;
	let t0_value = /*record*/ ctx[9].Name + "";
	let t0;
	let t1;
	let span2;
	let a_href_value;
	let t2;
	let current;
	let each_value_1 = /*getRecordItems*/ ctx[3](/*record*/ ctx[9]);
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			div = element("div");
			a = element("a");
			span3 = element("span");
			span1 = element("span");
			span0 = element("span");
			t0 = text(t0_value);
			t1 = space();
			span2 = element("span");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t2 = space();
			attr(span0, "class", "notion-inline-title");
			attr(span1, "class", "notion-collection-name");
			attr(span2, "class", "notion-collection-props");
			attr(span3, "class", "notion-collection-item");
			attr(a, "rel", "external noreferrer");
			attr(a, "href", a_href_value = /*record*/ ctx[9].URL);
			attr(a, "target", "_blank");
			attr(a, "class", "notion-list-link");
			attr(div, "class", "notion-item");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, a);
			append(a, span3);
			append(span3, span1);
			append(span1, span0);
			append(span0, t0);
			append(span3, t1);
			append(span3, span2);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(span2, null);
			}

			append(div, t2);
			current = true;
		},
		p(ctx, dirty) {
			if ((!current || dirty & /*tableRows*/ 4) && t0_value !== (t0_value = /*record*/ ctx[9].Name + "")) set_data(t0, t0_value);

			if (dirty & /*getRecordItems, tableRows, tableData, api*/ 15) {
				each_value_1 = /*getRecordItems*/ ctx[3](/*record*/ ctx[9]);
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block_1$2(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(span2, null);
					}
				}

				group_outros();

				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}

			if (!current || dirty & /*tableRows*/ 4 && a_href_value !== (a_href_value = /*record*/ ctx[9].URL)) {
				attr(a, "href", a_href_value);
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value_1.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_each(each_blocks, detaching);
		}
	};
}

// (87:10) {#each getRecordItems(record) as item}
function create_each_block_2$1(ctx) {
	let div;
	let collectionprop;
	let t;
	let current;

	collectionprop = new CollectionProp({
			props: {
				fieldItem: /*item*/ ctx[12].value,
				tableData: /*tableData*/ ctx[1],
				api: /*api*/ ctx[0],
				record: /*record*/ ctx[9],
				schema: /*item*/ ctx[12].schema
			}
		});

	return {
		c() {
			div = element("div");
			create_component(collectionprop.$$.fragment);
			t = space();
			attr(div, "class", "notion-item");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			mount_component(collectionprop, div, null);
			append(div, t);
			current = true;
		},
		p(ctx, dirty) {
			const collectionprop_changes = {};
			if (dirty & /*tableRows*/ 4) collectionprop_changes.fieldItem = /*item*/ ctx[12].value;
			if (dirty & /*tableData*/ 2) collectionprop_changes.tableData = /*tableData*/ ctx[1];
			if (dirty & /*api*/ 1) collectionprop_changes.api = /*api*/ ctx[0];
			if (dirty & /*tableRows*/ 4) collectionprop_changes.record = /*record*/ ctx[9];
			if (dirty & /*tableRows*/ 4) collectionprop_changes.schema = /*item*/ ctx[12].schema;
			collectionprop.$set(collectionprop_changes);
		},
		i(local) {
			if (current) return;
			transition_in(collectionprop.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(collectionprop.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_component(collectionprop);
		}
	};
}

// (67:14) {#each getRecordItems(record) as item}
function create_each_block_1$2(ctx) {
	let span;
	let collectionprop;
	let t;
	let current;

	collectionprop = new CollectionProp({
			props: {
				fieldItem: /*item*/ ctx[12].value,
				tableData: /*tableData*/ ctx[1],
				api: /*api*/ ctx[0],
				record: /*record*/ ctx[9],
				schema: /*item*/ ctx[12].schema
			}
		});

	return {
		c() {
			span = element("span");
			create_component(collectionprop.$$.fragment);
			t = space();
			attr(span, "class", "notion-item");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			mount_component(collectionprop, span, null);
			append(span, t);
			current = true;
		},
		p(ctx, dirty) {
			const collectionprop_changes = {};
			if (dirty & /*tableRows*/ 4) collectionprop_changes.fieldItem = /*item*/ ctx[12].value;
			if (dirty & /*tableData*/ 2) collectionprop_changes.tableData = /*tableData*/ ctx[1];
			if (dirty & /*api*/ 1) collectionprop_changes.api = /*api*/ ctx[0];
			if (dirty & /*tableRows*/ 4) collectionprop_changes.record = /*record*/ ctx[9];
			if (dirty & /*tableRows*/ 4) collectionprop_changes.schema = /*item*/ ctx[12].schema;
			collectionprop.$set(collectionprop_changes);
		},
		i(local) {
			if (current) return;
			transition_in(collectionprop.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(collectionprop.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(span);
			destroy_component(collectionprop);
		}
	};
}

// (54:2) {#each tableRows as record}
function create_each_block$3(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block$6, create_else_block$5];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*record*/ ctx[9].URL) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				} else {
					if_block.p(ctx, dirty);
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function create_fragment$7(ctx) {
	let div;
	let current;
	let each_value = /*tableRows*/ ctx[2];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(div, "class", "notion-collection-list ");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			current = true;
		},
		p(ctx, [dirty]) {
			if (dirty & /*tableRows, getRecordItems, tableData, api*/ 15) {
				each_value = /*tableRows*/ ctx[2];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$3(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block$3(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(div, null);
					}
				}

				group_outros();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_each(each_blocks, detaching);
		}
	};
}

function instance$7($$self, $$props, $$invalidate) {
	let { api, tableData = null, tableRows, view } = $$props;
	let _format = view.format, _props;

	const getRecordItems = card => {
		let recordItem = [];

		_props.map(p => {
			if (p.visible) {
				let schema = tableData.schema[p.property];
				let colName = schema.name;

				// recordItem.push({...card, schema: tableData.schema[p.property]})
				recordItem.push({ value: card[colName], schema });
			}
		});

		return recordItem;
	};

	$$self.$$set = $$props => {
		if ('api' in $$props) $$invalidate(0, api = $$props.api);
		if ('tableData' in $$props) $$invalidate(1, tableData = $$props.tableData);
		if ('tableRows' in $$props) $$invalidate(2, tableRows = $$props.tableRows);
		if ('view' in $$props) $$invalidate(4, view = $$props.view);
	};

	if (_format) {
		_props = _format.list_properties;
	}

	return [api, tableData, tableRows, getRecordItems, view];
}

class CollectionList extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
			api: 0,
			tableData: 1,
			tableRows: 2,
			view: 4,
			getRecordItems: 3
		});
	}

	get getRecordItems() {
		return this.$$.ctx[3];
	}
}

/* src/subcomponents/CollectionBoard.svelte generated by Svelte v3.49.0 */

function get_each_context$2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[17] = list[i];
	return child_ctx;
}

function get_each_context_1$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[20] = list[i];
	return child_ctx;
}

function get_each_context_2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[23] = list[i];
	return child_ctx;
}

// (10:16) {:else}
function create_else_block$4(ctx) {
	let collectionprop;
	let current;

	collectionprop = new CollectionProp({
			props: {
				fieldItem: /*column*/ ctx[17].value.value,
				tableData: /*tableData*/ ctx[1],
				api: /*api*/ ctx[0],
				record: null,
				schema: /*column*/ ctx[17].schema
			}
		});

	return {
		c() {
			create_component(collectionprop.$$.fragment);
		},
		m(target, anchor) {
			mount_component(collectionprop, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const collectionprop_changes = {};
			if (dirty & /*tableData*/ 2) collectionprop_changes.tableData = /*tableData*/ ctx[1];
			if (dirty & /*api*/ 1) collectionprop_changes.api = /*api*/ ctx[0];
			collectionprop.$set(collectionprop_changes);
		},
		i(local) {
			if (current) return;
			transition_in(collectionprop.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(collectionprop.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(collectionprop, detaching);
		}
	};
}

// (8:16) {#if !column.value.value || column.value.value == ''}
function create_if_block_2$4(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			attr(div, "class", "notion-galleryboard-empty");
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		p: noop,
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (24:24) {#if _coverType && getCover(record).url}
function create_if_block$5(ctx) {
	let div;
	let show_if = /*getCover*/ ctx[5](/*record*/ ctx[20]).url;
	let if_block = show_if && create_if_block_1$4(ctx);

	return {
		c() {
			div = element("div");
			if (if_block) if_block.c();
			attr(div, "class", "notion-galleryboard-cover");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if (if_block) if_block.m(div, null);
		},
		p(ctx, dirty) {
			if (show_if) if_block.p(ctx, dirty);
		},
		d(detaching) {
			if (detaching) detach(div);
			if (if_block) if_block.d();
		}
	};
}

// (26:32) {#if getCover(record).url}
function create_if_block_1$4(ctx) {
	let img;
	let img_style_value;
	let img_src_value;

	return {
		c() {
			img = element("img");

			attr(img, "style", img_style_value = /*_coverAspect*/ ctx[7]
			? `object-fit: ${/*_coverAspect*/ ctx[7]}`
			: ``);

			attr(img, "alt", /*getCover*/ ctx[5](/*record*/ ctx[20]).name);
			if (!src_url_equal(img.src, img_src_value = /*getCover*/ ctx[5](/*record*/ ctx[20]).url)) attr(img, "src", img_src_value);
		},
		m(target, anchor) {
			insert(target, img, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*_coverAspect*/ 128 && img_style_value !== (img_style_value = /*_coverAspect*/ ctx[7]
			? `object-fit: ${/*_coverAspect*/ ctx[7]}`
			: ``)) {
				attr(img, "style", img_style_value);
			}
		},
		d(detaching) {
			if (detaching) detach(img);
		}
	};
}

// (35:28) {#each getRecordItems(record) as item}
function create_each_block_2(ctx) {
	let div;
	let collectionprop;
	let t;
	let current;

	collectionprop = new CollectionProp({
			props: {
				fieldItem: /*item*/ ctx[23].value,
				tableData: /*tableData*/ ctx[1],
				api: /*api*/ ctx[0],
				record: /*record*/ ctx[20],
				schema: /*item*/ ctx[23].schema
			}
		});

	return {
		c() {
			div = element("div");
			create_component(collectionprop.$$.fragment);
			t = space();
			attr(div, "class", "notion-item");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			mount_component(collectionprop, div, null);
			append(div, t);
			current = true;
		},
		p(ctx, dirty) {
			const collectionprop_changes = {};
			if (dirty & /*tableData*/ 2) collectionprop_changes.tableData = /*tableData*/ ctx[1];
			if (dirty & /*api*/ 1) collectionprop_changes.api = /*api*/ ctx[0];
			collectionprop.$set(collectionprop_changes);
		},
		i(local) {
			if (current) return;
			transition_in(collectionprop.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(collectionprop.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_component(collectionprop);
		}
	};
}

// (20:16) {#each getColumnRecords(column) as record}
function create_each_block_1$1(ctx) {
	let div1;
	let show_if = /*_coverType*/ ctx[6] && /*getCover*/ ctx[5](/*record*/ ctx[20]).url;
	let t0;
	let div0;
	let t1;
	let current;
	let if_block = show_if && create_if_block$5(ctx);
	let each_value_2 = /*getRecordItems*/ ctx[4](/*record*/ ctx[20]);
	let each_blocks = [];

	for (let i = 0; i < each_value_2.length; i += 1) {
		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			div1 = element("div");
			if (if_block) if_block.c();
			t0 = space();
			div0 = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t1 = space();
			attr(div0, "class", "notion-galleryboard-props");
			attr(div1, "class", "notion-galleryboard-item");
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			if (if_block) if_block.m(div1, null);
			append(div1, t0);
			append(div1, div0);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div0, null);
			}

			append(div1, t1);
			current = true;
		},
		p(ctx, dirty) {
			if (dirty & /*_coverType*/ 64) show_if = /*_coverType*/ ctx[6] && /*getCover*/ ctx[5](/*record*/ ctx[20]).url;

			if (show_if) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block$5(ctx);
					if_block.c();
					if_block.m(div1, t0);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (dirty & /*getRecordItems, getColumnRecords, getBoardColumns, tableData, api*/ 31) {
				each_value_2 = /*getRecordItems*/ ctx[4](/*record*/ ctx[20]);
				let i;

				for (i = 0; i < each_value_2.length; i += 1) {
					const child_ctx = get_each_context_2(ctx, each_value_2, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block_2(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(div0, null);
					}
				}

				group_outros();

				for (i = each_value_2.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value_2.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(div1);
			if (if_block) if_block.d();
			destroy_each(each_blocks, detaching);
		}
	};
}

// (4:4) {#each getBoardColumns() as column}
function create_each_block$2(ctx) {
	let div2;
	let div0;
	let current_block_type_index;
	let if_block;
	let t0;
	let div1;
	let t1;
	let current;
	const if_block_creators = [create_if_block_2$4, create_else_block$4];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (!/*column*/ ctx[17].value.value || /*column*/ ctx[17].value.value == '') return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	let each_value_1 = /*getColumnRecords*/ ctx[3](/*column*/ ctx[17]);
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			div2 = element("div");
			div0 = element("div");
			if_block.c();
			t0 = space();
			div1 = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t1 = space();
			attr(div0, "class", "notion-galleryboard-header notion-item");
			attr(div1, "class", "notion-galleryboard-items");
			attr(div2, "class", "notion-galleryboard-column");
		},
		m(target, anchor) {
			insert(target, div2, anchor);
			append(div2, div0);
			if_blocks[current_block_type_index].m(div0, null);
			append(div2, t0);
			append(div2, div1);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div1, null);
			}

			append(div2, t1);
			current = true;
		},
		p(ctx, dirty) {
			if_block.p(ctx, dirty);

			if (dirty & /*getRecordItems, getColumnRecords, getBoardColumns, tableData, api, _coverAspect, getCover, _coverType*/ 255) {
				each_value_1 = /*getColumnRecords*/ ctx[3](/*column*/ ctx[17]);
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block_1$1(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(div1, null);
					}
				}

				group_outros();

				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);

			for (let i = 0; i < each_value_1.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			transition_out(if_block);
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(div2);
			if_blocks[current_block_type_index].d();
			destroy_each(each_blocks, detaching);
		}
	};
}

function create_fragment$6(ctx) {
	let div;
	let div_class_value;
	let current;
	let each_value = /*getBoardColumns*/ ctx[2]();
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(div, "class", div_class_value = "notion-collection-board notion-galleryboard-flex notion-galleryboard-" + /*_coverType*/ ctx[6] + " notion-galleryboard-" + /*_coverSize*/ ctx[8] + " notion-galleryboard-" + /*_coverAspect*/ ctx[7]);
		},
		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			current = true;
		},
		p(ctx, [dirty]) {
			if (dirty & /*getColumnRecords, getBoardColumns, getRecordItems, tableData, api, _coverAspect, getCover, _coverType*/ 255) {
				each_value = /*getBoardColumns*/ ctx[2]();
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$2(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block$2(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(div, null);
					}
				}

				group_outros();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}

			if (!current || dirty & /*_coverType, _coverSize, _coverAspect*/ 448 && div_class_value !== (div_class_value = "notion-collection-board notion-galleryboard-flex notion-galleryboard-" + /*_coverType*/ ctx[6] + " notion-galleryboard-" + /*_coverSize*/ ctx[8] + " notion-galleryboard-" + /*_coverAspect*/ ctx[7])) {
				attr(div, "class", div_class_value);
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_each(each_blocks, detaching);
		}
	};
}

function instance$6($$self, $$props, $$invalidate) {
	let { api, tableData = null, tableRows, view } = $$props;
	let _format = view.format;

	let _boardColumns,
		_coverType,
		_coverAspect = 'cover',
		_coverProperty,
		_coverSize,
		_props;

	const getBoardColumns = () => {
		let columns = [];

		_boardColumns.map(c => {
			if (!c.hidden) {
				let schema = tableData.schema[c.property];
				schema.name;
				columns.push({ value: c.value, schema });
			}
		});

		return columns;
	};

	const getColumnRecords = column => {
		let records = [];

		if (!column.value.value) {
			// empty property column
			tableRows.map(row => {
				if (!row[column.schema.name]) {
					records.push(row);
				}
			});
		} else {
			tableRows.map(row => {
				if (row[column.schema.name] && (row[column.schema.name] == column.value.value || row[column.schema.name].includes(column.value.value))) {
					records.push(row);
				}
			});
		}

		return records;
	};

	const getRecordItems = card => {
		let recordItem = [];

		_props.map(p => {
			if (p.visible) {
				let schema = tableData.schema[p.property];
				let colName = schema.name;

				// recordItem.push({...card, schema: tableData.schema[p.property]})
				recordItem.push({ value: card[colName], schema });
			}
		});

		return recordItem;
	};

	const getCover = card => {
		let cover;

		if (_coverType && _coverType == 'property') {
			let colName = tableData.schema[_coverProperty].name;

			cover = card[colName] && card[colName].length > 0
			? card[colName][0]
			: '';
		} else if (_coverType && _coverType == 'page_cover') {
			cover = {
				url: card.format && card.format.page_cover && toNotionImageUrl(card.format.page_cover, card.id)
			};
		}

		return cover;
	};

	$$self.$$set = $$props => {
		if ('api' in $$props) $$invalidate(0, api = $$props.api);
		if ('tableData' in $$props) $$invalidate(1, tableData = $$props.tableData);
		if ('tableRows' in $$props) $$invalidate(9, tableRows = $$props.tableRows);
		if ('view' in $$props) $$invalidate(10, view = $$props.view);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*view*/ 1024) {
			// $: if(tableData && tableData.collection.value.description && tableData.collection.value.description[0]) {
			//   _description = tableData.collection.value.description && tableData.collection.value.description[0][0]
			//   isLinks = _description.includes('#links')
			// }
			if (view && _format) {
				_boardColumns = _format.board_columns;
				$$invalidate(6, _coverType = _format.board_cover && _format.board_cover.type);
				$$invalidate(8, _coverSize = _format.board_cover_size || 'medium');
				$$invalidate(7, _coverAspect = _format.board_cover_aspect || 'contain');
				_coverProperty = _format.board_cover && _format.board_cover.property;
				_props = _format.board_properties;
			}
		}
	};

	return [
		api,
		tableData,
		getBoardColumns,
		getColumnRecords,
		getRecordItems,
		getCover,
		_coverType,
		_coverAspect,
		_coverSize,
		tableRows,
		view
	];
}

class CollectionBoard extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
			api: 0,
			tableData: 1,
			tableRows: 9,
			view: 10,
			getBoardColumns: 2,
			getColumnRecords: 3,
			getRecordItems: 4,
			getCover: 5
		});
	}

	get getBoardColumns() {
		return this.$$.ctx[2];
	}

	get getColumnRecords() {
		return this.$$.ctx[3];
	}

	get getRecordItems() {
		return this.$$.ctx[4];
	}

	get getCover() {
		return this.$$.ctx[5];
	}
}

/* src/components/Collection.svelte generated by Svelte v3.49.0 */

// (97:0) {#if tableData && tableData.name}
function create_if_block$4(ctx) {
	let div;
	let t;
	let figure;
	let current_block_type_index;
	let if_block1;
	let div_id_value;
	let current;
	let if_block0 = !/*isHideTitle*/ ctx[2] && create_if_block_5(ctx);

	const if_block_creators = [
		create_if_block_1$3,
		create_if_block_2$3,
		create_if_block_3,
		create_if_block_4,
		create_else_block$3
	];

	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*view*/ ctx[1].type == 'table') return 0;
		if (/*view*/ ctx[1].type == 'gallery') return 1;
		if (/*view*/ ctx[1].type == 'list') return 2;
		if (/*view*/ ctx[1].type == 'board') return 3;
		return 4;
	}

	current_block_type_index = select_block_type(ctx);
	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			div = element("div");
			if (if_block0) if_block0.c();
			t = space();
			figure = element("figure");
			if_block1.c();
			attr(figure, "class", "notion-collection-figure");
			attr(div, "class", "notion-collection");
			attr(div, "id", div_id_value = /*tableData*/ ctx[0].name);
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if (if_block0) if_block0.m(div, null);
			append(div, t);
			append(div, figure);
			if_blocks[current_block_type_index].m(figure, null);
			current = true;
		},
		p(ctx, dirty) {
			if (!/*isHideTitle*/ ctx[2]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_5(ctx);
					if_block0.c();
					if_block0.m(div, t);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block1 = if_blocks[current_block_type_index];

				if (!if_block1) {
					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block1.c();
				} else {
					if_block1.p(ctx, dirty);
				}

				transition_in(if_block1, 1);
				if_block1.m(figure, null);
			}

			if (!current || dirty & /*tableData*/ 1 && div_id_value !== (div_id_value = /*tableData*/ ctx[0].name)) {
				attr(div, "id", div_id_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block1);
			current = true;
		},
		o(local) {
			transition_out(if_block1);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (if_block0) if_block0.d();
			if_blocks[current_block_type_index].d();
		}
	};
}

// (99:4) {#if !isHideTitle}
function create_if_block_5(ctx) {
	let h3;
	let t_value = /*tableData*/ ctx[0].name + "";
	let t;

	return {
		c() {
			h3 = element("h3");
			t = text(t_value);
			attr(h3, "class", "notion-collection-header");
		},
		m(target, anchor) {
			insert(target, h3, anchor);
			append(h3, t);
		},
		p(ctx, dirty) {
			if (dirty & /*tableData*/ 1 && t_value !== (t_value = /*tableData*/ ctx[0].name + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(h3);
		}
	};
}

// (111:6) {:else}
function create_else_block$3(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			attr(div, "class", "notion-collection-unsupported");
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		p: noop,
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (109:37) 
function create_if_block_4(ctx) {
	let collectionboard;
	let current;

	collectionboard = new CollectionBoard({
			props: {
				tableData: /*tableData*/ ctx[0],
				tableRows: /*tableRows*/ ctx[4],
				api: /*api*/ ctx[3],
				view: /*view*/ ctx[1]
			}
		});

	return {
		c() {
			create_component(collectionboard.$$.fragment);
		},
		m(target, anchor) {
			mount_component(collectionboard, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const collectionboard_changes = {};
			if (dirty & /*tableData*/ 1) collectionboard_changes.tableData = /*tableData*/ ctx[0];
			if (dirty & /*tableRows*/ 16) collectionboard_changes.tableRows = /*tableRows*/ ctx[4];
			if (dirty & /*api*/ 8) collectionboard_changes.api = /*api*/ ctx[3];
			if (dirty & /*view*/ 2) collectionboard_changes.view = /*view*/ ctx[1];
			collectionboard.$set(collectionboard_changes);
		},
		i(local) {
			if (current) return;
			transition_in(collectionboard.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(collectionboard.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(collectionboard, detaching);
		}
	};
}

// (107:36) 
function create_if_block_3(ctx) {
	let collectionlist;
	let current;

	collectionlist = new CollectionList({
			props: {
				tableData: /*tableData*/ ctx[0],
				tableRows: /*tableRows*/ ctx[4],
				api: /*api*/ ctx[3],
				view: /*view*/ ctx[1]
			}
		});

	return {
		c() {
			create_component(collectionlist.$$.fragment);
		},
		m(target, anchor) {
			mount_component(collectionlist, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const collectionlist_changes = {};
			if (dirty & /*tableData*/ 1) collectionlist_changes.tableData = /*tableData*/ ctx[0];
			if (dirty & /*tableRows*/ 16) collectionlist_changes.tableRows = /*tableRows*/ ctx[4];
			if (dirty & /*api*/ 8) collectionlist_changes.api = /*api*/ ctx[3];
			if (dirty & /*view*/ 2) collectionlist_changes.view = /*view*/ ctx[1];
			collectionlist.$set(collectionlist_changes);
		},
		i(local) {
			if (current) return;
			transition_in(collectionlist.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(collectionlist.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(collectionlist, detaching);
		}
	};
}

// (105:39) 
function create_if_block_2$3(ctx) {
	let collectiongallery;
	let current;

	collectiongallery = new CollectionGallery({
			props: {
				tableData: /*tableData*/ ctx[0],
				tableRows: /*tableRows*/ ctx[4],
				api: /*api*/ ctx[3],
				view: /*view*/ ctx[1]
			}
		});

	return {
		c() {
			create_component(collectiongallery.$$.fragment);
		},
		m(target, anchor) {
			mount_component(collectiongallery, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const collectiongallery_changes = {};
			if (dirty & /*tableData*/ 1) collectiongallery_changes.tableData = /*tableData*/ ctx[0];
			if (dirty & /*tableRows*/ 16) collectiongallery_changes.tableRows = /*tableRows*/ ctx[4];
			if (dirty & /*api*/ 8) collectiongallery_changes.api = /*api*/ ctx[3];
			if (dirty & /*view*/ 2) collectiongallery_changes.view = /*view*/ ctx[1];
			collectiongallery.$set(collectiongallery_changes);
		},
		i(local) {
			if (current) return;
			transition_in(collectiongallery.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(collectiongallery.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(collectiongallery, detaching);
		}
	};
}

// (103:6) {#if view.type == 'table'}
function create_if_block_1$3(ctx) {
	let collectiontable;
	let current;

	collectiontable = new CollectionTable({
			props: {
				tableData: /*tableData*/ ctx[0],
				tableRows: /*tableRows*/ ctx[4],
				api: /*api*/ ctx[3],
				view: /*view*/ ctx[1]
			}
		});

	return {
		c() {
			create_component(collectiontable.$$.fragment);
		},
		m(target, anchor) {
			mount_component(collectiontable, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const collectiontable_changes = {};
			if (dirty & /*tableData*/ 1) collectiontable_changes.tableData = /*tableData*/ ctx[0];
			if (dirty & /*tableRows*/ 16) collectiontable_changes.tableRows = /*tableRows*/ ctx[4];
			if (dirty & /*api*/ 8) collectiontable_changes.api = /*api*/ ctx[3];
			if (dirty & /*view*/ 2) collectiontable_changes.view = /*view*/ ctx[1];
			collectiontable.$set(collectiontable_changes);
		},
		i(local) {
			if (current) return;
			transition_in(collectiontable.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(collectiontable.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(collectiontable, detaching);
		}
	};
}

function create_fragment$5(ctx) {
	let t;
	let if_block1_anchor;
	let current;
	let if_block0 = false ;
	let if_block1 = /*tableData*/ ctx[0] && /*tableData*/ ctx[0].name && create_if_block$4(ctx);

	return {
		c() {
			t = space();
			if (if_block1) if_block1.c();
			if_block1_anchor = empty();
		},
		m(target, anchor) {
			insert(target, t, anchor);
			if (if_block1) if_block1.m(target, anchor);
			insert(target, if_block1_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {

			if (/*tableData*/ ctx[0] && /*tableData*/ ctx[0].name) {
				if (if_block1) {
					if_block1.p(ctx, dirty);

					if (dirty & /*tableData*/ 1) {
						transition_in(if_block1, 1);
					}
				} else {
					if_block1 = create_if_block$4(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block1);
			current = true;
		},
		o(local) {
			transition_out(if_block0);
			transition_out(if_block1);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(t);
			if (if_block1) if_block1.d(detaching);
			if (detaching) detach(if_block1_anchor);
		}
	};
}

function instance$5($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { block = {} } = $$props;
	let { api } = $$props;
	let { tableData = null } = $$props;
	let { view, isHideTitle, _description } = $$props;

	// export let classes = ''
	// export let columns
	// const request = fetch(`${api}/v1/table/${block.id}`)
	let request;

	let tableRows;

	$$self.$$set = $$props => {
		if ('block' in $$props) $$invalidate(6, block = $$props.block);
		if ('api' in $$props) $$invalidate(3, api = $$props.api);
		if ('tableData' in $$props) $$invalidate(0, tableData = $$props.tableData);
		if ('view' in $$props) $$invalidate(1, view = $$props.view);
		if ('isHideTitle' in $$props) $$invalidate(2, isHideTitle = $$props.isHideTitle);
		if ('_description' in $$props) $$invalidate(5, _description = $$props._description);
		if ('$$scope' in $$props) $$invalidate(7, $$scope = $$props.$$scope);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*tableData, api, block*/ 73) {
			if (!tableData && browser && fetch) {
				try {
					request = fetch(`${api}/v1/collection/${block.id}`).then(res => res.json()).then(json => {
						$$invalidate(0, tableData = json);

						// console.log('children:', tableData)
						// console.log('collection:', block, tableData, columns)
						return json;
					});
				} catch(e) {
					console.error("[Collection] fetch error", e);
				}
			}
		}

		if ($$self.$$.dirty & /*tableData, view*/ 3) {
			if (tableData) {
				// console.log('tableData:::', tableData)
				$$invalidate(1, view = tableData.views[0]);

				// console.log('VIEW:::: //tdata', view, tableData.views, tableData)
				if (tableData.rows) {
					// manipulate data here, e.g. sorting, filtering, insertions
					/* 
  property_filters: [{
    filter: {
      property: "title"
      filter: {
        operator: "string_contains"
        value: {
          type: "exact",
          value: "Banana"
        }
      }
    }
  }]
*/
					let filterObj = view.format?.property_filters?.[0]?.filter;

					$$invalidate(4, tableRows = tableData.rows);

					// console.log('lol:', filterObj)
					if (filterObj) {
						$$invalidate(4, tableRows = tableData.rows.filter(row => {
							// Check if the row value matches the filter value
							console.log('ok so...', filterObj.filter?.value?.type, filterObj.property, row, row[tableData.schema[filterObj.property].name], filterObj?.filter?.value?.value);

							if (filterObj.filter?.value?.type === 'exact') return row[tableData.schema[filterObj.property].name] === filterObj?.filter?.value?.value;
						}));
					}
				}
			} // console.log('VIEW:::: //tdata FILTER', tableRows)
		}

		if ($$self.$$.dirty & /*tableData, _description*/ 33) {
			// #hide_title : don't show the collection name / title
			if (tableData && tableData.collection.value.description && tableData.collection.value.description[0]) {
				$$invalidate(5, _description = tableData.collection.value.description && tableData.collection.value.description[0][0]);
				$$invalidate(2, isHideTitle = _description.includes("#hide_title"));
			}
		}
	};

	return [
		tableData,
		view,
		isHideTitle,
		api,
		tableRows,
		_description,
		block,
		$$scope,
		slots
	];
}

class Collection extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
			block: 6,
			api: 3,
			tableData: 0,
			view: 1,
			isHideTitle: 2,
			_description: 5
		});
	}
}

/* src/components/Todo.svelte generated by Svelte v3.49.0 */

function create_if_block_1$2(ctx) {
	let li;
	let current_block_type_index;
	let if_block;
	let current;
	const if_block_creators = [create_if_block_2$2, create_else_block$2];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*isChecked*/ ctx[1]) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			li = element("li");
			if_block.c();
		},
		m(target, anchor) {
			insert(target, li, anchor);
			if_blocks[current_block_type_index].m(li, null);
			current = true;
		},
		p(ctx, dirty) {
			if_block.p(ctx, dirty);
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(li);
			if_blocks[current_block_type_index].d();
		}
	};
}

// (19:12) {:else}
function create_else_block$2(ctx) {
	let div3;
	let div2;
	let t;
	let formattedtext;
	let current;
	formattedtext = new FormattedText({ props: { block: /*block*/ ctx[0] } });

	return {
		c() {
			div3 = element("div");
			div2 = element("div");
			div2.innerHTML = `<div class="notion-list-icon"><div class="notion-checkbox"><svg viewBox="0 0 16 16" class="checkboxSquare" style="width: 100%; height: 100%; display: block; fill: inherit; flex-shrink: 0; backface-visibility: hidden;"><path d="M1.5,1.5 L1.5,14.5 L14.5,14.5 L14.5,1.5 L1.5,1.5 Z M0,0 L16,0 L16,16 L0,16 L0,0 Z"></path></svg></div></div>`;
			t = space();
			create_component(formattedtext.$$.fragment);
			attr(div2, "class", "notion-list-icon-container");
			attr(div3, "class", "notion-list-item");
		},
		m(target, anchor) {
			insert(target, div3, anchor);
			append(div3, div2);
			append(div3, t);
			mount_component(formattedtext, div3, null);
			current = true;
		},
		p(ctx, dirty) {
			const formattedtext_changes = {};
			if (dirty & /*block*/ 1) formattedtext_changes.block = /*block*/ ctx[0];
			formattedtext.$set(formattedtext_changes);
		},
		i(local) {
			if (current) return;
			transition_in(formattedtext.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formattedtext.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div3);
			destroy_component(formattedtext);
		}
	};
}

// (6:12) {#if isChecked}
function create_if_block_2$2(ctx) {
	let div3;
	let div2;
	let t;
	let span;
	let formattedtext;
	let current;
	formattedtext = new FormattedText({ props: { block: /*block*/ ctx[0] } });

	return {
		c() {
			div3 = element("div");
			div2 = element("div");
			div2.innerHTML = `<div class="notion-list-icon"><div class="notion-checkbox checked"><svg viewBox="0 0 14 14"><polygon points="5.5 11.9993304 14 3.49933039 12.5 2 5.5 8.99933039 1.5 4.9968652 0 6.49933039"></polygon></svg></div></div>`;
			t = space();
			span = element("span");
			create_component(formattedtext.$$.fragment);
			attr(div2, "class", "notion-list-icon-container");
			attr(span, "class", "notion-checked");
			attr(div3, "class", "notion-list-item");
		},
		m(target, anchor) {
			insert(target, div3, anchor);
			append(div3, div2);
			append(div3, t);
			append(div3, span);
			mount_component(formattedtext, span, null);
			current = true;
		},
		p(ctx, dirty) {
			const formattedtext_changes = {};
			if (dirty & /*block*/ 1) formattedtext_changes.block = /*block*/ ctx[0];
			formattedtext.$set(formattedtext_changes);
		},
		i(local) {
			if (current) return;
			transition_in(formattedtext.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formattedtext.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div3);
			destroy_component(formattedtext);
		}
	};
}

// (37:4) {#if block.content}
function create_if_block$3(ctx) {
	let ul;
	let current;
	const default_slot_template = /*#slots*/ ctx[6].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

	return {
		c() {
			ul = element("ul");
			if (default_slot) default_slot.c();
			attr(ul, "class", "notion-list notion-list-todo");
		},
		m(target, anchor) {
			insert(target, ul, anchor);

			if (default_slot) {
				default_slot.m(ul, null);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[5],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
						null
					);
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(ul);
			if (default_slot) default_slot.d(detaching);
		}
	};
}

function create_fragment$4(ctx) {
	let ul;
	let t;
	let ul_id_value;
	let current;
	let if_block0 = /*block*/ ctx[0].properties && create_if_block_1$2(ctx);
	let if_block1 = /*block*/ ctx[0].content && create_if_block$3(ctx);

	return {
		c() {
			ul = element("ul");
			if (if_block0) if_block0.c();
			t = space();
			if (if_block1) if_block1.c();
			attr(ul, "id", ul_id_value = `_block-${/*block*/ ctx[0].id}`);
			attr(ul, "class", "notion-list notion-list-todo");
		},
		m(target, anchor) {
			insert(target, ul, anchor);
			if (if_block0) if_block0.m(ul, null);
			append(ul, t);
			if (if_block1) if_block1.m(ul, null);
			current = true;
		},
		p(ctx, [dirty]) {
			if (/*block*/ ctx[0].properties) {
				if (if_block0) {
					if_block0.p(ctx, dirty);

					if (dirty & /*block*/ 1) {
						transition_in(if_block0, 1);
					}
				} else {
					if_block0 = create_if_block_1$2(ctx);
					if_block0.c();
					transition_in(if_block0, 1);
					if_block0.m(ul, t);
				}
			} else if (if_block0) {
				group_outros();

				transition_out(if_block0, 1, 1, () => {
					if_block0 = null;
				});

				check_outros();
			}

			if (/*block*/ ctx[0].content) {
				if (if_block1) {
					if_block1.p(ctx, dirty);

					if (dirty & /*block*/ 1) {
						transition_in(if_block1, 1);
					}
				} else {
					if_block1 = create_if_block$3(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(ul, null);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}

			if (!current || dirty & /*block*/ 1 && ul_id_value !== (ul_id_value = `_block-${/*block*/ ctx[0].id}`)) {
				attr(ul, "id", ul_id_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block1);
			current = true;
		},
		o(local) {
			transition_out(if_block0);
			transition_out(if_block1);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(ul);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
		}
	};
}

function instance$4($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { block = {} } = $$props;
	let { blocks = [] } = $$props;
	let { fullPage = null } = $$props;
	let { api = null } = $$props;
	let isChecked = block.properties.checked && block.properties.checked[0] == 'Yes';

	$$self.$$set = $$props => {
		if ('block' in $$props) $$invalidate(0, block = $$props.block);
		if ('blocks' in $$props) $$invalidate(2, blocks = $$props.blocks);
		if ('fullPage' in $$props) $$invalidate(3, fullPage = $$props.fullPage);
		if ('api' in $$props) $$invalidate(4, api = $$props.api);
		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
	};

	return [block, isChecked, blocks, fullPage, api, $$scope, slots];
}

class Todo extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$4, create_fragment$4, safe_not_equal, { block: 0, blocks: 2, fullPage: 3, api: 4 });
	}
}

/* src/components/SyncedBlock.svelte generated by Svelte v3.49.0 */

function create_else_block$1(ctx) {
	let render;
	let current;

	render = new Render({
			props: {
				id: `_block-${/*block*/ ctx[0].id}`,
				fullPage: /*fullPage*/ ctx[2],
				blocks: /*blocks*/ ctx[1],
				api: /*api*/ ctx[3],
				block: /*blocks*/ ctx[1].find(/*func*/ ctx[7])
			}
		});

	return {
		c() {
			create_component(render.$$.fragment);
		},
		m(target, anchor) {
			mount_component(render, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const render_changes = {};
			if (dirty & /*block*/ 1) render_changes.id = `_block-${/*block*/ ctx[0].id}`;
			if (dirty & /*fullPage*/ 4) render_changes.fullPage = /*fullPage*/ ctx[2];
			if (dirty & /*blocks*/ 2) render_changes.blocks = /*blocks*/ ctx[1];
			if (dirty & /*api*/ 8) render_changes.api = /*api*/ ctx[3];
			if (dirty & /*blocks, pointer*/ 18) render_changes.block = /*blocks*/ ctx[1].find(/*func*/ ctx[7]);
			render.$set(render_changes);
		},
		i(local) {
			if (current) return;
			transition_in(render.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(render.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(render, detaching);
		}
	};
}

// (2:4) {#if block.type == 'transclusion_container'}
function create_if_block$2(ctx) {
	let current;
	const default_slot_template = /*#slots*/ ctx[6].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

	return {
		c() {
			if (default_slot) default_slot.c();
		},
		m(target, anchor) {
			if (default_slot) {
				default_slot.m(target, anchor);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[5],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
						null
					);
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (default_slot) default_slot.d(detaching);
		}
	};
}

function create_fragment$3(ctx) {
	let div;
	let current_block_type_index;
	let if_block;
	let current;
	const if_block_creators = [create_if_block$2, create_else_block$1];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*block*/ ctx[0].type == 'transclusion_container') return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			div = element("div");
			if_block.c();
			attr(div, "class", "notion-syncedblock");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if_blocks[current_block_type_index].m(div, null);
			current = true;
		},
		p(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				} else {
					if_block.p(ctx, dirty);
				}

				transition_in(if_block, 1);
				if_block.m(div, null);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if_blocks[current_block_type_index].d();
		}
	};
}

function instance$3($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { block = {} } = $$props;
	let { blocks = [] } = $$props;
	let { fullPage = false } = $$props;
	let { api } = $$props;
	let pointer;

	if (block.type !== 'transclusion_container') {
		pointer = block.format.transclusion_reference_pointer;
	}

	const func = el => el.id == pointer.id;

	$$self.$$set = $$props => {
		if ('block' in $$props) $$invalidate(0, block = $$props.block);
		if ('blocks' in $$props) $$invalidate(1, blocks = $$props.blocks);
		if ('fullPage' in $$props) $$invalidate(2, fullPage = $$props.fullPage);
		if ('api' in $$props) $$invalidate(3, api = $$props.api);
		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
	};

	return [block, blocks, fullPage, api, pointer, $$scope, slots, func];
}

class SyncedBlock extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$3, create_fragment$3, safe_not_equal, { block: 0, blocks: 1, fullPage: 2, api: 3 });
	}
}

/* src/components/Table.svelte generated by Svelte v3.49.0 */

function get_each_context$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[9] = list[i];
	child_ctx[12] = i;
	const constants_0 = /*getRows*/ child_ctx[1](/*row*/ child_ctx[9], /*block*/ child_ctx[0]);
	child_ctx[10] = constants_0;
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[13] = list[i];
	child_ctx[15] = i;
	return child_ctx;
}

// (51:12) {#each rows as col, j}
function create_each_block_1(ctx) {
	let td;
	let t_value = /*col*/ ctx[13].content + "";
	let t;
	let td_style_value;

	return {
		c() {
			td = element("td");
			t = text(t_value);
			attr(td, "style", td_style_value = "width:" + /*col*/ ctx[13].width + "px");
			toggle_class(td, "header", /*block*/ ctx[0].format['table_block_column_header'] && /*j*/ ctx[15] == 0);
		},
		m(target, anchor) {
			insert(target, td, anchor);
			append(td, t);
		},
		p(ctx, dirty) {
			if (dirty & /*block*/ 1 && t_value !== (t_value = /*col*/ ctx[13].content + "")) set_data(t, t_value);

			if (dirty & /*block*/ 1 && td_style_value !== (td_style_value = "width:" + /*col*/ ctx[13].width + "px")) {
				attr(td, "style", td_style_value);
			}

			if (dirty & /*block*/ 1) {
				toggle_class(td, "header", /*block*/ ctx[0].format['table_block_column_header'] && /*j*/ ctx[15] == 0);
			}
		},
		d(detaching) {
			if (detaching) detach(td);
		}
	};
}

// (48:8) {#each block.content as row, i}
function create_each_block$1(ctx) {
	let tr;
	let t;
	let each_value_1 = /*rows*/ ctx[10];
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	return {
		c() {
			tr = element("tr");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t = space();
			toggle_class(tr, "header", /*block*/ ctx[0].format['table_block_row_header'] && /*i*/ ctx[12] == 0);
		},
		m(target, anchor) {
			insert(target, tr, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(tr, null);
			}

			append(tr, t);
		},
		p(ctx, dirty) {
			if (dirty & /*getRows, block*/ 3) {
				each_value_1 = /*rows*/ ctx[10];
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(tr, t);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_1.length;
			}

			if (dirty & /*block*/ 1) {
				toggle_class(tr, "header", /*block*/ ctx[0].format['table_block_row_header'] && /*i*/ ctx[12] == 0);
			}
		},
		d(detaching) {
			if (detaching) detach(tr);
			destroy_each(each_blocks, detaching);
		}
	};
}

function create_fragment$2(ctx) {
	let t;
	let div;
	let figure;
	let table;
	let tbody;
	let div_id_value;
	let current;
	let if_block = false ;
	let each_value = /*block*/ ctx[0].content;
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
	}

	return {
		c() {
			t = space();
			div = element("div");
			figure = element("figure");
			table = element("table");
			tbody = element("tbody");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(figure, "class", "notion-collection-figure");
			attr(div, "class", "notion-simpleTable");
			attr(div, "id", div_id_value = /*block*/ ctx[0].id);
		},
		m(target, anchor) {
			insert(target, t, anchor);
			insert(target, div, anchor);
			append(div, figure);
			append(figure, table);
			append(table, tbody);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(tbody, null);
			}

			current = true;
		},
		p(ctx, [dirty]) {

			if (dirty & /*block, getRows*/ 3) {
				each_value = /*block*/ ctx[0].content;
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$1(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block$1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(tbody, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}

			if (!current || dirty & /*block*/ 1 && div_id_value !== (div_id_value = /*block*/ ctx[0].id)) {
				attr(div, "id", div_id_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(t);
			if (detaching) detach(div);
			destroy_each(each_blocks, detaching);
		}
	};
}

function instance$2($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { block = {} } = $$props;
	let { api = null } = $$props;
	let { tableData = null } = $$props;
	let { blocks } = $$props;

	// export let classes = ''
	// export let columns
	function getRows(blockId, tBlock) {
		const block = blocks.find(b => b?.id == blockId);
		const format = tBlock.format['table_block_column_format']; // object of column widths
		const order = tBlock.format['table_block_column_order']; // array of column order
		const rows = [];

		order.map(col => {
			rows.push({
				width: format && format?.[col]?.width,
				content: (block?.properties?.[col])
				? block?.properties?.[col]?.[0]
				: ''
			});
		});

		return rows;
	}

	$$self.$$set = $$props => {
		if ('block' in $$props) $$invalidate(0, block = $$props.block);
		if ('api' in $$props) $$invalidate(2, api = $$props.api);
		if ('tableData' in $$props) $$invalidate(3, tableData = $$props.tableData);
		if ('blocks' in $$props) $$invalidate(4, blocks = $$props.blocks);
		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
	};

	return [block, getRows, api, tableData, blocks, $$scope, slots];
}

class Table extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
			block: 0,
			api: 2,
			tableData: 3,
			blocks: 4
		});
	}
}

/* src/subcomponents/Render.svelte generated by Svelte v3.49.0 */

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[5] = list[i];
	return child_ctx;
}

// (2:0) {#if Object.keys(components).includes(block.type)}
function create_if_block$1(ctx) {
	let switch_instance;
	let switch_instance_anchor;
	let current;
	var switch_value = /*components*/ ctx[4][/*block*/ ctx[0].type];

	function switch_props(ctx) {
		return {
			props: {
				api: /*api*/ ctx[3],
				blocks: /*blocks*/ ctx[1],
				block: /*block*/ ctx[0],
				fullPage: /*fullPage*/ ctx[2],
				$$slots: { default: [create_default_slot] },
				$$scope: { ctx }
			}
		};
	}

	if (switch_value) {
		switch_instance = new switch_value(switch_props(ctx));
	}

	return {
		c() {
			if (switch_instance) create_component(switch_instance.$$.fragment);
			switch_instance_anchor = empty();
		},
		m(target, anchor) {
			if (switch_instance) {
				mount_component(switch_instance, target, anchor);
			}

			insert(target, switch_instance_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const switch_instance_changes = {};
			if (dirty & /*api*/ 8) switch_instance_changes.api = /*api*/ ctx[3];
			if (dirty & /*blocks*/ 2) switch_instance_changes.blocks = /*blocks*/ ctx[1];
			if (dirty & /*block*/ 1) switch_instance_changes.block = /*block*/ ctx[0];
			if (dirty & /*fullPage*/ 4) switch_instance_changes.fullPage = /*fullPage*/ ctx[2];

			if (dirty & /*$$scope, block, fullPage, blocks, api*/ 271) {
				switch_instance_changes.$$scope = { dirty, ctx };
			}

			if (switch_value !== (switch_value = /*components*/ ctx[4][/*block*/ ctx[0].type])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(switch_instance_anchor);
			if (switch_instance) destroy_component(switch_instance, detaching);
		}
	};
}

// (9:8) {#if block.content}
function create_if_block_1$1(ctx) {
	let each_1_anchor;
	let current;
	let each_value = /*block*/ ctx[0].content;
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},
		m(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert(target, each_1_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if (dirty & /*fullPage, blocks, api, search, block*/ 15) {
				each_value = /*block*/ ctx[0].content;
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				group_outros();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			destroy_each(each_blocks, detaching);
			if (detaching) detach(each_1_anchor);
		}
	};
}

// (11:12) {#if search(subblock, blocks)}
function create_if_block_2$1(ctx) {
	let render;
	let current;

	render = new Render({
			props: {
				fullPage: /*fullPage*/ ctx[2],
				blocks: /*blocks*/ ctx[1],
				api: /*api*/ ctx[3],
				block: search(/*subblock*/ ctx[5], /*blocks*/ ctx[1])
			}
		});

	return {
		c() {
			create_component(render.$$.fragment);
		},
		m(target, anchor) {
			mount_component(render, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const render_changes = {};
			if (dirty & /*fullPage*/ 4) render_changes.fullPage = /*fullPage*/ ctx[2];
			if (dirty & /*blocks*/ 2) render_changes.blocks = /*blocks*/ ctx[1];
			if (dirty & /*api*/ 8) render_changes.api = /*api*/ ctx[3];
			if (dirty & /*block, blocks*/ 3) render_changes.block = search(/*subblock*/ ctx[5], /*blocks*/ ctx[1]);
			render.$set(render_changes);
		},
		i(local) {
			if (current) return;
			transition_in(render.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(render.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(render, detaching);
		}
	};
}

// (10:10) {#each block.content as subblock}
function create_each_block(ctx) {
	let show_if = search(/*subblock*/ ctx[5], /*blocks*/ ctx[1]);
	let if_block_anchor;
	let current;
	let if_block = show_if && create_if_block_2$1(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if (dirty & /*block, blocks*/ 3) show_if = search(/*subblock*/ ctx[5], /*blocks*/ ctx[1]);

			if (show_if) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*block, blocks*/ 3) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block_2$1(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

// (3:4) <svelte:component         this={components[block.type]}         {api}         {blocks}         {block}         {fullPage}>
function create_default_slot(ctx) {
	let if_block_anchor;
	let current;
	let if_block = /*block*/ ctx[0].content && create_if_block_1$1(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if (/*block*/ ctx[0].content) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*block*/ 1) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block_1$1(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function create_fragment$1(ctx) {
	let show_if = Object.keys(/*components*/ ctx[4]).includes(/*block*/ ctx[0].type);
	let if_block_anchor;
	let current;
	let if_block = show_if && create_if_block$1(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			if (dirty & /*block*/ 1) show_if = Object.keys(/*components*/ ctx[4]).includes(/*block*/ ctx[0].type);

			if (show_if) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*block*/ 1) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block$1(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	let { block = {} } = $$props;
	let { blocks = [] } = $$props;
	let { fullPage = false } = $$props;
	let { api } = $$props;

	// $: console.log('rendering block:', block, block.type)
	const components = {
		bookmark: Bookmark,
		bulleted_list: BulletedList,
		callout: Callout,
		code: Code,
		column: Column,
		column_list: ColumnList,
		divider: Divider,
		embed: Embed,
		pdf: Embed,
		file: Embed,
		header: Header,
		image: Image,
		numbered_list: NumberedList,
		page: Page,
		quote: Quote,
		sub_header: SubHeader,
		sub_sub_header: SubSubHeader,
		text: Text,
		toggle: Toggle,
		video: Video,
		tweet: Tweet,
		collection_view: Collection,
		to_do: Todo,
		transclusion_reference: SyncedBlock,
		transclusion_container: SyncedBlock,
		table: Table
	};

	$$self.$$set = $$props => {
		if ('block' in $$props) $$invalidate(0, block = $$props.block);
		if ('blocks' in $$props) $$invalidate(1, blocks = $$props.blocks);
		if ('fullPage' in $$props) $$invalidate(2, fullPage = $$props.fullPage);
		if ('api' in $$props) $$invalidate(3, api = $$props.api);
	};

	return [block, blocks, fullPage, api, components];
}

class Render extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { block: 0, blocks: 1, fullPage: 2, api: 3 });
	}
}

/* src/Notion.svelte generated by Svelte v3.49.0 */

function create_if_block(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block_1, create_if_block_2, create_else_block];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*blocks*/ ctx[1]) return 0;
		if (/*id*/ ctx[0] && browser && /*type*/ ctx[9] == 'page') return 1;
		return 2;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				} else {
					if_block.p(ctx, dirty);
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

// (100:4) {:else}
function create_else_block(ctx) {
	return {
		c: noop,
		m: noop,
		p: noop,
		i: noop,
		o: noop,
		d: noop
	};
}

// (81:46) 
function create_if_block_2(ctx) {
	let await_block_anchor;
	let promise;
	let current;

	let info = {
		ctx,
		current: null,
		token: null,
		hasCatch: true,
		pending: create_pending_block,
		then: create_then_block,
		catch: create_catch_block,
		value: 1,
		error: 14,
		blocks: [,,,]
	};

	handle_promise(promise = /*request*/ ctx[10], info);

	return {
		c() {
			await_block_anchor = empty();
			info.block.c();
		},
		m(target, anchor) {
			insert(target, await_block_anchor, anchor);
			info.block.m(target, info.anchor = anchor);
			info.mount = () => await_block_anchor.parentNode;
			info.anchor = await_block_anchor;
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			info.ctx = ctx;

			if (dirty & /*request*/ 1024 && promise !== (promise = /*request*/ ctx[10]) && handle_promise(promise, info)) ; else {
				update_await_block_branch(info, ctx, dirty);
			}
		},
		i(local) {
			if (current) return;
			transition_in(info.block);
			current = true;
		},
		o(local) {
			for (let i = 0; i < 3; i += 1) {
				const block = info.blocks[i];
				transition_out(block);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(await_block_anchor);
			info.block.d(detaching);
			info.token = null;
			info = null;
		}
	};
}

// (74:4) {#if blocks}
function create_if_block_1(ctx) {
	let render;
	let current;

	render = new Render({
			props: {
				fullPage: /*fullPage*/ ctx[2],
				blocks: /*blocks*/ ctx[1],
				api: /*api*/ ctx[4],
				siteSrc: /*siteSrc*/ ctx[3],
				block: /*blocks*/ ctx[1].find(func)
			}
		});

	return {
		c() {
			create_component(render.$$.fragment);
		},
		m(target, anchor) {
			mount_component(render, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const render_changes = {};
			if (dirty & /*fullPage*/ 4) render_changes.fullPage = /*fullPage*/ ctx[2];
			if (dirty & /*blocks*/ 2) render_changes.blocks = /*blocks*/ ctx[1];
			if (dirty & /*api*/ 16) render_changes.api = /*api*/ ctx[4];
			if (dirty & /*siteSrc*/ 8) render_changes.siteSrc = /*siteSrc*/ ctx[3];
			if (dirty & /*blocks*/ 2) render_changes.block = /*blocks*/ ctx[1].find(func);
			render.$set(render_changes);
		},
		i(local) {
			if (current) return;
			transition_in(render.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(render.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(render, detaching);
		}
	};
}

// (94:6) {:catch error}
function create_catch_block(ctx) {
	let t0;
	let t1;
	let t2;
	let t3;
	let t4;
	let br0;
	let br1;
	let t5;
	let t6_value = /*error*/ ctx[14] + "";
	let t6;

	return {
		c() {
			t0 = text("An error occurred trying to fetch: [");
			t1 = text(/*api*/ ctx[4]);
			t2 = text("/v1/page/");
			t3 = text(/*id*/ ctx[0]);
			t4 = text("]\n        ");
			br0 = element("br");
			br1 = element("br");
			t5 = text("\n        Error message:\n        ");
			t6 = text(t6_value);
		},
		m(target, anchor) {
			insert(target, t0, anchor);
			insert(target, t1, anchor);
			insert(target, t2, anchor);
			insert(target, t3, anchor);
			insert(target, t4, anchor);
			insert(target, br0, anchor);
			insert(target, br1, anchor);
			insert(target, t5, anchor);
			insert(target, t6, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*api*/ 16) set_data(t1, /*api*/ ctx[4]);
			if (dirty & /*id*/ 1) set_data(t3, /*id*/ ctx[0]);
			if (dirty & /*request*/ 1024 && t6_value !== (t6_value = /*error*/ ctx[14] + "")) set_data(t6, t6_value);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(t0);
			if (detaching) detach(t1);
			if (detaching) detach(t2);
			if (detaching) detach(t3);
			if (detaching) detach(t4);
			if (detaching) detach(br0);
			if (detaching) detach(br1);
			if (detaching) detach(t5);
			if (detaching) detach(t6);
		}
	};
}

// (86:6) {:then blocks}
function create_then_block(ctx) {
	let render;
	let current;

	render = new Render({
			props: {
				fullPage: /*fullPage*/ ctx[2],
				blocks: /*blocks*/ ctx[1],
				api: /*api*/ ctx[4],
				siteSrc: /*siteSrc*/ ctx[3],
				block: /*blocks*/ ctx[1].find(func_1)
			}
		});

	return {
		c() {
			create_component(render.$$.fragment);
		},
		m(target, anchor) {
			mount_component(render, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const render_changes = {};
			if (dirty & /*fullPage*/ 4) render_changes.fullPage = /*fullPage*/ ctx[2];
			if (dirty & /*request*/ 1024) render_changes.blocks = /*blocks*/ ctx[1];
			if (dirty & /*api*/ 16) render_changes.api = /*api*/ ctx[4];
			if (dirty & /*siteSrc*/ 8) render_changes.siteSrc = /*siteSrc*/ ctx[3];
			if (dirty & /*request*/ 1024) render_changes.block = /*blocks*/ ctx[1].find(func_1);
			render.$set(render_changes);
		},
		i(local) {
			if (current) return;
			transition_in(render.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(render.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(render, detaching);
		}
	};
}

// (82:22)          <div class="Notion-loading {loadingClasses}
function create_pending_block(ctx) {
	let div;
	let div_class_value;

	return {
		c() {
			div = element("div");
			attr(div, "class", div_class_value = "Notion-loading " + /*loadingClasses*/ ctx[7]);
		},
		m(target, anchor) {
			insert(target, div, anchor);
			div.innerHTML = /*loadingMsg*/ ctx[8];
		},
		p(ctx, dirty) {
			if (dirty & /*loadingMsg*/ 256) div.innerHTML = /*loadingMsg*/ ctx[8];
			if (dirty & /*loadingClasses*/ 128 && div_class_value !== (div_class_value = "Notion-loading " + /*loadingClasses*/ ctx[7])) {
				attr(div, "class", div_class_value);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

function create_fragment(ctx) {
	let div;
	let current;
	let if_block = (/*id*/ ctx[0] || /*blocks*/ ctx[1]) && /*doRender*/ ctx[5] && create_if_block(ctx);

	return {
		c() {
			div = element("div");
			if (if_block) if_block.c();
			attr(div, "class", /*classes*/ ctx[6]);
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if (if_block) if_block.m(div, null);
			current = true;
		},
		p(ctx, [dirty]) {
			if ((/*id*/ ctx[0] || /*blocks*/ ctx[1]) && /*doRender*/ ctx[5]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*id, blocks, doRender*/ 35) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(div, null);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}

			if (!current || dirty & /*classes*/ 64) {
				attr(div, "class", /*classes*/ ctx[6]);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (if_block) if_block.d();
		}
	};
}

const func = el => el.type == 'page';
const func_1 = el => el.type == 'page';

function instance($$self, $$props, $$invalidate) {
	let { fullPage = false } = $$props;
	let { siteSrc = "https://phagedirectory.notion.site" } = $$props;
	let { api = "//notion-cloudflare-worker.yawnxyz.workers.dev" } = $$props;
	let { id = null, doRender = true } = $$props;

	// console.log('id:', id)
	// if id includes url, only get the id
	if (id && id.includes("http")) {
		id = id.split("-").pop();
	} // console.log('id stripped:', id)

	let { classes = "notion", loadingClasses, loadingMsg = "Loading ...", headers = null, type = "page", results = null, loud = false, blocks = null } = $$props;
	let request = undefined;

	if (browser && !blocks) {
		if (loud) console.log(`[svelte-notion] ${api}/v1/${type}/${id}`);

		try {
			request = fetch(`${api}/v1/${type}/${id}`, headers).then(res => res.json()).then(json => {
				$$invalidate(11, results = json);
				return Object.values(json).map(el => el.value);
			}).then(json => {
				if (type == "page") {
					$$invalidate(1, blocks = json);
				} // page = blocks.find(el => el.type == 'page')

				return json;
			});
		} catch(e) {
			console.error(`[svelte-notion] Unable to fetch endpoint: ${api}/v1/${type}/${id}`);
		}
	} else {
		// server-side: silent
		if (loud) console.log(`[svelte-notion] blocks imported`);
	}

	$$self.$$set = $$props => {
		if ('fullPage' in $$props) $$invalidate(2, fullPage = $$props.fullPage);
		if ('siteSrc' in $$props) $$invalidate(3, siteSrc = $$props.siteSrc);
		if ('api' in $$props) $$invalidate(4, api = $$props.api);
		if ('id' in $$props) $$invalidate(0, id = $$props.id);
		if ('doRender' in $$props) $$invalidate(5, doRender = $$props.doRender);
		if ('classes' in $$props) $$invalidate(6, classes = $$props.classes);
		if ('loadingClasses' in $$props) $$invalidate(7, loadingClasses = $$props.loadingClasses);
		if ('loadingMsg' in $$props) $$invalidate(8, loadingMsg = $$props.loadingMsg);
		if ('headers' in $$props) $$invalidate(12, headers = $$props.headers);
		if ('type' in $$props) $$invalidate(9, type = $$props.type);
		if ('results' in $$props) $$invalidate(11, results = $$props.results);
		if ('loud' in $$props) $$invalidate(13, loud = $$props.loud);
		if ('blocks' in $$props) $$invalidate(1, blocks = $$props.blocks);
	};

	return [
		id,
		blocks,
		fullPage,
		siteSrc,
		api,
		doRender,
		classes,
		loadingClasses,
		loadingMsg,
		type,
		request,
		results,
		headers,
		loud
	];
}

class Notion extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance, create_fragment, safe_not_equal, {
			fullPage: 2,
			siteSrc: 3,
			api: 4,
			id: 0,
			doRender: 5,
			classes: 6,
			loadingClasses: 7,
			loadingMsg: 8,
			headers: 12,
			type: 9,
			results: 11,
			loud: 13,
			blocks: 1
		});
	}
}

export default Notion;
