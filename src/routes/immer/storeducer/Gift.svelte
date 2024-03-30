
<script>
  export let gift = {};
  export let currentUser = {};
  export let users
  export let handleReserve = () => {};

</script>


<div class="gift | grid grid-cols-3 gap-8" class:reserved={gift.reservedBy}>
  <img class="w-16 h-16" src="{gift.image}" alt="{gift.description}" />
  <div class="description">
    {gift.description}
  </div>
  <div class="reservation">
    {#if gift.reservedBy === undefined}
      <button on:click={handleReserve(gift.id)}>Reserve</button>
    {:else if gift.reservedBy === currentUser.id}
      <button on:click={handleReserve(gift.id)}>Unreserve</button>
    {:else}
      <p>Reserved by {users[gift?.reservedBy]?.name}</p>
    {/if}
  </div>
</div>