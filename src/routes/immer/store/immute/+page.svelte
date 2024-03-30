<script>
	/*
	Try turning <svelte:options immutable={true}/> off and on inside ViewSide.svelte.
	Note how editing one side no longer effects the other side when immutable is turned on.
	*/
	import { immerStore } from 'svelte-immer-store';
	import ViewSide from './ViewSide.svelte';
	import EditSide from './EditSide.svelte';
	
	const state$ = immerStore({
		lhs: {
			value: 'lhs value'
		},
		rhs: {
			value: 'rhs value'
		}
	});
</script>


<div class="grid grid-cols-2">
  <fieldset>
    <legend>view lhs</legend>
    <ViewSide state={$state$.lhs} />
  </fieldset>
  <fieldset>
    <legend>view rhs</legend>
    <ViewSide state={$state$.rhs} />
  </fieldset>
</div>


<div class="grid grid-cols-2">
  <fieldset>
    <legend>edit lhs</legend>
    <EditSide state$={state$.select(state => state.lhs)} />
  </fieldset>
  <fieldset>
    <legend>edit rhs</legend>
    <EditSide state$={state$.select(state => state.rhs)} />
  </fieldset>
</div>

<div class="mt-12">
  <pre>{JSON.stringify($state$)}</pre>
</div>