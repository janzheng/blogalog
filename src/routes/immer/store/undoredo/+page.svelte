<!-- 

  https://svelte.dev/repl/36bc342889c34e70857b012f58caaa67?version=3.38.2 
  https://github.com/WHenderson/svelte-immer-store?tab=readme-ov-file 

  this one has a timed undo / redo: https://svelte.dev/repl/a8cd6cc371604d44902f01bd18fe29a2?version=4.2.12  

 -->

<script>
  import { writable, get } from 'svelte/store';
	import { immerStore, History } from 'svelte-immer-store';
	import {noop} from "svelte/internal";
	
	const history = new History();
	const state$ = immerStore({
		a: 1,
		b: 'string',
		c: 'default',
		d: true
	}, noop, history.enqueue);
	
	
	const a$ = state$.select(state => state.a);
	const b$ = state$.select(state => state.b);
	const c$ = state$.select(state => state.c);
	const d$ = state$.select(state => state.d);
	
	const {canUndo$, canRedo$, index$, count$, _state$} = history;
</script>

<input type=number bind:value={$a$} />
<input type=text bind:value={$b$} />
<select bind:value={$c$}>
	<option value="default">Default</option>
	<option value="X">Option X</option>
	<option value="Y">Option Y</option>
	<option value="Z">Option Z</option>
</select>
<input type="checkbox" bind:checked={$d$} />
<pre>{JSON.stringify($state$)}</pre>
<fieldset>
	<legend>History</legend>
	<button disabled={!$canUndo$} on:click={() => history.undo()}>undo</button>
	<button disabled={!$canRedo$} on:click={() => history.redo()}>redo</button>
	<output>{$index$}/{$count$}</output>
</fieldset>
