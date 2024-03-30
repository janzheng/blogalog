<svelte:options immutable={true}/> <!-- try turning me off and on! -->
<script>
	export let state;
	
	let changeCount = 0;
	$:(() => {
		++changeCount;
	})(state);
</script>
<label>Value:<output>{state.value}</output></label>
<label>Change Count: <output>{changeCount}</output></label>
