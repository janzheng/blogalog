

<!-- desktop nav -->
<script>
  export let logo, page
</script>

<header>
	<div class="corner">
		<a href="https://kit.svelte.dev">
			<img src={logo} alt="SvelteKit" />
		</a>
	</div>

	<nav>
		<ul>
			<li class:active={$page.url.pathname === '/'}><a data-sveltekit-prefetch href="/">Home</a></li>
			<li class:active={$page.url.pathname === '/about'}><a data-sveltekit-prefetch href="/about">About</a></li>
			<li class:active={$page.url.pathname === '/todos'}><a data-sveltekit-prefetch href="/todos">Todos</a></li>
		</ul>
	</nav>

	<div class="corner">
		<!-- TODO put something else here? github link? -->
	</div>
</header>

  