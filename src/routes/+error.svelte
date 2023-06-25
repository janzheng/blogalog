
<script>
  import { page } from '$app/stores';
</script>


<div class="_content">

  <h1>Error: {$page?.status}</h1>

  <div class="mb-2">
    {$page?.error.message && Object.entries($page?.error.message).length > 0 ? JSON.stringify($page?.error.message) : ''}
  </div>

  {#if $page?.error.stack}
    <pre class="bg-gray-100 rounded-md p-4">
      {$page?.error.stack}
    </pre>
  {/if}

</div>