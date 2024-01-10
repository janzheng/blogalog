
<!-- source: https://tailwindcomponents.com/component/wip-hamburger-menu-animation -->
<script>
  export let open = true;

  export let classes = "text-slate-700 ";
  export let openClasses = "text-slate-900 ";
  export let menuSize = "w-10 h-10"; // default size
  export let crossSize = "w-5 h-0.5"; // default size
  export let crossSpacing = "1.5"; // default spacing

  // demo // pre-computed
  export let bigger = false;
  if(bigger) {
    menuSize = "w-14 h-14"; // bigger
    crossSize = "w-10 h-[5px]"; // bigger
    crossSpacing = "2.5"; // bigger
  }
</script>


<nav>
  <button class="{classes} {menuSize} {open? openClasses : ''} relative focus:outline-none" on:click={() => open = !open}>
    <span class="sr-only">Open main menu</span>
    <div class="block {crossSize} absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <span aria-hidden="true" class="block absolute {crossSize} bg-current transform transition duration-500 ease-in-out {open == false ? '-translate-y-'+crossSpacing : ''}" class:rotate-45={open} ></span>
      <span aria-hidden="true" class="block absolute {crossSize} bg-current transform transition duration-500 ease-in-out" class:opacity-0={open}></span>
      <span aria-hidden="true" class="block absolute {crossSize} bg-current transform transition duration-500 ease-in-out {open == false ? 'translate-y-'+crossSpacing : ''}" class:-rotate-45={open} class:translate-y-{crossSpacing}={!open}></span>
    </div>
  </button>
</nav>