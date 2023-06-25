

<!-- desktop nav -->
<script>
  export let logo, page
  // import { prefetch, prefetchRoutes } from '$app/navigation'

  // prefetch('/blog') // Loads the blog page in the background
  // prefetchRoutes() // Loads ALL routes in the background
</script>

<!-- <header class="menu-desktop hidden sm:block relative max-w-7xl mx-auto max-w-7xl md:flex items-center leading-6"> -->
<header class="menu-desktop hidden sm:block sm:visible sm:relative _content md:flex content-center items-center leading-6">
  <div class="p-8 pr-8 md:mr-8 border-r border-r-white border-r-half">
    <a data-sveltekit-prefetch class="decoration-transparent hover:fill-_hover" href='/'>
      <img src={logo} alt="SvelteKit" width="80" />
    </a>
  </div>

  <nav class="menu-items relative md:flex flex-1 justify-center content-center items-center flex-wrap md:gap-4 justify-between w-full px-8 md:pl-0 md:pr-8">
    <ul class="menu-items-left text-lg md:space-x-4 md:flex flex-row place-content-end pr-8 list-none">
      <li class:active={$page.url.pathname === '/'}><a data-sveltekit-prefetch href="/">Home</a></li>
      <li class:active={$page.url.pathname === '/playground'}><a data-sveltekit-prefetch href="/playground">Playground</a></li>
      <li class:active={$page.url.pathname === '/deta/upload'}><a data-sveltekit-prefetch href="/deta/upload">Upload example</a></li>
      <li class:active={$page.url.pathname === '/todos'}><a data-sveltekit-prefetch href="/todos">Todos</a></li>
    </ul>
    <ul class="menu-items-right text-lg md:space-x-4 md:flex flex-row items-baseline place-content-end mt-8 md:mt-0">
      <a href="/">Right side item</a>
    </ul>
  </nav>

  <div class="corner">
    <!-- TODO put something else here? github link? -->
  </div>
</header>








