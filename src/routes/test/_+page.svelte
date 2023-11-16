
<script>
  export let data;

  // console.log('data:', data)
</script>

<div class="flex flex-col p-5">
  <h1 class="text-2xl font-bold mb-5">Parameters:</h1>
  {#each Object.entries(data.params) as [key, value]}
    <div class="flex justify-between border-b border-gray-200 py-2">
      <span class="font-medium text-gray-700">{key}</span>
      <span class="text-gray-500">{value}</span>
    </div>
  {/each}
</div>