<script>
	export let state$;
	
	$: value$ = state$.select(state => state.value);
</script>
<input bind:value={$value$} />